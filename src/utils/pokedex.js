export const Pokedex = {
  getGenerationByNumber: (num) => {
    if (!num) return null;
    if (num <= 151) return 1;
    if (num <= 251) return 2;
    if (num <= 386) return 3;
    if (num <= 493) return 4;
    if (num <= 649) return 5;
    if (num <= 721) return 6;
    if (num <= 809) return 7;
    if (num <= 905) return 8;
    if (num <= 1025) return 9;
    return null;
  },
  getRangeForGeneration: (gen) => {
    const ranges = {
      1: [1, 151],
      2: [152, 251],
      3: [252, 386],
      4: [387, 493],
      5: [494, 649],
      6: [650, 721],
      7: [722, 809],
      8: [810, 905],
      9: [906, 1025]
    };
    return ranges[gen] || null;
  }
};
