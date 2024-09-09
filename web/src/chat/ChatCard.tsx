import React from 'react';
import { Card } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import {Roles, role} from "./Roles";

interface Props {
    role: role;
    content: string;
}
interface State {}

export default class ChatCard extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
        const { role, content } = this.props;

        let user: string;
        if (role === Roles.USER) {
            user = "User"
        } else if (role === Roles.ASSISTANT) {
            user = "AI"
        } else if (role === Roles.CODEBASE) {
            user = "Codebase"
        } else {
            throw new Error("Unknown role.")
        }

        return (
            <Card className={`mb-2 text-white bg-dark card-${role}`}>
                <Card.Body>
                    <ReactMarkdown>
                        {`**${user}:**\n\n${content}`}
                    </ReactMarkdown>
                </Card.Body>
            </Card>
        );
    }
}