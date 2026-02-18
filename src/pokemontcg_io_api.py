import json
import logging
import os
import html

import requests
from card import Card
from pokedex_generations import PokedexGenerations
from set import Set

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class PokemonTcgIoApi:
    def __init__(self):
        self.data_path = os.path.join(os.path.dirname(__file__), 'data')
        self.sets_file = os.path.join(self.data_path, 'sets', 'en.json')
        self.cards_dir = os.path.join(self.data_path, 'cards', 'en')

    def get_cards(self,
                  pokedex_number: int | None = None,
                  generation: int | None = None,
                  set_ids: list[str] | None = None,
                  series_ids: list[str] | None = None) -> list[Card]:
        """
        Fetch a list of Pokémon cards based on criteria from local data files.
        """
        all_cards = []
        set_data = self.get_sets()
        
        # Determine which sets to look into
        target_set_ids = []
        if set_ids:
            target_set_ids.extend(set_ids)
        
        if series_ids:
            matching_sets = [s.id for s in set_data if s.series in series_ids]
            target_set_ids.extend(matching_sets)
        
        # If no specific sets/series are requested, we might need to check all sets 
        # especially if pokedex_number or generation is provided.
        sets_to_scan = []
        if target_set_ids:
            target_set_ids = list(set(target_set_ids)) # Unique set IDs
            sets_to_scan = [s for s in set_data if s.id in target_set_ids]
        else:
            sets_to_scan = set_data

        total_sets = len(sets_to_scan)
        for i, s in enumerate(sets_to_scan):
            card_file = os.path.join(self.cards_dir, f"{s.id}.json")
            if not os.path.exists(card_file):
                continue
            
            with open(card_file, 'r', encoding='utf-8') as f:
                cards_json = json.load(f)
            
            for card_json in cards_json:
                # Filter by pokedex_number
                card_pokedex_numbers = card_json.get('nationalPokedexNumbers', [])
                if pokedex_number and pokedex_number not in card_pokedex_numbers:
                    continue
                
                # Filter by generation
                if generation:
                    gen_range = PokedexGenerations.get_cards_by_generation(generation)
                    if not any(num in gen_range for num in card_pokedex_numbers):
                        continue
                
                card_pokedex_number = card_pokedex_numbers[0] if card_pokedex_numbers else pokedex_number
                
                # Determine available variants based on rarity
                rarity = card_json.get('rarity', '')
                variants = []
                
                # Holofoil only: High-end rarities and special card types that don't have reverse holos
                holofoil_only_rarities = [
                    "Illustration Rare", 
                    "Special Illustration Rare", 
                    "Ultra Rare",
                    "Hyper Rare",
                    "Double Rare",
                    "Radiant Rare",
                    "Amazing Rare",
                    "Rare Shiny GX",
                    "Shiny Ultra Rare",
                    "ACE SPEC Rare"
                ]
                
                if rarity in holofoil_only_rarities or any(x in rarity for x in ["VMAX", "VSTAR", " V", "EX", "GX", "BREAK", "Prism Star"]):
                    variants = [Card.HOLOFOIL]
                elif "Rare" in rarity:
                    # Includes "Rare", "Rare Holo", etc. 
                    # These typically have both a Holofoil (if Rare Holo) and a Reverse Holofoil version.
                    # For standard "Rare", it's usually Normal and Reverse, but many users treat all 
                    # Rare+ as potential Holos in proxy contexts.
                    # Following the previous rule: Holo + Reverse for anything with "Rare" in name
                    variants = [Card.HOLOFOIL, Card.REVERSE_HOLOFOIL]
                else:
                    # Common, Uncommon, Trainer, etc.
                    variants = [Card.NORMAL_HOLOFOIL, Card.REVERSE_HOLOFOIL]
                
                for holo_type in variants:
                    card_info = self.get_card_from_data(card_json, s, card_pokedex_number, holo_type)
                    all_cards.append(card_info)

            # Update progress
            if (i + 1) % 10 == 0 or (i + 1) == total_sets:
                logger.info(f"Progress: {i + 1}/{total_sets} sets processed")

        return all_cards

    @staticmethod
    def get_card_from_data(card, card_set, pokedex_number, holo_type):
        return Card(
            set_id=card_set.id,
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
            generation=PokedexGenerations.get_generation_by_card_number(pokedex_number)
        )

    def get_sets(self) -> list[Set]:
        if not os.path.exists(self.sets_file):
            logger.error(f"Sets file not found at {self.sets_file}")
            return []
            
        with open(self.sets_file, 'r', encoding='utf-8') as f:
            sets_json = json.load(f)
            
        results = []
        for s in sets_json:
            set_info = Set(
                id=s['id'],
                name=s.get('name'),
                release_date=s.get('releaseDate'),
                symbol_url=s.get('images', {}).get('symbol'),
                logo_url=s.get('images', {}).get('logo'),
                printed_total=s.get('printedTotal'),
                series=s.get('series'),
                total=s.get('total')
            )
            results.append(set_info)
        return results
