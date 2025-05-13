// /store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import soundPreferenceReducer from '../features/soundSlice';

export const store = configureStore( {
    reducer: {
        soundPreference: soundPreferenceReducer,
    },
} );

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;