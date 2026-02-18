import { CardService } from '../services/CardService';

describe('CardService', () => {
  test('getVariants returns Holofoil for Ultra Rare', () => {
    const card = { rarity: 'Ultra Rare' };
    const variants = CardService.getVariants(card);
    expect(variants).toEqual(['Holofoil']);
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

});
