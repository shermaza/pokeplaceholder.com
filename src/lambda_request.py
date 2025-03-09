import json


class LambdaRequest:
    def __init__(self, event):
        self.event = event
        body = event.get("body", {})
        self.connection_id = event.get("connectionId", None)
        self.pokedex_number = body.get("pokedexNumber", None)
        self.generation = body.get("generation", None)
        self.set_ids = body.get("setIds", None)
        self.series_ids = body.get("seriesIds", None)
        self.remove_lower_tier_holos = body.get("removeLowerTierHolos", False)
        self.only_first_printing = body.get("onlyFirstPrinting", False)
        self.ordering = body.get("ordering", None)

    def to_dict(self):
        return {
            "pokedexNumber": self.pokedex_number,
            "generation": self.generation,
            "setId": self.set_ids,
            "seriesIds": self.series_ids,
            "removeLowerTierHolos": self.remove_lower_tier_holos,
            "onlyFirstPrinting": self.only_first_printing,
            "ordering": self.ordering,
        }