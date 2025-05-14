// /store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import soundPreferenceReducer from '../features/soundSlice';
import chatReducer from '../features/chatSlice';

export const store = configureStore( {
    reducer: {
        soundPreference: soundPreferenceReducer,
        chat: chatReducer,
    },
} );

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;