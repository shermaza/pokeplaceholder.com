import { jsPDF } from 'jspdf';

export const PdfService = {
  generatePdf: async (cards, options = {}, onProgress) => {
    const { useImages = false, showVariant = true, cardsPerPage = 9 } = options;
    const doc = new jsPDF({
      unit: 'in',
      format: 'letter'
    });

    const pageWidth = 8.5;
    const pageHeight = 11;
    const topMargin = 0.25;
    const sideMargin = 0.5;
    const bottomMargin = 0.25;
    const borderWidth = 0.005;

    // Calculate grid and cell size
    // We want roughly golden ratio or similar if possible, but 2:3 or 3:4 is common for cards.
    // Let's find best cols/rows for cardsPerPage
    let cols = Math.ceil(Math.sqrt(cardsPerPage * (pageWidth / pageHeight)));
    let rows = Math.ceil(cardsPerPage / cols);
    
    // Adjust to better fit if needed
    if (cols * rows < cardsPerPage) rows++;
    
    // Special cases for better standard layouts
    if (cardsPerPage === 9) { cols = 3; rows = 3; }
    else if (cardsPerPage === 4) { cols = 2; rows = 2; }
    else if (cardsPerPage === 1) { cols = 1; rows = 1; }
    else if (cardsPerPage <= 6 && cardsPerPage > 4) { cols = 2; rows = 3; }
    else if (cardsPerPage <= 12 && cardsPerPage > 9) { cols = 3; rows = 4; }
    else if (cardsPerPage <= 16 && cardsPerPage > 12) { cols = 4; rows = 4; }
    else if (cardsPerPage <= 20 && cardsPerPage > 16) { cols = 4; rows = 5; }
    else if (cardsPerPage <= 25 && cardsPerPage > 20) { cols = 5; rows = 5; }
    else if (cardsPerPage <= 30 && cardsPerPage > 25) { cols = 5; rows = 6; }
    else if (cardsPerPage <= 36 && cardsPerPage > 30) { cols = 6; rows = 6; }

    const availableWidth = pageWidth - (sideMargin * 2);
    const availableHeight = pageHeight - (topMargin + bottomMargin);
    
    const cellWidth = availableWidth / cols;
    const cellHeight = availableHeight / rows;

    let x = sideMargin;
    let y = topMargin;

    // Set line width for card borders
    doc.setLineWidth(borderWidth);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      if (onProgress) {
        onProgress(Math.round((i / cards.length) * 100));
      }

      // Draw cell border
      doc.rect(x, y, cellWidth, cellHeight);

      if (useImages && card.image_url) {
        try {
          const imgData = await PdfService.getImageData(card.image_url);
          doc.addImage(imgData, 'JPEG', x, y, cellWidth, cellHeight);
        } catch (e) {
          console.error(`Failed to load image for ${card.name}`, e);
          PdfService.drawText(doc, card, x, y, cellWidth, cellHeight, showVariant, cardsPerPage);
        }
      } else {
        PdfService.drawText(doc, card, x, y, cellWidth, cellHeight, showVariant, cardsPerPage);
      }

      // Move to next cell
      x += cellWidth;

      // New row
      if (x + (cellWidth / 2) > pageWidth - sideMargin) {
        x = sideMargin;
        y += cellHeight;
      }

      // New page
      if (y + (cellHeight / 2) > pageHeight - bottomMargin) {
        if (i < cards.length - 1) {
          doc.addPage();
          x = sideMargin;
          y = topMargin;
        }
      }
    }

    if (onProgress) {
      onProgress(100);
    }

    doc.save('cards.pdf');
  },

  getImageData: (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = reject;
      img.src = url;
    });
  },

  drawText: (doc, card, x, y, width, height, showVariant = true, cardsPerPage = 9) => {
    const textLines = [
      card.national_pokedex_number ? `#${card.national_pokedex_number}` : "",
      card.name,
      card.series_name,
      card.set_name,
      `${card.number}/${card.total_cards}`,
      showVariant ? card.holo : "",
      `Released: ${card.release_date}`
    ].filter(l => l !== "");

    // Scale font size based on number of cards
    // Base 10pt for 9 cards (3x3)
    let fontSize = 10;
    if (cardsPerPage > 9) {
      fontSize = Math.max(4, 10 - Math.floor((cardsPerPage - 9) / 4));
    } else if (cardsPerPage < 9) {
      fontSize = Math.min(16, 10 + Math.floor((9 - cardsPerPage) * 1.5));
    }
    
    doc.setFontSize(fontSize);
    const lineHeight = fontSize * 0.02; // Roughly scaled line height
    const totalHeight = textLines.length * lineHeight;
    let currentY = y + (height - totalHeight) / 2 + (lineHeight * 0.8);

    textLines.forEach(line => {
      // Check if text is too wide and truncate if necessary
      let displayLine = line;
      const maxWidth = width - 0.1;
      if (doc.getTextWidth(displayLine) > maxWidth) {
        while (displayLine.length > 0 && doc.getTextWidth(displayLine + "...") > maxWidth) {
          displayLine = displayLine.substring(0, displayLine.length - 1);
        }
        displayLine += "...";
      }

      const textWidth = doc.getTextWidth(displayLine);
      const xCenter = x + (width - textWidth) / 2;
      doc.text(displayLine, xCenter, currentY);
      currentY += lineHeight;
    });
  }
};
