import React from 'react';
import { StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { role, Roles } from '@/api/ChatAPIClient';
import { Card } from 'react-native-elements';

interface Props {
    role: role;
    content: string;
}

const ChatCard: React.FC<Props> = ({ role, content }) => {
    let cardStyle = styles.card;
    let user: string;

    switch (role) {
        case Roles.USER:
            user = "User";
            cardStyle = { ...styles.card, ...styles.userCard };
            break;
        case Roles.ASSISTANT:
            user = "AI";
            cardStyle = { ...styles.card, ...styles.assistantCard };
            break;
        case Roles.CODEBASE:
            user = "Codebase";
            cardStyle = { ...styles.card, ...styles.codebaseCard };
            break;
        default:
            throw new Error("Unknown role.");
    }

    return (
        // @ts-ignore
        <Card containerStyle={cardStyle}>
            <Card.Title>{user}</Card.Title>
            <Card.Divider />
            <Markdown>{content}</Markdown>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 10,
        borderRadius: 8,
        padding: 15,
        backgroundColor: '#333',
        borderWidth: 5,
    },
    userCard: {
        borderColor: '#007ACC',
    },
    assistantCard: {
        borderColor: '#28A745',
    },
    codebaseCard: {
        borderColor: '#DC143C',
    },
});

export default ChatCard;
