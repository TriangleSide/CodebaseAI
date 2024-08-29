import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { API_BASE_URL } from './Constants';
import ReactMarkdown from 'react-markdown';

interface Message {
    sender: 'user' | 'assistant';
    content: string;
}

interface ApiStreamResponse {
    content: string | null;
    success: boolean | null;
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [amalgamData, setAmalgamData] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchAmalgamData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/amalgam`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const data = await response.text();
                setAmalgamData(data);
            } catch (err) {
                console.error('Failed to fetch amalgam data:', err);
                setAmalgamData(null);
            }
        };

        // Fetch amalgam data once when the component mounts
        fetchAmalgamData();
    }, []);

    const handleSendMessage = async () => {
        if (input.trim() === '') return;

        const newMessage: Message = { sender: 'user', content: input.trim() };
        setMessages((prev) => [...prev, newMessage]);
        setInput('');
        setLoading(true);

        try {
            const chatRequestMessages = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));

            chatRequestMessages.push({
                role: 'user',
                content: newMessage.content,
            })

            chatRequestMessages[0].content = amalgamData + chatRequestMessages[0].content;

            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: chatRequestMessages }),
            });

            const reader = response.body?.getReader();
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
                                setMessages((prev) => {
                                    const updatedMessages = [...prev];
                                    const lastMessage = updatedMessages[updatedMessages.length - 1];

                                    if (lastMessage && lastMessage.sender === 'assistant') {
                                        lastMessage.content += streamResponse.content;
                                    } else {
                                        updatedMessages.push({ sender: 'assistant', content: streamResponse.content } as Message);
                                    }

                                    return updatedMessages;
                                });
                            } else {
                                throw new Error('Unknown response stream state.')
                            }
                        }
                    }
                }
            }

            setLoading(false);
        } catch (error) {
            setLoading(false);
            setMessages((prev) => [
                ...prev,
                { sender: 'assistant', content: 'Error: ' + error },
            ]);
        }
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <Container>
            <h1>Codebase AI Chat</h1>
            <p>This chat app prepends the codebase to the chat.</p>
            <div ref={chatContainerRef} className="chat-container" style={{ maxHeight: '500px', overflowY: 'auto', marginBottom: '20px' }}>
                <Card key={"amalgam_counter"} className={`mb-2 'bg-light'}`}>
                    <Card.Body>
                        {amalgamData != null
                            ? <Card.Text>The amalgam has {amalgamData.length} characters.</Card.Text>
                            : <Card.Text>No amalgam data.</Card.Text>}
                    </Card.Body>
                </Card>
                {messages.map((msg, index) => (
                    <Card key={index} className={`mb-2 ${msg.sender === 'user' ? 'bg-light' : 'bg-info text-white'}`}>
                        <Card.Body>
                            <ReactMarkdown>{`**${msg.sender === 'user' ? 'User' : 'AI'}:**\n\n${msg.content}`}</ReactMarkdown>
                        </Card.Body>
                    </Card>
                ))}
            </div>
            <Form.Group className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
            </Form.Group>
            <Button onClick={handleSendMessage} variant="primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send'}
            </Button>
        </Container>
    );
};

export default Chat;
