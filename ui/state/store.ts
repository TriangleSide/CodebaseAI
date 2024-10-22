import {combineReducers, configureStore} from "@reduxjs/toolkit";
import projectReducer from "@/state/slices/project";
import themeReducer from "@/state/slices/theme";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";

export const rootReducer = combineReducers({
    projects: projectReducer,
    theme: themeReducer,
});

const store = configureStore({
    reducer: rootReducer,
});

export type StoreDispatch = typeof store.dispatch;
export const useStoreDispatch = () => useDispatch<StoreDispatch>();

export type StoreState = ReturnType<typeof rootReducer>;
export const useStoreSelector: TypedUseSelectorHook<StoreState> = useSelector;

export default store;
