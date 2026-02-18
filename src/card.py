import json


class Card:
    NORMAL_HOLOFOIL = "Normal"
    REVERSE_HOLOFOIL = "Reverse Holofoil"
    HOLOFOIL = "Holofoil"

    def __init__(self, set_id, set_name, series_name, release_date, total_cards, national_pokedex_number,
                 number, name, rarity, card_id, image_url, holo, generation):
        self.set_id = set_id
        self.set_name = set_name
        self.series_name = series_name
        self.release_date = release_date
        self.total_cards = total_cards
        self.national_pokedex_number = int(national_pokedex_number) if national_pokedex_number else None
        self.number = int(number) if isinstance(number, int) else number
        self.name = name
        self.rarity = rarity
        self.id = card_id
        self.image_url = image_url
        self.holo = holo
        self.generation = generation

    def to_dict(self):
        return {
            "set_id": self.set_id,
            "set_name": self.set_name,
            "series_name": self.series_name,
            "release_date": self.release_date,
            "total_cards": self.total_cards,
            "national_pokedex_number": self.national_pokedex_number,
            "number": self.number,
            "name": self.name,
            "rarity": self.rarity,
            "id": self.id,
            "image_url": self.image_url,
            "holo": self.holo,
            "generation": self.generation,
        }
            
class CardEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Card):
            return obj.to_dict()
        return super().default(obj)

    