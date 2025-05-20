import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Function to get username from localStorage
const getUserNameFromStorage = (): string => {
    if ( typeof window !== 'undefined' ) {
        const storedName = localStorage.getItem( 'userName' );
        return storedName ? storedName : 'User';
    }
    return 'User';
};

interface UserState {
    userName: string;
}

const initialState: UserState = {
    userName: getUserNameFromStorage(),
};

const userSlice = createSlice( {
    name: 'user',
    initialState,
    reducers: {
        setUserName: ( state, action: PayloadAction<string> ) => {
            state.userName = action.payload;
            // Save to localStorage
            if ( typeof window !== 'undefined' ) {
                localStorage.setItem( 'userName', action.payload );
            }
        },
    },
} );

export const { setUserName } = userSlice.actions;
export default userSlice.reducer;