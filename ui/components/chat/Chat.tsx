import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Input, Button } from 'react-native-elements';
import ChatAPIClient, { Message } from "@/api/ChatAPIClient";
import ChatCard from "./ChatCard";
import { amalgamSummary } from "@/components/amalgam/summary";
import AmalgamAPIClient, { AmalgamResponse } from "@/api/AmalgamAPIClient";
import { Roles } from "@/api/ChatAPIClient";
import { projectSummary } from "@/components/project/summary";
import ThemedText from "@/components/themed/ThemedText";
import ThemedView from "@/components/themed/ThemedView";
import { useStoreSelector } from "@/state/store";
import { selectSelectedProject } from "@/state/slices/project";

interface Props {}

const Chat: React.FC<Props> = () => {
    const chatScrollRef = useRef<ScrollView>(null);
    const selectedProject = useStoreSelector(selectSelectedProject);

    const [amalgamError, setAmalgamError] = useState<string | null>(null);
    const [amalgamLoading, setAmalgamLoading] = useState(true);
    const [amalgamData, setAmalgamData] = useState<AmalgamResponse | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchAmalgamData = async () => {
        setAmalgamError(null);
        setAmalgamData(null);
        setAmalgamLoading(true);
        try {
            if (!selectedProject) {
                throw new Error('Project not found');
            }
            const data = await AmalgamAPIClient.fetchAmalgam(selectedProject.id);
            setAmalgamData(data);
            setAmalgamLoading(false);
        } catch (err) {
            console.error('Failed to fetch amalgam data:', err);
            setAmalgamError('Error fetching amalgam data');
            setAmalgamLoading(false);
        }
    };

    useEffect(() => {
        fetchAmalgamData();
    }, [selectedProject?.id]);

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (input.trim() === '') return;

        let updatedMessages = [...messages, { role: Roles.USER, content: input.trim() }, { role: Roles.ASSISTANT, content: "" }];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);

        const tokenCallback = (token: string) => {
            setMessages((prevMessages) => {
                const lastMessage = { ...prevMessages[prevMessages.length - 1] };
                if (lastMessage.role === Roles.ASSISTANT) {
                    lastMessage.content += token;
                }
                return [...prevMessages.slice(0, -1), lastMessage];
            });
        };

        try {
            const apiRequestMessages = updatedMessages.map(msg => ({ role: msg.role, content: msg.content }));
            apiRequestMessages[0].content = amalgamData?.content + "// User request below.\n\n" + apiRequestMessages[0].content;

            await ChatAPIClient.sendMessage(apiRequestMessages, tokenCallback);
            setLoading(false);
        } catch (error) {
            setMessages((prevMessages) => [...prevMessages, { role: Roles.ASSISTANT, content: 'Error: ' + error }]);
            setLoading(false);
        }
    };

    if (amalgamError) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText style={styles.errorText}>Error fetching amalgam data: {amalgamError}</ThemedText>
            </ThemedView>
        );
    }

    const amalgamMsg = amalgamLoading
        ? "Loading codebase amalgam..."
        : amalgamData
            ? projectSummary(selectedProject) + "\n\n" + amalgamSummary(amalgamData)
            : "Error loading codebase amalgam.";

    return (
        <ThemedView>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={60}
            >
                <ThemedText type={"title"}>Codebase AI Chat</ThemedText>
                <ThemedText style={styles.description}>This app adds the codebase amalgam to the beginning of the chat.</ThemedText>
                <ScrollView
                    ref={chatScrollRef}
                    style={styles.chatContainer}
                    contentContainerStyle={styles.chatContent}
                >
                    <ChatCard key={"amalgam"} role={Roles.CODEBASE} content={amalgamMsg} />
                    {messages.map((msg, index) => (
                        <ChatCard key={index} role={msg.role} content={msg.content} />
                    ))}
                </ScrollView>
                <Input
                    placeholder="Chat with AI about your codebase..."
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={handleSendMessage}
                    multiline
                    containerStyle={styles.inputContainer}
                    inputStyle={styles.input}
                />
                <Button
                    title={loading ? 'Sending...' : 'Send'}
                    onPress={handleSendMessage}
                    disabled={loading || amalgamLoading}
                    buttonStyle={styles.button}
                />
            </KeyboardAvoidingView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    description: {
        fontSize: 16,
        marginBottom: 16,
    },
    chatContainer: {
        flex: 1,
        marginBottom: 16,
    },
    chatContent: {
        paddingVertical: 8,
    },
    inputContainer: {
        marginBottom: 8,
    },
    input: {
        minHeight: 60,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#2089dc',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
});

export default Chat;
