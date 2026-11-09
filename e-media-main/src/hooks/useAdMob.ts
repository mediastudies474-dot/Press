import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
  AdmobConsentStatus,
} from '@capacitor-community/admob';

// Production AdMob unit (banner). Replace with your own ad unit IDs from AdMob console.
// Using Google's official test ad unit during development is recommended.
const BANNER_AD_UNIT_ID = 'ca-app-pub-2820576027993732/8422107034';
const TEST_BANNER_AD_UNIT_ID = 'ca-app-pub-3940256099942544/6300978111';

export const isNative = () => Capacitor.isNativePlatform();

export async function initAdMob() {
  if (!isNative()) return;
  try {
    await AdMob.initialize();

    // EU consent (UMP)
    const consentInfo = await AdMob.requestConsentInfo();
    if (
      consentInfo.isConsentFormAvailable &&
      consentInfo.status === AdmobConsentStatus.REQUIRED
    ) {
      await AdMob.showConsentForm();
    }
  } catch (e) {
    console.warn('[AdMob] init failed', e);
  }
}

export async function showBanner(useTestAd = false) {
  if (!isNative()) return;
  const options: BannerAdOptions = {
    adId: useTestAd ? TEST_BANNER_AD_UNIT_ID : BANNER_AD_UNIT_ID,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 56, // sit above bottom nav
    isTesting: useTestAd,
  };
  try {
    await AdMob.showBanner(options);
  } catch (e) {
    console.warn('[AdMob] banner failed', e);
  }
}

export async function hideBanner() {
  if (!isNative()) return;
  try { await AdMob.hideBanner(); } catch {}
}

export const useAdMobBanner = (enabled = true) => {
  useEffect(() => {
    if (!enabled || !isNative()) return;
    let mounted = true;
    (async () => {
      await initAdMob();
      if (mounted) await showBanner(false);
    })();
    return () => {
      mounted = false;
      hideBanner();
    };
  }, [enabled]);
};
