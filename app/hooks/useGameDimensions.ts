/**
 * useGameDimensions
 * -----------------
 * Returns the usable screen width/height for game content,
 * capped to the phone-frame dimensions on web.
 *
 * On web the browser window may be wider than the phone frame (393px),
 * so we cap at PHONE_SCREEN_W / PHONE_SCREEN_H to prevent layouts
 * from overflowing the mockup.
 *
 * Usage:
 *   const { sw, sh, boardSize, hPad } = useGameDimensions();
 */

import { Dimensions, Platform } from 'react-native';

// Must match _layout.tsx constants
const PHONE_W = 393;
const PHONE_H = 852;
const BEZEL = 14;

export const PHONE_SCREEN_W = PHONE_W - BEZEL * 2; // 365
export const PHONE_SCREEN_H = PHONE_H - BEZEL * 2; // 824

export function useGameDimensions(horizontalPadding = 24) {
  const { width, height } = Dimensions.get('window');

  // On web, clamp to the phone frame inner screen size
  const sw = Platform.OS === 'web'
    ? Math.min(width, PHONE_SCREEN_W)
    : width;

  const sh = Platform.OS === 'web'
    ? Math.min(height, PHONE_SCREEN_H)
    : height;

  // Usable board square — full width minus padding on both sides
  const boardSize = sw - horizontalPadding * 2;

  return {
    sw,          // screen width  (safe)
    sh,          // screen height (safe)
    boardSize,   // square board size
    hPad: horizontalPadding,
  };
}