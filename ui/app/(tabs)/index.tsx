import React from 'react';
import { ScrollView } from 'react-native';
import Home from "@/components/home/Home";
import { ThemedView } from "@triangleside/reactnativebase";

export default function HomeScreen(): React.ReactNode {
    return (
        <ScrollView>
            <ThemedView centerHorizontally={true}>
                <Home/>
            </ThemedView>
        </ScrollView>
    );
}
