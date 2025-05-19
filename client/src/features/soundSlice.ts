// /features/soundSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../store/strore';

const soundPreferenceSlice = createSlice( {
  name: 'soundPreference',
  initialState: {
    value: typeof window !== 'undefined' && localStorage.getItem( 'soundEnabled' ) !== null
      ? JSON.parse( localStorage.getItem( 'soundEnabled' ) as string )
      : true,
    volume: typeof window !== 'undefined' && localStorage.getItem( 'soundVolume' ) !== null
      ? parseInt( localStorage.getItem( 'soundVolume' ) as string, 10 )
      : 70,
  },
  reducers: {
    toggleSoundHandler: ( state ) => {
      state.value = !state.value;
      if ( typeof window !== 'undefined' ) {
        localStorage.setItem( 'soundEnabled', JSON.stringify( state.value ) );
      }
    },
    setVolumeLevel: ( state, action ) => {
      state.volume = action.payload;
      if ( typeof window !== 'undefined' ) {
        localStorage.setItem( 'soundVolume', action.payload.toString() );
      }
    }
  },
} );

// Add playSound as a thunk action with correct types
export const playSound = () => ( dispatch: AppDispatch, getState: () => RootState ) => {
  const isSoundEnabled = getState().soundPreference.value;
  const volumeLevel = getState().soundPreference.volume / 100; // Convert to 0-1 range

  if ( !isSoundEnabled ) return;

  const audio = new Audio( "/sounds/notification-sound.mp3" );
  audio.volume = volumeLevel; // Set volume level

  audio.onerror = () => {
    try {
      const ctx = new ( window.AudioContext || window.webkitAudioContext )();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 440;
      oscillator.connect( gainNode );

      gainNode.gain.value = volumeLevel; // Apply volume to fallback sound
      gainNode.connect( ctx.destination );

      oscillator.start();
      setTimeout( () => {
        oscillator.stop();
        ctx.close();
      }, 200 );
    } catch ( e ) {
      console.error( "AudioContext not supported", e );
    }
  };
  audio.play();
};

export const { toggleSoundHandler, setVolumeLevel } = soundPreferenceSlice.actions;

export default soundPreferenceSlice.reducer;
