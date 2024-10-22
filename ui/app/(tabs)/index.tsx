import React from 'react';
import { ScrollView } from 'react-native';
import Home from "@/components/home/Home";
import ThemedView from "@/components/themed/ThemedView";

export default function HomeScreen(): React.ReactNode {
    return (
        <ScrollView>
            <ThemedView center={true}>
                <Home/>
            </ThemedView>
        </ScrollView>
    );
}
