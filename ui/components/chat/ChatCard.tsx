import React from 'react';
import { StyleSheet } from 'react-native';
import { role, Roles } from '@/api/ChatAPIClient';
import { Card } from 'react-native-elements';
import { ThemedMarkdown, ThemedCardDivider, ThemedCard, ThemedText } from "@triangleside/reactnativebase";

interface Props {
    role: role;
    content: string;
}

const ChatCard: React.FC<Props> = ({ role, content }) => {
    let cardStyle = styles.card;
    let user: string;
    let useMarkdown: boolean = false;

    switch (role) {
        case Roles.USER:
            user = "User";
            cardStyle = { ...styles.card, ...styles.userCard };
            break;
        case Roles.ASSISTANT:
            user = "AI";
            cardStyle = { ...styles.card, ...styles.assistantCard };
            useMarkdown = true;
            break;
        case Roles.CODEBASE:
            user = "Codebase";
            cardStyle = { ...styles.card, ...styles.codebaseCard };
            break;
        case Roles.ERROR:
            user = "Error";
            cardStyle = { ...styles.card, ...styles.errorCard };
            break;
        default:
            throw new Error("Unknown role.");
    }

    return (
        <ThemedCard containerStyle={cardStyle}>
            <Card.Title>
                <ThemedText>{user}</ThemedText>
            </Card.Title>
            <ThemedCardDivider/>
            {useMarkdown? <ThemedMarkdown>{content}</ThemedMarkdown> : <ThemedText>{content}</ThemedText>}
        </ThemedCard>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 10,
        borderRadius: 8,
        padding: 15,
        borderWidth: 5,
    },
    userCard: {
        borderColor: '#007ACC',
    },
    assistantCard: {
        borderColor: '#28A745',
    },
    codebaseCard: {
        borderColor: '#FF7518',
    },
    errorCard: {
        borderColor: '#DC143C',
    },
});

export default ChatCard;
