import * as LocalAuthentication from "expo-local-authentication";

export const authenticateUser = async () => {
  try {
    // Check what the device is capable of.
    await LocalAuthentication.supportedAuthenticationTypesAsync();

    // Check if any security (Bio or PIN) is actually set up.
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!isEnrolled) {
      // If the phone has no lock screen set up at all, we can't force a lock.
      return true;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock BlackBook",
      disableDeviceFallback: false,
      cancelLabel: "Cancel",
    });

    return result.success;
  } catch (error) {
    console.error("Auth Error:", error);
    return false;
  }
};
