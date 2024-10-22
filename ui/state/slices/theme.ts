import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'dark' | 'light';

export interface ThemeState {
    theme: Theme;
}

const initialState: ThemeState = {
    theme: 'light',
};

const slice = createSlice({
    name: 'theme',
    initialState: initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<Theme>): void => {
            state.theme = action.payload;
        },
    },
});

export const { setTheme } = slice.actions;
export default slice.reducer;
