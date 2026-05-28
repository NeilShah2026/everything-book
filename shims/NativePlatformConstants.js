/**
 * Web stub for NativePlatformConstantsIOS / NativePlatformConstantsAndroid.
 * These TurboModule specs are native-only; on web we return a no-op object
 * so that react-native's Platform module can load without throwing.
 */
const NativePlatformConstants = {
  getConstants: () => ({
    isTesting: false,
    reactNativeVersion: { major: 0, minor: 76, patch: 0, prerelease: null },
    osVersion: '0',
    systemName: 'Web',
    interfaceIdiom: 'unspecified',
    forceTouchAvailable: false,
    // Android fields
    Version: 0,
    Release: '0',
    Serial: 'unknown',
    Fingerprint: 'unknown',
    Model: 'Web',
    ServerHost: '',
    uiMode: 'normal',
  }),
};

export default NativePlatformConstants;
export { NativePlatformConstants };
