import React from 'react';
import { Card } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

export interface ChatCardState {}
export interface ChatCardProps {
    role: 'user' | 'assistant' | 'codebase';
    content: string;
}

export default class ChatCard extends React.Component<ChatCardProps, ChatCardState> {
    constructor(props: ChatCardProps) {
        super(props);
        this.state = {};
    }

    render() {
        const { role, content } = this.props;

        let user: string;
        if (role === 'user') {
            user = "User"
        } else if (role === 'assistant') {
            user = "AI"
        } else if (role === 'codebase') {
            user = "Codebase"
        } else {
            throw new Error("Unknown role.")
        }

        return (
            <Card className={`mb-2 text-white bg-dark card-${role}`}>
                <Card.Body>
                    <ReactMarkdown>{`**${user}:**\n\n${content}`}</ReactMarkdown>
                </Card.Body>
            </Card>
        );
    }
}