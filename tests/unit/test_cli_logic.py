import unittest
from unittest.mock import patch, MagicMock
from card import Card
from cli import main
import sys

class TestCliLogic(unittest.TestCase):
    @patch('cli.PokemonTcgIoApi')
    @patch('cli.PdfGenerator')
    @patch('argparse.ArgumentParser.parse_args')
    def test_only_first_printing_logic(self, mock_parse_args, mock_pdf_gen, mock_api_class):
        # Mock CLI arguments
        mock_args = MagicMock()
        mock_args.pokedex_number = 6
        mock_args.generation = None
        mock_args.set_ids = None
        mock_args.series_ids = None
        mock_args.only_first_printing = True
        mock_args.remove_lower_tier_holos = False
        mock_args.ordering = ["national_pokedex_number", "release_date", "set_id", "number"]
        mock_args.use_images = False
        mock_args.output = "test.pdf"
        mock_parse_args.return_value = mock_args

        # Mock API response
        mock_api = mock_api_class.return_value
        card1 = Card(set_id="base1", set_name="Base", series_name="Base", release_date="1999/01/09", total_cards=102,
                    national_pokedex_number=6, number="4", name="Charizard", rarity="Rare Holo", card_id="base1-4", 
                    image_url="url", holo="Holofoil", generation=1)
        card2 = Card(set_id="base2", set_name="Base 2", series_name="Base", release_date="2000/02/24", total_cards=130,
                    national_pokedex_number=6, number="4", name="Charizard", rarity="Rare Holo", card_id="base2-4", 
                    image_url="url", holo="Holofoil", generation=1)
        mock_api.get_cards.return_value = [card1, card2]

        # Run main
        main()

        # Check PdfGenerator was called with only one card (the first printing)
        called_cards = mock_pdf_gen.write_pdf_with_grid.call_args[1]['cards']
        self.assertEqual(len(called_cards), 1)
        self.assertEqual(called_cards[0].set_id, "base1")

    @patch('cli.PokemonTcgIoApi')
    @patch('cli.PdfGenerator')
    @patch('argparse.ArgumentParser.parse_args')
    def test_remove_lower_tier_holos_logic(self, mock_parse_args, mock_pdf_gen, mock_api_class):
        # Mock CLI arguments
        mock_args = MagicMock()
        mock_args.pokedex_number = 6
        mock_args.generation = None
        mock_args.set_ids = None
        mock_args.series_ids = None
        mock_args.only_first_printing = False
        mock_args.remove_lower_tier_holos = True
        mock_args.ordering = ["national_pokedex_number", "release_date", "set_id", "number"]
        mock_args.use_images = False
        mock_args.output = "test.pdf"
        mock_parse_args.return_value = mock_args

        # Mock API response
        mock_api = mock_api_class.return_value
        # Two cards in the same set/number, one Holo, one Normal
        card_holo = Card(set_id="base1", set_name="Base", series_name="Base", release_date="1999/01/09", total_cards=102,
                    national_pokedex_number=6, number="4", name="Charizard", rarity="Rare Holo", card_id="base1-4", 
                    image_url="url", holo=Card.HOLOFOIL, generation=1)
        card_normal = Card(set_id="base1", set_name="Base", series_name="Base", release_date="1999/01/09", total_cards=102,
                    national_pokedex_number=6, number="4", name="Charizard", rarity="Rare Holo", card_id="base1-4n", 
                    image_url="url", holo=Card.NORMAL_HOLOFOIL, generation=1)
        mock_api.get_cards.return_value = [card_holo, card_normal]

        # Run main
        main()

        # Check PdfGenerator was called with only the Holo card
        called_cards = mock_pdf_gen.write_pdf_with_grid.call_args[1]['cards']
        self.assertEqual(len(called_cards), 1)
        self.assertEqual(called_cards[0].holo, Card.HOLOFOIL)

if __name__ == '__main__':
    unittest.main()
