import { combineReducers } from '@reduxjs/toolkit';
import selectedProjectReducer from '@/projects/SelectedProjectStore';

const rootReducer = combineReducers({
    project: selectedProjectReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;