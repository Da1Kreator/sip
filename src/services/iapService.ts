import * as IAP from 'expo-iap';

const SUBSCRIPTION_ID = 'sip_premium_monthly';

export async function initIAP() {
  try {
    await IAP.connectAsync();
  } catch (e) {
    console.warn('IAP connection failed', e);
  }
}

export async function endIAP() {
  try {
    await IAP.disconnectAsync();
  } catch (e) {
    console.warn('IAP disconnect failed', e);
  }
}

export async function purchaseSubscription() {
  try {
    const { responseCode, results } = await IAP.purchaseItemAsync(
      SUBSCRIPTION_ID
    );

    if (responseCode === IAP.IAPResponseCode.OK && results?.length) {
      return results[0];
    }

    return null;
  } catch (e) {
    console.error('Purchase error', e);
    throw e;
  }
}