// /features/soundSlice.ts
import { createSlice } from '@reduxjs/toolkit';


// Removed unused initialState

const soundSlice = createSlice({
    name: 'sound',
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

export const {toggleSoundHandler } = soundSlice.actions;

export default soundSlice.reducer;
