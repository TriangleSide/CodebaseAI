import React from 'react';
import Projects from "@/components/project/Projects";
import { ScrollView } from 'react-native';
import ThemedView from "@/components/themed/ThemedView";

export default function ProjectsScreen(): React.ReactNode {
    return (
        <ScrollView>
            <ThemedView>
                <Projects />
            </ThemedView>
        </ScrollView>
    );
}
