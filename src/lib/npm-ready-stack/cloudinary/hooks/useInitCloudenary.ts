import { useEffect, useState } from 'react';

// Shared state singleton
let sharedCloudName: string | null = null;
let sharedPreset: string | null = null;
let sharedUseSigned: boolean = false;
let listeners: Array<() => void> = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export default function useInitCloudenary() {
  const [, forceUpdate] = useState({});

  const init = ({ 
    cloudName, 
    preset, 
    useSigned = false 
  }: { 
    cloudName: string; 
    preset: string; 
    useSigned?: boolean;
  }) => {
    const hasChanged = 
      sharedCloudName !== cloudName || 
      sharedPreset !== preset || 
      sharedUseSigned !== useSigned;

    if (hasChanged) {
      sharedCloudName = cloudName;
      sharedPreset = preset;
      sharedUseSigned = useSigned;
      notifyListeners();
    }
  };

  // Subscribe to changes
  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.push(listener);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return {
    cloudName: sharedCloudName,
    preset: sharedPreset,
    useSigned: sharedUseSigned,
    init,
  };
}
