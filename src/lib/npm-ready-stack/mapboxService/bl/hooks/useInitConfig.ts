"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Config type
interface MapboxConfig {
  token?: string;
  style?: string;
  [key: string]: any;
}

// Global config state
let globalConfig: MapboxConfig = {};
const globalSetters: Set<(config: MapboxConfig) => void> = new Set();

export default function useInitConfig() {
  const [config, setLocalConfig] = useState<MapboxConfig>(globalConfig);
  const setterRef = useRef(setLocalConfig);

  // Update ref when setter changes
  useEffect(() => {
    setterRef.current = setLocalConfig;
  }, []);

  console.log("test:useInitConfig - Hook called, current config:", config);
  console.log("test:useInitConfig - Global config:", globalConfig);
  console.log("test:useInitConfig - Global setters count:", globalSetters.size);

  useEffect(() => {
    console.log("test:useInitConfig - useEffect mounting, adding setter");
    // Add this setter to global set
    globalSetters.add(setterRef.current);
    console.log(
      "test:useInitConfig - Setters after adding:",
      globalSetters.size,
    );

    // Sync with current global config if it exists
    if (Object.keys(globalConfig).length > 0) {
      setLocalConfig(globalConfig);
    }

    // Cleanup on unmount
    return () => {
      console.log("test:useInitConfig - useEffect cleanup, removing setter");
      globalSetters.delete(setterRef.current);
      console.log(
        "test:useInitConfig - Setters after cleanup:",
        globalSetters.size,
      );
    };
  }, []);

  const setConfig = useCallback((newConfig: MapboxConfig) => {
    console.log("test:setConfig - Called with:", newConfig);
    console.log("test:setConfig - Previous globalConfig:", globalConfig);

    // Only update if config actually changed
    const configChanged =
      JSON.stringify(globalConfig) !==
      JSON.stringify({ ...globalConfig, ...newConfig });
    if (!configChanged) {
      console.log("test:setConfig - Config unchanged, skipping update");
      return;
    }

    globalConfig = { ...globalConfig, ...newConfig };
    console.log("test:setConfig - New globalConfig:", globalConfig);
    console.log("test:setConfig - Updating", globalSetters.size, "components");

    // Update all components using this hook
    globalSetters.forEach((setter) => setter({ ...globalConfig }));
  }, []);

  console.log("test:config - Current config in hook:", config);

  return {
    config,
    setConfig,
  };
}
