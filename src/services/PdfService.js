import { jsPDF } from 'jspdf';

export const PdfService = {
  generatePdf: async (cards, useImages) => {
    const doc = new jsPDF({
      unit: 'in',
      format: 'letter'
    });

    const pageWidth = 8.5;
    const pageHeight = 11;
    const cellWidth = 2.5;
    const cellHeight = 3.5;
    const topMargin = 0.25;
    const sideMargin = 0.5;
    const bottomMargin = 0.25;
    const borderWidth = 0.005;

    let x = sideMargin;
    let y = topMargin;

    // Set line width for card borders
    doc.setLineWidth(borderWidth);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      // Draw cell border
      doc.rect(x, y, cellWidth, cellHeight);

      if (useImages && card.image_url) {
        try {
          const imgData = await PdfService.getImageData(card.image_url);
          doc.addImage(imgData, 'JPEG', x, y, cellWidth, cellHeight);
        } catch (e) {
          console.error(`Failed to load image for ${card.name}`, e);
          PdfService.drawText(doc, card, x, y, cellWidth, cellHeight);
        }
      } else {
        PdfService.drawText(doc, card, x, y, cellWidth, cellHeight);
      }

      // Move to next cell
      x += cellWidth;

      // New row
      if (x + cellWidth > pageWidth - sideMargin) {
        x = sideMargin;
        y += cellHeight;
      }

      // New page
      if (y + cellHeight > pageHeight - bottomMargin) {
        if (i < cards.length - 1) {
          doc.addPage();
          x = sideMargin;
          y = topMargin;
        }
      }
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

  drawText: (doc, card, x, y, width, height) => {
    const textLines = [
      card.national_pokedex_number ? `#${card.national_pokedex_number}` : "",
      card.name,
      card.series_name,
      card.set_name,
      `${card.number}/${card.total_cards}`,
      card.holo,
      `Released: ${card.release_date}`
    ].filter(l => l !== "");

    doc.setFontSize(10);
    const lineHeight = 0.2;
    const totalHeight = textLines.length * lineHeight;
    let currentY = y + (height - totalHeight) / 2 + lineHeight;

    textLines.forEach(line => {
      const textWidth = doc.getTextWidth(line);
      const xCenter = x + (width - textWidth) / 2;
      doc.text(line, xCenter, currentY);
      currentY += lineHeight;
    });
  }
};
