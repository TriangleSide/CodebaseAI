import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from 'react-native-elements';
import ChatAPIClient, { Message } from "@/api/ChatAPIClient";
import ChatCard from "./ChatCard";
import { amalgamSummary } from "@/components/amalgam/summary";
import AmalgamAPIClient, { AmalgamResponse } from "@/api/AmalgamAPIClient";
import { Roles } from "@/api/ChatAPIClient";
import { projectSummary } from "@/components/project/summary";
import { useStoreSelector } from "@/state/store";
import { selectSelectedProject } from "@/state/slices/project";
import { ThemedInput, ThemedView, ThemedText } from "@triangleside/reactnativebase";

interface Props {}

const Chat: React.FC<Props> = () => {
    const chatScrollRef = useRef<ScrollView>(null);
    const selectedProject = useStoreSelector(selectSelectedProject);

    const [amalgamError, setAmalgamError] = useState<string | null>(null);
    const [amalgamLoading, setAmalgamLoading] = useState(true);
    const [amalgamData, setAmalgamData] = useState<AmalgamResponse | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const fetchAmalgamData = async () => {
        setAmalgamLoading(true);
        setAmalgamData(null);
        setAmalgamError(null);
        if (!selectedProject) {
            throw new Error('Project not found');
        }
        await AmalgamAPIClient.fetchAmalgam(selectedProject.id).then().catch((err) => {
            setAmalgamError('Error fetching amalgam data: ' + (err.message || err));
            return null;
        }).finally(() => {
            setAmalgamLoading(false);
        }).then((data) => {
            setAmalgamData(data);
        })
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
        if (loading || amalgamLoading || inputValue.trim() === '') {
            return;
        }

        let updatedMessages = [...messages, { role: Roles.USER, content: inputValue.trim() }, { role: Roles.ASSISTANT, content: "" }];
        setMessages(updatedMessages);
        setInputValue('');
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

        const apiRequestMessages = updatedMessages.map(msg => ({ role: msg.role, content: msg.content }));
        apiRequestMessages[0].content = amalgamData?.content + "// User request below.\n\n" + apiRequestMessages[0].content;
        await ChatAPIClient.sendMessage(apiRequestMessages, tokenCallback).catch((err) => {
            setMessages((prevMessages) =>
                [...prevMessages, { role: Roles.ERROR, content: 'Error while sending the request: ' + err}]
            );
        }).finally(() => {
            setLoading(false);
        });
    };

    const handleTextChange = (text: string) => {
        setInputValue(text);
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
                <ThemedText style={styles.description}>This adds the codebase amalgam to the beginning of the chat.</ThemedText>
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
                <ThemedInput
                    placeholder="Chat with AI about your codebase..."
                    multiline={true}
                    style={[styles.input]}
                    onChangeText={(text) => handleTextChange(text)}
                    value={inputValue}
                />
                <Button
                    title={loading ? 'Sending...' : 'Send'}
                    onPress={handleSendMessage}
                    disabled={loading || amalgamLoading}
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
    input: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 4,
        borderWidth: 1,
        textAlignVertical: 'top',
        minHeight: 60,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
});

export default Chat;
