# Pokémon TCG Proxy Card PDF Generator

A local CLI tool to generate PDF files of Pokémon TCG cards for use as proxy cards. It uses card data from the `PokemonTCG/pokemon-tcg-data` repository.

## Features

- **Local Data**: No external API requests needed (except for fetching card images).
- **Selection Criteria**: Filter by Pokédex number, generation, specific set IDs, or series IDs.
- **Printing Filters**: 
    - `--only-first-printing`: Keep only the first printing of each card name.
    - `--remove-lower-tier-holos`: Keep only the highest quality version (Holo > Reverse > Normal) for each set/number.
- **Customization**:
    - Choose sorting order of cards in the PDF.
    - Choose between text-only or image-based cards.

## Setup

1. **Install Python 3.12+**
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Download Card Data**:
   Ensure the `src/data` directory contains the `sets` and `cards` folders from `PokemonTCG/pokemon-tcg-data`.

## Usage

Run the tool using Python. Set `PYTHONPATH` to include the `src` directory.

### Examples

**Generate a PDF for Charizard (#6):**
```bash
# Windows (PowerShell)
$env:PYTHONPATH="src"; python src/cli.py --pokedex-number 6 --output charizard.pdf

# Linux/macOS
PYTHONPATH="src" python src/cli.py --pokedex-number 6 --output charizard.pdf
```

**Generate a PDF for all cards in Generation 1, including images:**
```bash
$env:PYTHONPATH="src"; python src/cli.py --generation 1 --use-images --output gen1.pdf
```

**Generate a PDF for specific sets:**
```bash
$env:PYTHONPATH="src"; python src/cli.py --set-ids base1 base2 --output base_sets.pdf
```

### Arguments

- `--pokedex-number NUMBER`: Filter by National Pokédex number.
- `--generation NUMBER`: Filter by Pokémon generation (1-9).
- `--set-ids ID [ID ...]`: Filter by specific set IDs (e.g., `base1`, `swsh1`).
- `--series-ids ID [ID ...]`: Filter by series IDs (e.g., `Base`, `Sword & Shield`).
- `--only-first-printing`: Include only the first printing of each card name.
- `--remove-lower-tier-holos`: Keep only the highest holofoil status for each card.
- `--ordering ATTR [ATTR ...]`: Order by Card attributes (default: `national_pokedex_number release_date set_id number`).
- `--use-images`: Include card images in the PDF (requires internet connection).
- `--output FILENAME`: Output PDF filename (default: `cards.pdf`).

## Rarity Determination Logic

The tool automatically generates card variants (Normal, Holofoil, and Reverse Holofoil) based on the `rarity` field from the source data to match typical TCG physical distributions:

- **Holofoil only**: 
    - Specific High-Tier Rarities: `Illustration Rare`, `Special Illustration Rare`, `Ultra Rare`, `Hyper Rare`, `Double Rare`, `Radiant Rare`, `Amazing Rare`, `Rare Shiny GX`, `Shiny Ultra Rare`, `ACE SPEC Rare`.
    - Special Card Types: Any rarity containing `V`, `VMAX`, `VSTAR`, `EX`, `GX`, `BREAK`, or `Prism Star` (e.g., `Rare Holo VMAX`).
- **Holofoil and Reverse Holofoil**: 
    - Any other rarity containing the word `Rare` (e.g., `Rare`, `Rare Holo`).
- **Normal and Reverse Holofoil**: 
    - All other rarities (e.g., `Common`, `Uncommon`, `Trainer`).
