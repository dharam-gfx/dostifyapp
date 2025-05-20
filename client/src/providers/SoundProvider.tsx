"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/strore';

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

  /** Play the alert sound */
  playAlert: () => void;

  /** Stop the alert sound */
  stopAlert: () => void;
}

// Set up default context values
const defaultContext: SoundContextType = {
  enabled: true,
  volume: 70,
  toggle: () => { },
  setVolume: () => { },
  playNotification: () => { },
  playAlert: () => { },
  stopAlert: () => { },
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
  // Redux is the single source of truth for sound settings
  const enabled = useSelector( ( state: RootState ) => state.soundPreference.value );
  const volume = useSelector( ( state: RootState ) => state.soundPreference.volume );
  const [audio, setAudio] = useState<HTMLAudioElement | null>( null );
  const [alertAudio, setAlertAudio] = useState<HTMLAudioElement | null>( null );

  // Initialize audio elements once
  useEffect( () => {
    if ( typeof window === "undefined" ) return;
    const sound = new Audio( "/sounds/notification-sound.mp3" );
    sound.preload = "auto";
    setAudio( sound );
    const alertSound = new Audio( "/sounds/alert.mp3" );
    alertSound.preload = "auto";
    setAlertAudio( alertSound );
    return () => {
      sound.pause();
      sound.src = "";
      alertSound.pause();
      alertSound.src = "";
    };
  }, [] );

  // Always keep audio element volumes in sync with Redux state
  useEffect( () => {
    if ( audio ) audio.volume = volume / 100;
    if ( alertAudio ) alertAudio.volume = volume / 100;
  }, [volume, audio, alertAudio] );

  const playNotification = () => {
    if ( !enabled || !audio ) return;
    audio.volume = volume / 100;
    try {
      audio.currentTime = 0;
      audio.play().catch( ( error ) => {
        console.error( "[Sound] Failed to play notification:", error );
      } );
    } catch ( error ) {
      console.error( "[Sound] Error playing notification:", error );
    }
  };

  const playAlert = () => {
    if ( !enabled || !alertAudio ) {
      return;
    }
    alertAudio.volume = volume / 100;
    alertAudio.pause();
    alertAudio.currentTime = 0;
    try {
      const playPromise = alertAudio.play();
      if ( playPromise !== undefined ) {
        playPromise.catch( ( error ) => {
          console.error( "[Sound] Failed to play alert:", error );
        } );
      }
    } catch ( error ) {
      console.error( "[Sound] Error playing alert:", error );
    }
  };

  const stopAlert = () => {
    if ( !alertAudio ) return;
    alertAudio.pause();
    alertAudio.currentTime = 0;
  };

  // Dummy functions for context (Redux handles these)
  const toggle = () => { };
  const setVolume = () => { };

  return (
    <SoundContext.Provider value={{ enabled, volume, toggle, setVolume, playNotification, playAlert, stopAlert }}>
      {children}
    </SoundContext.Provider>
  );
}

/**
 * Hook for using sound notifications
 */
export const useSound = () => useContext( SoundContext );
