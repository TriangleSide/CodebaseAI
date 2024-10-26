import React from 'react';
import Projects from "@/components/project/Projects";
import { ScrollView } from 'react-native';
import { ThemedView } from "@triangleside/reactnativebase";

export default function ProjectsScreen(): React.ReactNode {
    return (
        <ScrollView>
            <ThemedView center={true}>
                <Projects />
            </ThemedView>
        </ScrollView>
    );
}
