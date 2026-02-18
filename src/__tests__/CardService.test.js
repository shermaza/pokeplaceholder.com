import { CardService } from '../services/CardService';

describe('CardService', () => {
  test('getVariants returns Holofoil for Ultra Rare', () => {
    const card = { rarity: 'Ultra Rare' };
    const variants = CardService.getVariants(card);
    expect(variants).toEqual(['Holofoil']);
  });

  test('getVariants returns Holofoil for Mega Charizard X ex', () => {
    // Mega Charizard X ex (XY Flashfire #108) is an Ultra Rare
    const card = { name: 'Mega Charizard X ex', rarity: 'Ultra Rare' };
    const variants = CardService.getVariants(card);
    expect(variants).toEqual(['Holofoil']);
  });

  test('getVariants handles lowercase "ex" correctly', () => {
    // Some cards have "ex" or "EX" in rarity or just are special
    const card = { rarity: 'Rare Holo ex' };
    const variants = CardService.getVariants(card);
    // If it's an "ex", it should probably be Holofoil only
    expect(variants).toEqual(['Holofoil']);
  });

  test('getVariants returns Promo for Promo cards', () => {
    const card = { rarity: 'Promo' };
    const variants = CardService.getVariants(card);
    expect(variants).toEqual(['Promo']);
  });

  test('getVariants returns Promo for Black Star Promo', () => {
    const card = { rarity: 'Black Star Promo' };
    const variants = CardService.getVariants(card);
    expect(variants).toEqual(['Promo']);
  });

  test('getVariants returns Holofoil and Reverse Holofoil for Rare Holo', () => {
    const card = { rarity: 'Rare Holo' };
    const variants = CardService.getVariants(card);
    expect(variants).toEqual(['Holofoil', 'Reverse Holofoil']);
  });

  test('getVariants returns Normal and Reverse Holofoil for Common', () => {
    const card = { rarity: 'Common' };
    const variants = CardService.getVariants(card);
    expect(variants).toEqual(['Normal', 'Reverse Holofoil']);
  });

  test('processCards filters by pokedex number', () => {
    const cardsJSON = [
      { id: '1', name: 'Bulbasaur', nationalPokedexNumbers: [1], number: '1', rarity: 'Common' },
      { id: '2', name: 'Charmander', nationalPokedexNumbers: [4], number: '4', rarity: 'Common' }
    ];
    const set = { id: 'base1', name: 'Base', series: 'Base', releaseDate: '1999-01-09', total: 102 };
    
    const results = CardService.processCards(cardsJSON, set, { pokedexNumber: 1 });
    expect(results.length).toBe(2); // Normal and Reverse
    expect(results[0].name).toBe('Bulbasaur');
  });

  test('processCards filters by name', () => {
    const cardsJSON = [
      { id: '1', name: 'Bulbasaur', nationalPokedexNumbers: [1], number: '1', rarity: 'Common' },
      { id: '2', name: 'Charmander', nationalPokedexNumbers: [4], number: '4', rarity: 'Common' }
    ];
    const set = { id: 'base1', name: 'Base', series: 'Base', releaseDate: '1999-01-09', total: 102 };
    
    const results = CardService.processCards(cardsJSON, set, { name: 'Bulba' });
    expect(results.length).toBe(2);
    expect(results[0].name).toBe('Bulbasaur');
  });

  test('sortCards sorts by pokedex number', () => {
    const cards = [
      { national_pokedex_number: 4, number: '4' },
      { national_pokedex_number: 1, number: '1' },
      { national_pokedex_number: 7, number: '7' }
    ];
    const sorted = CardService.sortCards(cards, 'pokedex');
    expect(sorted[0].national_pokedex_number).toBe(1);
    expect(sorted[1].national_pokedex_number).toBe(4);
    expect(sorted[2].national_pokedex_number).toBe(7);
  });

  test('sortCards sorts by card number', () => {
    const cards = [
      { number: '10' },
      { number: '2' },
      { number: '1' },
      { number: 'TG12' },
      { number: 'TG01' }
    ];
    const sorted = CardService.sortCards(cards, 'number');
    expect(sorted[0].number).toBe('1');
    expect(sorted[1].number).toBe('2');
    expect(sorted[2].number).toBe('10');
    expect(sorted[3].number).toBe('TG01');
    expect(sorted[4].number).toBe('TG12');
  });

  test('sortCards handles alphanumeric card numbers correctly', () => {
    const cards = [
      { number: '102a' },
      { number: '102' },
      { number: '101' }
    ];
    const sorted = CardService.sortCards(cards, 'number');
    expect(sorted[0].number).toBe('101');
    expect(sorted[1].number).toBe('102');
    expect(sorted[2].number).toBe('102a');
  });

});
