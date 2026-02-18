import unittest
from unittest.mock import patch, mock_open
import json
import os
from pokemontcg_io_api import PokemonTcgIoApi

class TestPokemonTcgIoApi(unittest.TestCase):
    def setUp(self):
        self.api = PokemonTcgIoApi()

    @patch("os.path.exists")
    @patch("builtins.open", new_callable=mock_open, read_data='[{"id": "base1", "name": "Base", "series": "Base", "releaseDate": "1999/01/09", "total": 102}]')
    def test_get_sets(self, mock_file, mock_exists):
        mock_exists.return_value = True
        sets = self.api.get_sets()
        self.assertEqual(len(sets), 1)
        self.assertEqual(sets[0].id, "base1")
        self.assertEqual(sets[0].name, "Base")

    @patch("os.path.exists")
    @patch("pokemontcg_io_api.PokemonTcgIoApi.get_sets")
    def test_get_cards_filtering(self, mock_get_sets, mock_exists):
        from set import Set
        mock_get_sets.return_value = [
            Set(id="base1", name="Base", series="Base", release_date="1999/01/09", total=102)
        ]
        mock_exists.return_value = True
        
        card_data = [
            {
                "id": "base1-4",
                "name": "Charizard",
                "number": "4",
                "nationalPokedexNumbers": [6],
                "rarity": "Rare Holo",
                "images": {"small": "url"}
            },
            {
                "id": "base1-1",
                "name": "Alakazam",
                "number": "1",
                "nationalPokedexNumbers": [65],
                "rarity": "Rare Holo",
                "images": {"small": "url"}
            },
            {
                "id": "base1-100",
                "name": "Charizard ex",
                "number": "100",
                "nationalPokedexNumbers": [6],
                "rarity": "Double Rare",
                "images": {"small": "url"}
            }
        ]
        
        with patch("builtins.open", mock_open(read_data=json.dumps(card_data))):
            # Charizard (Rare Holo) -> Holo, Reverse (2)
            # Alakazam (Rare Holo) -> Holo, Reverse (2)
            # Charizard ex (Double Rare) -> Holo only (1)
            
            # Test filtering by pokedex number (6) -> Charizard & Charizard ex
            # Charizard(2) + Charizard ex(1) = 3
            cards = self.api.get_cards(pokedex_number=6)
            self.assertEqual(len(cards), 3)
            
            # Test filtering by generation (Gen 1) -> all cards (since all have Gen 1 pokedex numbers)
            # Charizard(2) + Alakazam(2) + Charizard ex(1) = 5
            cards = self.api.get_cards(generation=1)
            self.assertEqual(len(cards), 5)
            
            # Test filtering by set ID
            cards = self.api.get_cards(set_ids=["base1"])
            self.assertEqual(len(cards), 5)

if __name__ == '__main__':
    unittest.main()
