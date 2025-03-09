class PokedexGenerations:
    pokedex_generations = {
        1: range(1, 152),
        2: range(152, 252),
        3: range(252, 387),
        4: range(387, 494),
        5: range(494, 649),
        6: range(649, 721),
        7: range(721, 809),
        8: range(809, 906),
        9: range(906, 1026)
    }

    @classmethod
    def get_cards_by_generation(cls, generation):
        """
        Returns the card numbers that belong to the specified generation.
    
        :param generation: The generation number (1-9).
        :return: A list of card numbers for the specified generation or an empty list if invalid.
        """
        return list(cls.pokedex_generations.get(generation, []))
    
    @classmethod
    def get_generation_by_card_number(cls, card_number):
        """
        Looks up the generation for a specified card number.
    
        :param card_number: The pokedex number of the card.
        :return: The generation number for the specified card number or None if not found.
        """
        for generation, card_range in cls.pokedex_generations.items():
            if card_number in card_range:
                return generation
        return None
    
    

