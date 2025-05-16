import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    accessToken: null,
    isRedirecting: false,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        addUser: (state, action) => {
            state.user = action.payload;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
        addTokens: (state, action) => {
            state.accessToken = action.payload.accessToken;
            localStorage.setItem('token', action.payload.accessToken);
        },
        removeTokens: (state) => {
            state.accessToken = null;
            state.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
});

export const { addUser, addTokens, removeTokens } = authSlice.actions;
export default authSlice.reducer;
