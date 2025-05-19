"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SoundContextType {
  /** Whether notification sounds are enabled */
  enabled: boolean;

  /** The volume level for notification sounds (0-100) */
  volume: number;

  /** Toggle sound notifications on/off */
  toggle: () => void;

  /** Set volume level for notifications */
  setVolume: ( level: number ) => void;

  /** Play the notification sound */
  playNotification: () => void;
}

// Set up default context values
const defaultContext: SoundContextType = {
  enabled: true,
  volume: 70,
  toggle: () => { },
  setVolume: () => { },
  playNotification: () => { },
};

// Create the context
const SoundContext = createContext<SoundContextType>( defaultContext );

interface SoundProviderProps {
  children: ReactNode;
}

/**
 * Provider component for sound notifications
 */
export function SoundProvider( { children }: SoundProviderProps ) {
  const [enabled, setEnabled] = useState( true );
  const [volume, setVolumeState] = useState( 70 );
  const [audio, setAudio] = useState<HTMLAudioElement | null>( null );

  // Initialize audio on client side
  useEffect( () => {
    // Create audio element only on client
    const sound = new Audio( "/sounds/notification-sound.mp3" );
    sound.preload = "auto";
    setAudio( sound );

    // Load saved preference from localStorage if available
    const savedPreference = localStorage.getItem( "sound-enabled" );
    if ( savedPreference !== null ) {
      setEnabled( savedPreference === "true" );
    }

    // Load saved volume from localStorage if available
    const savedVolume = localStorage.getItem( "sound-volume" );
    if ( savedVolume !== null ) {
      const parsedVolume = parseInt( savedVolume, 10 );
      if ( !isNaN( parsedVolume ) && parsedVolume >= 0 && parsedVolume <= 100 ) {
        setVolumeState( parsedVolume );
      }
    }

    return () => {
      // Clean up audio
      sound.pause();
      sound.src = "";
    };
  }, [] );

  // Save preference when changed
  useEffect( () => {
    if ( typeof window !== "undefined" ) {
      localStorage.setItem( "sound-enabled", String( enabled ) );
    }
  }, [enabled] );

  // Save volume when changed
  useEffect( () => {
    if ( typeof window !== "undefined" ) {
      localStorage.setItem( "sound-volume", String( volume ) );
    }
  }, [volume] );

  const toggle = () => setEnabled( ( prev ) => !prev );

  const setVolume = ( level: number ) => {
    if ( level >= 0 && level <= 100 ) {
      setVolumeState( level );
      if ( audio ) {
        audio.volume = level / 100;
      }
    }
  };

  const playNotification = () => {
    if ( !enabled || !audio ) return;

    // Set volume before playing
    audio.volume = volume / 100;

    // Play sound (clone to allow overlapping sounds)
    try {
      audio.currentTime = 0;
      audio.play().catch( ( error ) => {
        console.error( "[Sound] Failed to play notification:", error );
      } );
    } catch ( error ) {
      console.error( "[Sound] Error playing notification:", error );
    }
  };

  return (
    <SoundContext.Provider value={{ enabled, volume, toggle, setVolume, playNotification }}>
      {children}
    </SoundContext.Provider>
  );
}

/**
 * Hook for using sound notifications
 */
export const useSound = () => useContext( SoundContext );
