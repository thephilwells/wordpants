export default function getPuzzleData(index) {
  // TODO: get these values from api
  const set = [
    { clue: "CLINTONS' KITTY", answer: 'SOCKS' },
    { clue: 'MONASTERY HEAD', answer: 'ABBOT' },
    { clue: 'TURKEY TOPPER', answer: 'GRAVY' },
    { clue: 'CUDDLE, IN A WAY', answer: 'SPOON' },
    { clue: '5-7-5 POEM', answer: 'HAIKU' },
    { clue: 'CLAMMY', answer: 'MOIST' },
    { clue: 'THAT IS ... ROUGH', answer: 'YIKES' },
    { clue: 'JUST PLAIN PEOPLE', answer: 'FOLKS' },
    { clue: 'OF POOR QUALITY, SLANGILY', answer: 'JANKY' },
    { clue: 'SOW, AS SEEDS', answer: 'PLANT' },
    { clue: 'LAB WEAR', answer: 'SMOCK' },
    { clue: 'CIRCULAR DINNER ORDER', answer: 'PIZZA' },
    { clue: 'LEG EXERCISE', answer: 'SQUAT' },
    { clue: "THAT'S HILARIOUS", answer: 'LMFAO' },
    { clue: "THIRSTY DOG'S EMISSIONS", answer: 'PANTS' },
  ]
  return { clue: set[index].clue, answer: set[index].answer }
}
