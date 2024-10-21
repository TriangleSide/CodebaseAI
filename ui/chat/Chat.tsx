import React from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Input, Button } from 'react-native-elements';
import ChatAPIClient, { Message } from "./ChatAPIClient";
import ChatCard from "./ChatCard";
import { AmalgamSummary } from "@/amalgam/AmalgamSummary";
import AmalgamAPIClient, { AmalgamResponse } from "../amalgam/AmalgamAPIClient";
import { Roles } from "./Roles";
import { Project } from "@/projects/ProjectAPIClient";
import { RootState } from "@/state/Reducer";
import { ProjectSummary } from "@/projects/ProjectSummary";
import { connectToRootStore } from "@/state/Connect";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from "@/components/ThemedView";

interface StoreProps {
    selectedProject: Project | null;
}

const mapStoreToProps = (state: RootState): StoreProps => ({
    selectedProject: state.project.selectedProject
});

interface OwnProps {}

type Props = OwnProps & StoreProps

interface State {
    amalgamError: string | null;
    amalgamLoading: boolean;
    amalgamData: AmalgamResponse | null;
    messages: Message[];
    input: string;
    loading: boolean;
}

class Chat extends React.Component<Props, State> {
    chatScrollRef: React.RefObject<ScrollView>;

    constructor(props: Props) {
        super(props);
        this.state = this.emptyState();
        this.chatScrollRef = React.createRef();
    }

    emptyState(): State {
        return {
            amalgamError: null,
            amalgamLoading: true,
            amalgamData: null,
            messages: [],
            input: '',
            loading: false,
        }
    }

    componentDidMount() {
        this.fetchAmalgamData();
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.selectedProject?.id !== prevProps.selectedProject?.id) {
            this.setState(this.emptyState());
            this.fetchAmalgamData();
        }
        if (this.chatScrollRef.current) {
            this.chatScrollRef.current.scrollToEnd({ animated: true });
        }
    }

    fetchAmalgamData = async () => {
        this.setState({
            amalgamError: null,
            amalgamData: null,
            amalgamLoading: true,
        });
        try {
            if (!this.props.selectedProject) {
                throw new Error('Project not found');
            }
            const data = await AmalgamAPIClient.fetchAmalgam(this.props.selectedProject.id);
            this.setState({
                amalgamError: null,
                amalgamData: data,
                amalgamLoading: false,
            });
        } catch (err) {
            console.error('Failed to fetch amalgam data:', err);
            this.setState({
                amalgamError: 'Error fetching amalgam data',
                amalgamData: null,
                amalgamLoading: false,
            });
        }
    };

    handleSendMessage = async () => {
        if (this.state.input.trim() === '') return;

        let messages: Message[] = this.state.messages;
        messages = [...messages, { role: Roles.USER, content: this.state.input.trim() }];
        messages = [...messages, { role: Roles.ASSISTANT, content: "" }];

        this.setState({
            messages: messages,
            input: '',
            loading: true,
        });

        const tokenCallback = (token: string) => {
            this.setState((prevState: State) => {
                const updatedMessages: Message[] = [...prevState.messages];
                const lastMessage: Message = updatedMessages[updatedMessages.length - 1];

                if (lastMessage.role === Roles.ASSISTANT) {
                    lastMessage.content += token;
                } else {
                    updatedMessages.push({ role: Roles.ASSISTANT, content: token });
                }

                return {
                    messages: updatedMessages,
                };
            });
        };

        try {
            const apiRequestMessages: Message[] = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            } as Message));

            apiRequestMessages[0].content = this.state.amalgamData?.content + "// User request below.\n\n" + apiRequestMessages[0].content;

            await ChatAPIClient.sendMessage(apiRequestMessages, tokenCallback);
            this.setState({ loading: false });
        } catch (error) {
            this.setState((prevState) => ({
                loading: false,
                messages: [...prevState.messages, { role: Roles.ASSISTANT, content: 'Error: ' + error }],
            }));
        }
    };

    handleInputChange = (value: string) => {
        this.setState({ input: value });
    };

    handleKeyPress = ({ nativeEvent }: any) => {
        if (nativeEvent.key === 'Enter') {
            this.handleSendMessage();
        }
    };

    render() {
        const { messages, input, loading, amalgamError, amalgamLoading, amalgamData } = this.state;

        if (amalgamError) {
            return (
                <ThemedView style={styles.container}>
                    <ThemedText style={styles.errorText}>Error fetching amalgam data: {amalgamError}</ThemedText>
                </ThemedView>
            )
        }

        let amalgamMsg: string;
        if (amalgamLoading) {
            amalgamMsg = "Loading codebase amalgam..."
        } else if (amalgamData != null) {
            amalgamMsg = AmalgamSummary(amalgamData)
        } else {
            amalgamMsg = "Error loading codebase amalgam."
        }
        amalgamMsg = ProjectSummary(this.props.selectedProject) + "\n\n" + amalgamMsg

        return (
            <ThemedView>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={60}
                >
                    <ThemedText style={styles.header}>Codebase AI Chat</ThemedText>
                    <ThemedText style={styles.description}>This app adds the codebase amalgam to the beginning of the chat.</ThemedText>
                    <ScrollView
                        ref={this.chatScrollRef}
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
                        onChangeText={this.handleInputChange}
                        onSubmitEditing={this.handleSendMessage}
                        multiline
                        containerStyle={styles.inputContainer}
                        inputStyle={styles.input}
                    />
                    <Button
                        title={loading ? 'Sending...' : 'Send'}
                        onPress={this.handleSendMessage}
                        disabled={loading || amalgamLoading}
                        buttonStyle={styles.button}
                    />
                </KeyboardAvoidingView>
            </ThemedView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
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

export default connectToRootStore<OwnProps, StoreProps>(Chat, mapStoreToProps);
