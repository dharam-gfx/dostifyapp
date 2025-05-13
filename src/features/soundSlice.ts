// /features/soundSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../store/strore';

const soundPreferenceSlice = createSlice({
    name: 'soundPreference',
    initialState: {
      value: typeof window !== 'undefined' && localStorage.getItem('soundEnabled') !== null
        ? JSON.parse(localStorage.getItem('soundEnabled') as string)
        : true,
    },
    reducers: {
      toggleSoundHandler: (state) => {
        state.value = !state.value;
        if (typeof window !== 'undefined') {
          localStorage.setItem('soundEnabled', JSON.stringify(state.value));
        }
      }
    },
});

// Add playSound as a thunk action with correct types
export const playSound = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const isSoundEnabled = getState().soundPreference.value;
  if (!isSoundEnabled) return;
  const audio = new Audio("/sounds/notification-sound.mp3");
  audio.onerror = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = 440;
      oscillator.connect(ctx.destination);
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        ctx.close();
      }, 200);
    } catch (e) {
      console.error("AudioContext not supported", e);
    }
  };
  audio.play();
};

export const {toggleSoundHandler } = soundPreferenceSlice.actions;

export default soundPreferenceSlice.reducer;
