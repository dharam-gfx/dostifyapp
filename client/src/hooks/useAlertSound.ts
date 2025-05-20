"use client";

import { useSound } from '@/providers/SoundProvider';

/**
 * Hook to play alert sounds
 * @returns Functions to control alert sound playback
 */
export function useAlertSound() {
    const { playAlert, stopAlert } = useSound();

    // Return the functions directly from the Sound provider
    return {
        playAlert,
        stopAlert
    };
}
