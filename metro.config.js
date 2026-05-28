const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// On web, stub out native-only TurboModule platform-constant specs
// so they don't call TurboModuleRegistry.getEnforcing('PlatformConstants').
const nativePlatformConstantsShim = path.resolve(
  __dirname,
  "shims/NativePlatformConstants.js"
);

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web") {
    if (
      moduleName.includes("NativePlatformConstantsIOS") ||
      moduleName.includes("NativePlatformConstantsAndroid")
    ) {
      return { filePath: nativePlatformConstantsShim, type: "sourceFile" };
    }
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
