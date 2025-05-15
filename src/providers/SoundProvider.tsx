"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SoundContextType {
  /** Whether notification sounds are enabled */
  enabled: boolean;
  
  /** Toggle sound notifications on/off */
  toggle: () => void;
  
  /** Play the notification sound */
  playNotification: () => void;
}

// Set up default context values
const defaultContext: SoundContextType = {
  enabled: true,
  toggle: () => {},
  playNotification: () => {},
};

// Create the context
const SoundContext = createContext<SoundContextType>(defaultContext);

interface SoundProviderProps {
  children: ReactNode;
}

/**
 * Provider component for sound notifications
 */
export function SoundProvider({ children }: SoundProviderProps) {
  const [enabled, setEnabled] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  // Initialize audio on client side
  useEffect(() => {
    // Create audio element only on client
    const sound = new Audio("/sounds/notification-sound.mp3");
    sound.preload = "auto";
    setAudio(sound);
    
    // Load saved preference from localStorage if available
    const savedPreference = localStorage.getItem("sound-enabled");
    if (savedPreference !== null) {
      setEnabled(savedPreference === "true");
    }
    
    return () => {
      // Clean up audio
      sound.pause();
      sound.src = "";
    };
  }, []);
  
  // Save preference when changed
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sound-enabled", String(enabled));
    }
  }, [enabled]);
  
  const toggle = () => setEnabled((prev) => !prev);
  
  const playNotification = () => {
    if (!enabled || !audio) return;
    
    // Play sound (clone to allow overlapping sounds)
    try {
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.error("[Sound] Failed to play notification:", error);
      });
    } catch (error) {
      console.error("[Sound] Error playing notification:", error);
    }
  };
  
  return (
    <SoundContext.Provider value={{ enabled, toggle, playNotification }}>
      {children}
    </SoundContext.Provider>
  );
}

/**
 * Hook for using sound notifications
 */
export const useSound = () => useContext(SoundContext);
