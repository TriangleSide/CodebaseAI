import React from 'react';
import { StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { role, Roles } from '@/api/ChatAPIClient';
import ThemedCard from "react-native-elements/dist/card/Card";

interface Props {
    role: role;
    content: string;
}

class ChatCard extends React.Component<Props> {
    render() {
        const { role, content } = this.props;

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

        let children: any[];

        return (
            // @ts-ignore
            <ThemedCard containerStyle={cardStyle}>
                <ThemedCard.Title>{user}</ThemedCard.Title>
                <ThemedCard.Divider />
                <Markdown>
                    {content}
                </Markdown>
            </ThemedCard>
        );
    }
}

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
