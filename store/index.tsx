import { combineReducers, configureStore } from '@reduxjs/toolkit';
import themeConfigSlice from '@/store/themeConfigSlice';
import userSlice from '@/store/userSlice';

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    user: userSlice,
});

export default configureStore({
    reducer: rootReducer,
});

export type IRootState = ReturnType<typeof rootReducer>;
