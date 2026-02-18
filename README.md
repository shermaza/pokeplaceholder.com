# Pokémon TCG Proxy Card PDF Generator (Web)

A web-based tool to generate PDF files of Pokémon TCG cards for use as proxy cards. This is a React-based migration of the original Python CLI tool.

## Features

- **Web Interface**: Easy to use UI for filtering and generating PDFs.
- **Local Data**: Uses pre-fetched card data from the `PokemonTCG/pokemon-tcg-data` repository.
- **Selection Criteria**: Filter by Pokédex number or generation.
- **Variant Generation**: Automatically generates Normal, Holofoil, and Reverse Holofoil variants based on card rarity.
- **Customization**:
    - Choose between text-only or image-based cards.
    - Standard 2.5" x 3.5" card sizing in a grid layout.

## Setup

1. **Install Node.js**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the app**:
   ```bash
   npm start
   ```

## Development

- Built with React and Tailwind CSS.
- PDF generation handled by `jsPDF`.
- Data is served from `public/data`.

## Rarity Determination Logic

The tool automatically generates card variants based on the `rarity` field:

- **Holofoil only**: 
    - Specific High-Tier Rarities: `Illustration Rare`, `Special Illustration Rare`, `Ultra Rare`, `Hyper Rare`, `Double Rare`, `Radiant Rare`, `Amazing Rare`, `Rare Shiny GX`, `Shiny Ultra Rare`, `ACE SPEC Rare`.
    - Special Card Types: Any rarity containing `V`, `VMAX`, `VSTAR`, `EX`, `GX`, `BREAK`, or `Prism Star`.
- **Holofoil and Reverse Holofoil**: 
    - Any other rarity containing the word `Rare`.
- **Normal and Reverse Holofoil**: 
    - All other rarities (e.g., `Common`, `Uncommon`, `Trainer`).
