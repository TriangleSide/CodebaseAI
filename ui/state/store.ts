import {combineReducers, configureStore} from "@reduxjs/toolkit";
import projectReducer from "@/state/slices/project";
import themeReducer from "@/state/slices/theme";

export const rootReducer = combineReducers({
    projects: projectReducer,
    theme: themeReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
    reducer: rootReducer,
});
export default store;
