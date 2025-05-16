import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth';

// Create the store
const store = configureStore({
    reducer: {
        auth: authReducer,
        // Add other reducers here as needed
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export { store };
