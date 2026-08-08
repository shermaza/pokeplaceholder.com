import { PdfService } from '../services/PdfService';

describe('PdfService.reorderForCutAndStack', () => {
  const cards = (n) => Array.from({ length: n }, (_, i) => ({ id: i }));

  test('reorders so stacking piles yields sequential order', () => {
    // 9 cards / page, 20 cards → 3 pages
    const ordered = PdfService.reorderForCutAndStack(cards(20), 9);

    // Page 0, slots 0..8
    expect(ordered.slice(0, 9).map((c) => (c ? c.id : null))).toEqual([
      0, 3, 6, 9, 12, 15, 18, null, null,
    ]);
    // Page 1
    expect(ordered.slice(9, 18).map((c) => (c ? c.id : null))).toEqual([
      1, 4, 7, 10, 13, 16, 19, null, null,
    ]);
    // Page 2
    expect(ordered.slice(18, 27).map((c) => (c ? c.id : null))).toEqual([
      2, 5, 8, 11, 14, 17, null, null, null,
    ]);

    // Simulate cutting into 9 piles (same slot across pages), then stacking piles 0..8
    const piles = Array.from({ length: 9 }, () => []);
    for (let page = 0; page < 3; page++) {
      for (let slot = 0; slot < 9; slot++) {
        const card = ordered[page * 9 + slot];
        if (card) piles[slot].push(card.id);
      }
    }
    const stacked = piles.flat();
    expect(stacked).toEqual(Array.from({ length: 20 }, (_, i) => i));
  });

  test('handles exact page fills', () => {
    const ordered = PdfService.reorderForCutAndStack(cards(9), 9);
    expect(ordered.map((c) => c.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
