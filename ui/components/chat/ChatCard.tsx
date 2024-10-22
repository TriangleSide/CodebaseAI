import React from 'react';
import { StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { role, Roles } from '@/api/ChatAPIClient';
import { Card } from 'react-native-elements';
import ThemedText from "@/components/themed/ThemedText";
import ThemedCard from "@/components/themed/ThemedCard";
import Theme from "@/state/slices/theme";

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
        default:
            throw new Error("Unknown role.");
    }

    return (
        <ThemedCard containerStyle={cardStyle}>
            <Card.Title>
                <ThemedText>{user}</ThemedText>
            </Card.Title>
            <Card.Divider />
            {useMarkdown? <Markdown>{content}</Markdown> : <ThemedText>{content}</ThemedText>}
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
        borderColor: '#DC143C',
    },
});

export default ChatCard;
