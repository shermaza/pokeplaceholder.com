import argparse
import logging
import os
import sys

from card import Card
from pdf_generator import PdfGenerator
from pokemontcg_io_api import PokemonTcgIoApi

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

def main():
    parser = argparse.ArgumentParser(description="Pokémon TCG Card PDF Generator CLI")
    
    # Selection criteria
    parser.add_argument("--pokedex-number", type=int, help="National Pokédex number")
    parser.add_argument("--generation", type=int, help="Pokémon generation (1-9)")
    parser.add_argument("--set-ids", nargs="+", help="Space-separated list of set IDs")
    parser.add_argument("--series-ids", nargs="+", help="Space-separated list of series IDs")
    
    # Optional filters and settings
    parser.add_argument("--only-first-printing", action="store_true", help="Include only the first printing of each card name")
    parser.add_argument("--remove-lower-tier-holos", action="store_true", help="Keep only the highest holofoil status for each card")
    parser.add_argument("--ordering", nargs="+", default=["national_pokedex_number", "release_date", "set_id", "number"], 
                        help="Order by these Card attributes (default: national_pokedex_number release_date set_id number)")
    parser.add_argument("--use-images", action="store_true", help="Include card images in the PDF (requires internet connection)")
    parser.add_argument("--output", default="cards.pdf", help="Output PDF filename (default: cards.pdf)")

    args = parser.parse_args()

    # Ensure at least one selection criterion is provided
    if not any([args.pokedex_number, args.generation, args.set_ids, args.series_ids]):
        parser.error("At least one selection criterion is required: --pokedex-number, --generation, --set-ids, or --series-ids")

    try:
        # Initialize API
        api = PokemonTcgIoApi()
        
        logger.info("Fetching cards...")
        cards = api.get_cards(
            pokedex_number=args.pokedex_number,
            generation=args.generation,
            set_ids=args.set_ids,
            series_ids=args.series_ids
        )

        if not cards:
            logger.warning("No cards found matching the criteria.")
            return

        logger.info(f"Found {len(cards)} cards.")

        # Apply "Only First Printing" filter
        if args.only_first_printing:
            grouped_cards = {}
            for card in sorted(cards, key=lambda c: c.release_date):
                if card.name not in grouped_cards:
                    grouped_cards[card.name] = []
                if len(grouped_cards[card.name]) == 0 or all(existing_card.release_date == card.release_date for existing_card in grouped_cards[card.name]):
                    grouped_cards[card.name].append(card)
            cards = [card for card_list in grouped_cards.values() for card in card_list]
            logger.info(f"Filtered to {len(cards)} cards (Only First Printing).")

        # Apply "Remove Lower Tier Holos" filter
        if args.remove_lower_tier_holos:
            holofoil_priority = {Card.HOLOFOIL: 1, Card.REVERSE_HOLOFOIL: 2, Card.NORMAL_HOLOFOIL: 3}
            filtered_cards_by_set_and_number = {}
            for card in cards:
                unique_key = (card.set_id, card.number)
                if unique_key not in filtered_cards_by_set_and_number:
                    filtered_cards_by_set_and_number[unique_key] = card
                else:
                    existing_card = filtered_cards_by_set_and_number[unique_key]
                    if (
                        holofoil_priority.get(card.holo, float('inf')) < holofoil_priority.get(existing_card.holo, float('inf'))
                        or (
                            card.holo == existing_card.holo
                            and card.release_date < existing_card.release_date
                        )
                    ):
                        filtered_cards_by_set_and_number[unique_key] = card
            cards = list(filtered_cards_by_set_and_number.values())
            logger.info(f"Filtered to {len(cards)} cards (Highest Holo Tier).")

        # Sort cards
        cards.sort(key=lambda card: tuple(str(getattr(card, key, None) or "") for key in args.ordering))

        # Generate PDF
        logger.info(f"Generating PDF: {args.output}")
        PdfGenerator.write_pdf_with_grid(
            cards=cards,
            images=args.use_images,
            output_path=args.output
        )
        logger.info("Done!")

    except Exception as e:
        logger.error(f"An error occurred: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
