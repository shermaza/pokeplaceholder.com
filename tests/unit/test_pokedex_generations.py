import unittest
from pokedex_generations import PokedexGenerations

class TestPokedexGenerations(unittest.TestCase):
    def test_get_cards_by_generation(self):
        gen1 = PokedexGenerations.get_cards_by_generation(1)
        self.assertEqual(len(gen1), 151)
        self.assertIn(1, gen1)
        self.assertIn(151, gen1)
        self.assertNotIn(152, gen1)

    def test_get_generation_by_card_number(self):
        self.assertEqual(PokedexGenerations.get_generation_by_card_number(1), 1)
        self.assertEqual(PokedexGenerations.get_generation_by_card_number(151), 1)
        self.assertEqual(PokedexGenerations.get_generation_by_card_number(152), 2)
        self.assertEqual(PokedexGenerations.get_generation_by_card_number(1025), 9)
        self.assertIsNone(PokedexGenerations.get_generation_by_card_number(0))
        self.assertIsNone(PokedexGenerations.get_generation_by_card_number(2000))

if __name__ == '__main__':
    unittest.main()
