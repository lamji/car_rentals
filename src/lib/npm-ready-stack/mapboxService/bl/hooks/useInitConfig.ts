/* eslint-disable @typescript-eslint/no-explicit-any */
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

  useEffect(() => {
    // Add this setter to global set
    globalSetters.add(setterRef.current);

    // Sync with current global config if it exists
    if (Object.keys(globalConfig).length > 0) {
      setLocalConfig(globalConfig);
    }

    // Cleanup on unmount
    return () => {
      globalSetters.delete(setterRef.current);
    };
  }, []);

  const setConfig = useCallback((newConfig: MapboxConfig) => {
    // Only update if config actually changed
    const configChanged =
      JSON.stringify(globalConfig) !==
      JSON.stringify({ ...globalConfig, ...newConfig });
    if (!configChanged) {
      return;
    }

    globalConfig = { ...globalConfig, ...newConfig };

    // Update all components using this hook
    globalSetters.forEach((setter) => setter({ ...globalConfig }));
  }, []);

  return {
    config,
    setConfig,
  };
}
