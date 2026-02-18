import unittest
from card import Card, CardEncoder
import json

class TestCard(unittest.TestCase):
    def setUp(self):
        self.card_data = {
            "set_id": "base1",
            "set_name": "Base",
            "series_name": "Base",
            "release_date": "1999/01/09",
            "total_cards": 102,
            "national_pokedex_number": 6,
            "number": "4",
            "name": "Charizard",
            "rarity": "Rare Holo",
            "id": "base1-4",
            "image_url": "https://images.pokemontcg.io/base1/4.png",
            "holo": "Holofoil",
            "generation": 1
        }
        self.card = Card(
            set_id=self.card_data["set_id"],
            set_name=self.card_data["set_name"],
            series_name=self.card_data["series_name"],
            release_date=self.card_data["release_date"],
            total_cards=self.card_data["total_cards"],
            national_pokedex_number=self.card_data["national_pokedex_number"],
            number=self.card_data["number"],
            name=self.card_data["name"],
            rarity=self.card_data["rarity"],
            card_id=self.card_data["id"],
            image_url=self.card_data["image_url"],
            holo=self.card_data["holo"],
            generation=self.card_data["generation"]
        )

    def test_card_initialization(self):
        self.assertEqual(self.card.set_id, "base1")
        self.assertEqual(self.card.name, "Charizard")
        self.assertEqual(self.card.national_pokedex_number, 6)
        self.assertEqual(self.card.number, "4")

    def test_to_dict(self):
        expected_dict = self.card_data
        self.assertEqual(self.card.to_dict(), expected_dict)

    def test_card_encoder(self):
        json_string = json.dumps(self.card, cls=CardEncoder)
        decoded_data = json.loads(json_string)
        self.assertEqual(decoded_data, self.card_data)

if __name__ == '__main__':
    unittest.main()
