export const GAME_ASSETS = {
  sudoku: {
    background: 'sudoku-background.png',
    boardOverlay: 'sudoku-board-overlay.png',
    numpadButton: 'sudoku-numpad-button.png',
  },
  pond: {
    waterTexture: 'zen-pond-water.png',
    lilyPad: require('./zen-pond-lily.png'),
    flower: 'zen-pond-flower.png',
    koi: 'zen-pond-koi.png',
  },
  zenGarden: {
    sandTexture: 'zen-garden-sand.png',
    stoneSmall: 'zen-garden-stone-small.png',
    stoneMedium: require('./zen-garden-stone-medium.png'),
    stoneLarge: require('./zen-garden-stone-large.png'),
    rake: require('./zen-garden-rake.png'),
  },
  bubblePop: {
    bubbleSoft: 'bubble-soft.png',
    bubbleSharp: 'bubble-sharp.png',
    background: 'bubble-background.png',
  },
  colorSort: {
    barTexture: 'color-sort-bar.png',
  },
};

export type GameKey = keyof typeof GAME_ASSETS;

