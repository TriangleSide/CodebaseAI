import React from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import ApiClient, { AmalgamResponse, Message } from "./APIClient";
import ChatCard from "./ChatCard";
import {AmalgamSummary} from "./Amalgam";

export interface ChatProps {}
export interface ChatState {
    error: string | null;
    amalgamLoading: boolean;
    amalgamData: AmalgamResponse | null;
    messages: Message[];
    input: string;
    loading: boolean;
}

export default class Chat extends React.Component<ChatProps, ChatState> {
    chatContainerRef: React.RefObject<HTMLDivElement>;

    constructor(props: ChatProps) {
        super(props);
        this.state = {
            error: null,
            amalgamLoading: true,
            amalgamData: null,
            messages: [],
            input: '',
            loading: false,
        };
        this.chatContainerRef = React.createRef();
    }

    componentDidMount() {
        this.fetchAmalgamData();
    }

    fetchAmalgamData = async () => {
        try {
            const data = await ApiClient.fetchAmalgam();
            this.setState({ amalgamData: data, amalgamLoading: false });
        } catch (err) {
            console.error('Failed to fetch amalgam data:', err);
            this.setState({ amalgamData: null, amalgamLoading: false });
        }
    };

    handleSendMessage = async () => {
        if (this.state.input.trim() === '') return;

        const newMessage: Message = { role: 'user', content: this.state.input.trim() };
        this.setState((prevState) => ({
            messages: [...prevState.messages, newMessage],
            input: '',
            loading: true,
        }));

        const tokenCallback = (token: string) => {
            this.setState((prevState) => {
                const updatedMessages = [...prevState.messages];
                const lastMessage = updatedMessages[updatedMessages.length - 1];

                if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content += token;
                } else {
                    updatedMessages.push({ role: 'assistant', content: token });
                }

                return { messages: updatedMessages };
            });
        };

        try {
            const chatRequestMessages = this.state.messages.map(msg => ({
                role: msg.role,
                content: msg.content
            } as Message));

            chatRequestMessages.push({
                role: 'user',
                content: newMessage.content,
            } as Message);

            chatRequestMessages[0].content = this.state.amalgamData?.content + "// User request below.\n\n" + chatRequestMessages[0].content;

            await ApiClient.sendMessage(chatRequestMessages, tokenCallback);
            this.setState({ loading: false });
        } catch (error) {
            this.setState((prevState) => ({
                loading: false,
                messages: [...prevState.messages, { role: 'assistant', content: 'Error: ' + error }],
            }));
        }
    };

    handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ input: event.target.value });
    };

    handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            this.handleSendMessage();
        }
    };

    componentDidUpdate() {
        if (this.chatContainerRef.current) {
            this.chatContainerRef.current.scrollTop = this.chatContainerRef.current.scrollHeight;
        }
    }

    render() {
        const { messages, input, loading, amalgamLoading, amalgamData } = this.state;

        let amalgamMsg: string;
        if (amalgamLoading) {
            amalgamMsg = "Loading codebase amalgam..."
        } else if (amalgamData != null) {
            amalgamMsg = AmalgamSummary(amalgamData)
        } else {
            amalgamMsg = "Error loading codebase amalgam."
        }

        return (
            <Container>
                <br/>
                <h1>Codebase AI Chat</h1>
                <p>This app adds the codebase amalgam to the beginning of the chat.</p>
                <br/>
                <div ref={this.chatContainerRef} className="chat-container">
                    <ChatCard key={"amalgam"} role={"codebase"} content={amalgamMsg}/>
                    {messages.map((msg, index) => (
                        <ChatCard key={index} role={msg.role} content={msg.content}/>
                    ))}
                </div>
                <Form.Group className="mb-3">
                    <Form.Control
                        className="text-white bg-dark"
                        type="text"
                        placeholder="Chat with AI about your codebase..."
                        value={input}
                        onChange={this.handleInputChange}
                        onKeyUp={this.handleKeyPress}
                    />
                </Form.Group>
                <Button onClick={this.handleSendMessage} variant="primary" disabled={loading || amalgamLoading}>
                    {loading ? 'Sending...' : 'Send'}
                </Button>
            </Container>
        );
    }
}
