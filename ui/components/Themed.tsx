import React, { useEffect } from 'react';
import { Dispatch } from 'redux';
import { RootState } from "@/state/store";
import { connectToStore } from "@/state/connect";
import { setTheme, Theme } from "@/state/slices/theme";
import { useColorScheme } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";

interface DispatchProps {
    setTheme: (theme: Theme) => void;
}

interface StoreProps {
    theme: Theme | null;
}

interface OwnProps {
    children: React.ReactNode;
}

const mapStoreToProps = (state: RootState): StoreProps => ({
    theme: state.theme.theme
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    setTheme: (theme: Theme) => dispatch(setTheme(theme)),
});

type Props = OwnProps & StoreProps & DispatchProps;

const Themed: React.FC<Props> = ({ theme, setTheme, children }) => {
    const colorScheme = useColorScheme();
    const systemTheme = colorScheme ?? 'light';

    useEffect(() => {
        if (theme !== systemTheme) {
            console.log("Setting theme to '" + systemTheme + "'.")
            setTheme(systemTheme);
        }
    }, [theme, systemTheme, setTheme]);

    if (theme == null) {
        console.debug("Theme is not set.")
        return null;
    } else {
        return (
            <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
                {children}
            </ThemeProvider>
        );
    }
};

export default connectToStore<OwnProps, StoreProps, DispatchProps>(Themed, mapStoreToProps, mapDispatchToProps);
