import React, { useEffect } from 'react';
import { useStoreDispatch, useStoreSelector } from "@/state/store";
import { selectTheme, setTheme } from "@/state/slices/theme";
import { useColorScheme } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";

interface Props {
    children: React.ReactNode;
}

export const Themed: React.FC<Props> = (props: Props) => {
    const colorScheme = useColorScheme();
    const systemTheme = colorScheme ?? 'light';

    const theme = useStoreSelector(selectTheme)
    const dispatch = useStoreDispatch()

    useEffect(() => {
        if (theme !== systemTheme) {
            console.log("Setting theme to '" + systemTheme + "'.")
            dispatch(setTheme(systemTheme))
        }
    }, [theme, systemTheme]);

    if (theme == null) {
        console.debug("Theme is not set.")
        return null;
    } else {
        return (
            <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
                {props.children}
            </ThemeProvider>
        );
    }
};

export default Themed;
