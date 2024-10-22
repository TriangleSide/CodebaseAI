import React from 'react';
import { StyleSheet } from 'react-native';
import ThemedText, {TEXT_TYPES} from "@/components/themed/ThemedText";
import ThemedView from "@/components/themed/ThemedView";

export default function Home(): React.ReactNode {
    return (
        <ThemedView style={styles.container}>
            <ThemedText type={TEXT_TYPES.TITLE} style={styles.title}>
                CodebaseAI
            </ThemedText>
            <ThemedText style={styles.paragraph}>
                CodebaseAI is designed to help you perform AI inference on your entire GoLang codebase.
                It leverages OpenAI's GPT models to provide insights and recommendations based on the content
                of your codebase.
            </ThemedText>
            <ThemedText style={styles.paragraph}>
                Select an item from the menu to get started.
            </ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        marginBottom: 16,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
    },
});
