# pokeplaceholder.com

A web-based tool to generate PDF files of Pokémon TCG cards for use as proxy cards. This is a React-based migration of the original Python CLI tool.

## Features

- **Web Interface**: Easy to use UI for filtering and generating PDFs.
- **Local Data**: Uses pre-fetched card data from the `PokemonTCG/pokemon-tcg-data` repository.
- **Selection Criteria**: Filter by Pokédex number, generation, or set.
- **Ordering**: Order generated cards by Pokédex number or set card number.
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
- **Project Structure**:
    - `src/components/`: Reusable UI components (Header, Footer, Hero, FilterForm).
    - `src/hooks/`: Custom React hooks for logic and state management (`useCardGenerator`).
    - `src/services/`: Core business logic (Card filtering, PDF generation).
    - `src/utils/`: Helper utilities (Pokédex mapping).
    - `src/__tests__/`: Unit tests for services.
- PDF generation handled by `jsPDF`.
- Data is served from `public/data`.

## Deployment

The application is automatically deployed to **GitHub Pages** using a GitHub Action workflow defined in `.github/workflows/deploy.yml`.

- **Automatic Trigger**: Any push to the `main` or `master` branch triggers the deployment process.
- **Workflow Steps**:
  1.  Installs dependencies using `npm ci`.
  2.  Builds the production-ready React application with `npm run build`.
  3.  Deploys the contents of the `build` folder to the `gh-pages` branch.
- **Hosting**: GitHub Pages serves the content from the `gh-pages` branch.

## Holofoil Variant Logic

The tool automatically generates card variants based on the `rarity` field:

- **Promo only**:
    - Any rarity containing the word `Promo`.
- **Holofoil only**: 
    - Specific High-Tier Rarities: `Illustration Rare`, `Special Illustration Rare`, `Ultra Rare`, `Hyper Rare`, `Double Rare`, `Radiant Rare`, `Amazing Rare`, `Rare Shiny GX`, `Shiny Ultra Rare`, `ACE SPEC Rare`.
    - Special Card Types (case-insensitive): Any rarity containing `VMAX`, `VSTAR`, `V`, `EX`, `GX`, `BREAK`, or `Prism Star`.
- **Holofoil and Reverse Holofoil**: 
    - Any other rarity containing the word `Rare` (case-insensitive).
- **Normal and Reverse Holofoil**: 
    - All other rarities (e.g., `Common`, `Uncommon`, `Trainer`).
