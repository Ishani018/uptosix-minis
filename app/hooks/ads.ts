import { Platform } from 'react-native';
import {
  TestIds,
  InterstitialAd,
  RewardedAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';

// TODO: Replace the placeholder strings with the actual Ad Unit IDs 
// from the Uptosix AdMob account before building the production AAB/IPA.
const adUnitIDs = {
  banner: Platform.select({
    ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
    android: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
    default: '',
  }),
  interstitial: Platform.select({
    ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
    android: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
    default: '',
  }),
  rewarded: Platform.select({
    ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
    android: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
    default: '',
  }),
};

/**
 * Automatically serves test ads during local development to protect the AdMob account.
 * Swaps to real Uptosix Ad Units only in production builds.
 */
export const getAdUnitId = (type: 'banner' | 'interstitial' | 'rewarded') => {
  if (__DEV__) {
    switch (type) {
      case 'banner': return TestIds.BANNER;
      case 'interstitial': return TestIds.INTERSTITIAL;
      case 'rewarded': return TestIds.REWARDED;
    }
  }
  return adUnitIDs[type] as string;
};

// ------------------------------------------------------------------
// Pre-configured Ad Instances
// ------------------------------------------------------------------

// Interstitial (Full screen) - Good for transitions like game over -> home
export const interstitialAd = InterstitialAd.createForAdRequest(getAdUnitId('interstitial'), {
  requestNonPersonalizedAdsOnly: true, // Recommended for broad compliance
});

// Rewarded - Good for "Watch an ad for a hint" in games like Sudoku
export const rewardedAd = RewardedAd.createForAdRequest(getAdUnitId('rewarded'), {
  requestNonPersonalizedAdsOnly: true,
});

// Banner size constant for easy importing
export const defaultBannerSize = BannerAdSize.ANCHORED_ADAPTIVE_BANNER;