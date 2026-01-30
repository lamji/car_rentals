/**
 * Simple MapBox Configuration Hook
 * @returns setConfig function for basic Mapbox setup
 */
export default function useMapBoxConfig() {
  /**
   * Set Mapbox configuration with token, style, and any other options
   * @param config - Configuration object with token, style, and any other Mapbox options
   * @returns Configuration object ready for Mapbox
   */
  const setConfig = (config: any = {}) => {
    return {
      accessToken: config.token || "",
      style: config.style || "mapbox://styles/mapbox/streets-v12",
      center: config.center || [0, 0],
      zoom: config.zoom || 10,
      ...config,
    };
  };

  return {
    setConfig,
  };
}
