import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Props {}
interface State {}

export default class HomeScreen extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <ThemedView>
                    <ThemedText type="title" style={styles.title}>
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
            </ScrollView>
        );
    }
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