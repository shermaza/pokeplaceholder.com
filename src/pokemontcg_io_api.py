import json
import logging
import os
import html

import boto3
import requests
from card import Card
from pokedex_generations import PokedexGenerations
from set import Set

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class PokemonTcgIoApi:
    def __init__(self):
        self.api_key = os.getenv("POKEMONTCG_IO_API_KEY", "Environment variable not set")
        self.card_url = "https://api.pokemontcg.io/v2/cards/?q="
        self.set_url = "https://api.pokemontcg.io/v2/sets/"
        self.apigateway = boto3.client('apigatewaymanagementapi',
                                  endpoint_url=os.environ['WEBSOCKET_ENDPOINT'].replace('wss://', 'https://'))

    def get_cards(self,
                  connection_id: str,
                  pokedex_number: int | None = None,
                  generation: int | None = None,
                  set_ids: list[str] | None = None,
                  series_ids: list[str] | None = None) -> list[Card]:
        """
        Fetch a list of Pokémon cards based on a given Pokédex number. The method retrieves card data from an external API and
        enhances it with additional set-related details. The data includes information about card rarity, associated set, market prices, and more.

        :param series_ids: the pokemontcg.io series name to filter by
        :param set_ids:  the pokemontcg.io set id to filter by
        :param generation: The generation for which cards are retrieved. Defaults to None if not provided.
        :param pokedex_number: The national Pokédex number for which cards are retrieved. Defaults to None if not provided.
        :type pokedex_number: int | None
        :return: A list of Card objects representing Pokémon TCG cards associated with the specified Pokédex number
                 enriched with set-specific details and pricing information.
        :rtype: list[Card]
        """
        cards = []
        set_data = self.get_sets()
        headers = {"X-Api-Key": self.api_key}
        url = self.card_url

        # Filter the API by national pokedex number if necessary
        if pokedex_number:
            url = f"{self.card_url}nationalPokedexNumbers:{pokedex_number}"
        elif generation:
            start = PokedexGenerations.get_cards_by_generation(generation)[0]
            end = PokedexGenerations.get_cards_by_generation(generation)[-1]
            url = f"{self.card_url}nationalPokedexNumbers:[{start} TO {end}]"

        # Filter the API by set ID (series ID is extrapolated to a list of set IDs)
        if series_ids is not None and len(series_ids) > 0:
            if set_ids is None:
                set_ids = []
            for series_id in series_ids:
                matching_sets = [s.id for s in set_data if s.series == series_id]
                set_ids.extend(matching_sets)
        
        if set_ids is not None and len(set_ids) > 0:
            set_filter = " OR ".join([f"set.id:{set_id}" for set_id in set_ids])
            url += f" ({set_filter})"

        # Grab all cards into memory via pagination
        page = 1
        while True:
            paginated_url = f"{url}&page={page}"
            logger.info(f"Fetching cards from {paginated_url}")
            response = requests.get(paginated_url, headers=headers)
            if response.status_code != 200:
                logger.error(f"Failed to fetch cards. Status code: {response.status_code}, Response: {response.text}")
                break
        
            data = response.json()
            cards += self.fetch_card_data(pokedex_number, response, set_data)
        
            total_count = data.get('totalCount', 0)
            page_size = data.get('pageSize', 0)
            if page * page_size >= total_count:
                break

            self.apigateway.post_to_connection(
                ConnectionId=connection_id,
                Data=json.dumps({
                    'action': 'file_progress',
                    'progress': page * page_size,
                    'total': total_count
                })
            )

            page += 1

        return cards

    def fetch_card_data(self, pokedex_number, response, set_data):
        cards = []
        if response.status_code == 200:
            data = response.json()
            for card in data['data']:
                card_set = next((s for s in set_data if s.id == card['set']['id']), {})
                normal_market = card.get('tcgplayer', {}).get('prices', {}).get('normal', {}).get('market', None)
                holo_reverse_market = card.get('tcgplayer', {}).get('prices', {}).get('reverseHolofoil', {}).get(
                    'market', None)
                holo_market = card.get('tcgplayer', {}).get('prices', {}).get('holofoil', {}).get('market', None)
                

                if normal_market is not None:
                    card_info = self.get_card_from_api_data(card, card_set, normal_market, 
                                                            card['nationalPokedexNumbers'][0] if 'nationalPokedexNumbers' in card and card['nationalPokedexNumbers'] else pokedex_number,
                                                            Card.NORMAL_HOLOFOIL)
                    cards.append(card_info)

                if holo_reverse_market is not None:
                    card_info = self.get_card_from_api_data(card, card_set, holo_reverse_market,
                                                            card['nationalPokedexNumbers'][0] if 'nationalPokedexNumbers' in card and card['nationalPokedexNumbers'] else pokedex_number,
                                                            Card.REVERSE_HOLOFOIL)
                    cards.append(card_info)

                if holo_market is not None:
                    card_info = self.get_card_from_api_data(card, card_set, holo_market,
                                                            card['nationalPokedexNumbers'][0] if 'nationalPokedexNumbers' in card and card['nationalPokedexNumbers'] else pokedex_number,
                                                            Card.HOLOFOIL)
                    cards.append(card_info)
        else:
            logger.error(f"Failed to fetch cards. Status code: {response.status_code}, Response: {response.text}")

        return cards

    @staticmethod
    def get_card_from_api_data(card, card_set, market, pokedex_number, holo_type):
        card_info = Card(
            set_id=card['set']['id'],
            set_name=card_set.name if card_set.name else 'Unknown',
            series_name=card_set.series if card_set.series else 'Unknown',
            release_date=card_set.release_date if card_set.release_date else 'Unknown',
            total_cards=card_set.total if card_set.total else 0,
            national_pokedex_number=pokedex_number,
            number=card['number'],
            name=card['name'],
            rarity=card.get('rarity', 'N/A'),
            card_id=card['id'],
            image_url=card['images']['small'],
            holo=holo_type,
            market=market,
            generation=PokedexGenerations.get_generation_by_card_number(pokedex_number)
        )
        return card_info

    def get_sets(self) -> list[Set]:
        results: list[Set] = []
        headers = {"X-Api-Key": self.api_key}
        response = requests.get(self.set_url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            for s in data['data']:
                set_info = Set(
                    id=s['id'],
                    name=s.get('name'),
                    release_date=s.get('releaseDate'),
                    symbol_url=s['images']['symbol'],
                    logo_url=s['images']['logo'],
                    printed_total=s.get('printedTotal'),
                    series=s.get('series'),
                    total=s.get('total')
                )
                results.append(set_info)
        return results
