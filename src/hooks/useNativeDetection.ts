/**
 * Custom hook for detecting if the app is running in a native/webview context
 * Uses user agent string analysis to determine the platform
 * @returns {boolean} True if running in native/webview context, false if web/PWA
 */
export default function useNativeDetection(): boolean {
  // Check if running in native/webview context using user agent
  const userAgent =
    typeof window !== "undefined" ? window.navigator.userAgent : "";
  
  const isNativeContext =
    userAgent.includes("wv") || // Android webview
    userAgent.includes("WebView") ||
    (userAgent.includes("iPhone") && !userAgent.includes("Safari")) || // iOS webview
    (userAgent.includes("iPad") && !userAgent.includes("Safari")) ||
    userAgent.includes("flutter") || // Flutter webview
    userAgent.includes("Android");

  return isNativeContext;
}
