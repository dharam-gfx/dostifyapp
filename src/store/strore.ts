// /store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import soundReducer from '../features/soundSlice';

export const store = configureStore( {
    reducer: {
        sound: soundReducer,
    },
} );

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;