import React from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { API_BASE_URL } from './Constants';
import ReactMarkdown from 'react-markdown';
import ApiClient, {Message} from "./APIClient";

interface ApiStreamResponse {
    content: string | null;
    success: boolean | null;
}

export interface ChatProps {}
export interface ChatState {
    messages: Message[];
    input: string;
    loading: boolean;
    error: string | null;
    amalgamData: string | null;
}

export default class Chat extends React.Component<ChatProps, ChatState> {
    chatContainerRef: React.RefObject<HTMLDivElement>;

    constructor(props: ChatProps) {
        super(props);
        this.state = {
            messages: [],
            input: '',
            loading: false,
            error: null,
            amalgamData: null,
        };
        this.chatContainerRef = React.createRef();
    }

    componentDidMount() {
        this.fetchAmalgamData();
    }

    fetchAmalgamData = async () => {
        try {
            const data = await ApiClient.fetchAmalgam();
            this.setState({ amalgamData: data });
        } catch (err) {
            console.error('Failed to fetch amalgam data:', err);
            this.setState({ amalgamData: null });
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

        try {
            const chatRequestMessages = this.state.messages.map(msg => ({
                role: msg.role,
                content: msg.content
            } as Message));

            chatRequestMessages.push({
                role: 'user',
                content: newMessage.content,
            } as Message);

            chatRequestMessages[0].content = this.state.amalgamData + "// User request below.\n\n" + chatRequestMessages[0].content;

            const response = await ApiClient.sendMessage(chatRequestMessages);
            const reader = response.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(Boolean);
                    for (const line of lines) {
                        if (line.trim()) {
                            const streamResponse: ApiStreamResponse = JSON.parse(line);
                            if (streamResponse.success != null) {
                                break;
                            } else if (streamResponse.content != null) {
                                this.setState((prevState) => {
                                    const updatedMessages = [...prevState.messages];
                                    const lastMessage = updatedMessages[updatedMessages.length - 1];

                                    if (lastMessage && lastMessage.role === 'assistant') {
                                        lastMessage.content += streamResponse.content;
                                    } else {
                                        updatedMessages.push({ role: 'assistant', content: streamResponse.content } as Message);
                                    }

                                    return { messages: updatedMessages };
                                });
                            } else {
                                throw new Error('Unknown response stream state.');
                            }
                        }
                    }
                }
            }

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
        const { messages, input, loading, amalgamData } = this.state;

        return (
            <Container>
                <h1>Codebase AI Chat</h1>
                <p>This chat app prepends the codebase to the chat.</p>
                <div ref={this.chatContainerRef} className="chat-container" style={{ maxHeight: '500px', overflowY: 'auto', marginBottom: '20px' }}>
                    <Card key={"amalgam_counter"} className={`mb-2 'bg-light'}`}>
                        <Card.Body>
                            {amalgamData != null
                                ? <Card.Text>The amalgam has {amalgamData.length} characters.</Card.Text>
                                : <Card.Text>No amalgam data.</Card.Text>}
                        </Card.Body>
                    </Card>
                    {messages.map((msg, index) => (
                        <Card key={index} className={`mb-2 text-white bg-dark`}>
                            <Card.Body>
                                <ReactMarkdown>{`**${msg.role === 'user' ? 'User' : 'AI'}:**\n\n${msg.content}`}</ReactMarkdown>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
                <Form.Group className="mb-3">
                    <Form.Control
                        className="text-white bg-dark"
                        type="text"
                        placeholder="Type a message..."
                        value={input}
                        onChange={this.handleInputChange}
                        onKeyPress={this.handleKeyPress}
                    />
                </Form.Group>
                <Button onClick={this.handleSendMessage} variant="primary" disabled={loading}>
                    {loading ? 'Sending...' : 'Send'}
                </Button>
            </Container>
        );
    }
}
