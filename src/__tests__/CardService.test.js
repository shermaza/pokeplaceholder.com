import { CardService } from '../services/CardService';

describe('CardService', () => {
  test('processCards filters by pokedex number', () => {
    const cardsJSON = [
      { id: '1', name: 'Bulbasaur', nationalPokedexNumbers: [1], number: '1', rarity: 'Common' },
      { id: '2', name: 'Charmander', nationalPokedexNumbers: [4], number: '4', rarity: 'Common' }
    ];
    const set = { id: 'base1', name: 'Base', series: 'Base', releaseDate: '1999-01-09', total: 102 };
    
    // Using default variant since variantsData is empty
    const results = CardService.processCards(cardsJSON, set, {}, { pokedexNumber: 1 });
    expect(results.length).toBe(1); 
    expect(results[0].name).toBe('Bulbasaur');
  });

  test('processCards filters by name', () => {
    const cardsJSON = [
      { id: '1', name: 'Bulbasaur', nationalPokedexNumbers: [1], number: '1', rarity: 'Common' },
      { id: '2', name: 'Charmander', nationalPokedexNumbers: [4], number: '4', rarity: 'Common' }
    ];
    const set = { id: 'base1', name: 'Base', series: 'Base', releaseDate: '1999-01-09', total: 102 };
    
    const results = CardService.processCards(cardsJSON, set, {}, { name: 'Bulba' });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Bulbasaur');
  });

  test('processCards handles cameos correctly', () => {
    const cardsJSON = [
      { id: 'base1-1', name: 'Alakazam', nationalPokedexNumbers: [65], number: '1', rarity: 'Rare Holo' },
      { id: 'base1-2', name: 'Blastoise', nationalPokedexNumbers: [9], number: '2', rarity: 'Rare Holo' }
    ];
    const set = { id: 'base1', name: 'Base', series: 'Base', releaseDate: '1999-01-09', total: 102 };
    
    const cameosData = {
      'pikachu': [
        { setId: 'base1', number: '1', cardName: 'Alakazam' }
      ]
    };

    // Should NOT find Alakazam if includeCameos is false
    const noCameoResults = CardService.processCards(cardsJSON, set, {}, { name: 'pikachu', includeCameos: false, cameosData });
    expect(noCameoResults.length).toBe(0);

    // Should find Alakazam as a cameo if includeCameos is true
    const cameoResults = CardService.processCards(cardsJSON, set, {}, { name: 'pikachu', includeCameos: true, cameosData });
    expect(cameoResults.length).toBe(1);
    expect(cameoResults[0].name).toBe('Alakazam');
    expect(cameoResults[0].is_cameo).toBe(true);
  });

  test('processCards handles cameo fallback by card name', () => {
    const cardsJSON = [
      { id: 'base1-1', name: 'Alakazam', nationalPokedexNumbers: [65], number: '1', rarity: 'Rare Holo' }
    ];
    const set = { id: 'base1', name: 'Base', series: 'Base', releaseDate: '1999-01-09', total: 102 };
    
    const cameosData = {
      'pikachu': [
        { setId: 'base1', number: '999', cardName: 'Alakazam' } // Number doesn't match
      ]
    };

    const results = CardService.processCards(cardsJSON, set, {}, { name: 'pikachu', includeCameos: true, cameosData });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Alakazam');
    expect(results[0].is_cameo).toBe(true);
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

  test('sortCards sorts by release date', () => {
    const cards = [
      { release_date: '2023/11/03', number: '1' },
      { release_date: '2021/01/01', number: '2' },
      { release_date: '2024/01/01', number: '3' }
    ];
    const sorted = CardService.sortCards(cards, 'releaseDate');
    expect(sorted[0].release_date).toBe('2021/01/01');
    expect(sorted[1].release_date).toBe('2023/11/03');
    expect(sorted[2].release_date).toBe('2024/01/01');
  });

});
