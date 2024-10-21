import React from 'react';
import Chat from "@/chat/Chat";
import SelectedProject from "@/projects/SelectedProject";
import {ThemedView} from "@/components/ThemedView";
import {ScrollView} from "react-native";

interface Props {}
interface State {}

class ChatScreen extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <ScrollView>
                <ThemedView>
                    <SelectedProject>
                        <Chat />
                    </SelectedProject>
                </ThemedView>
            </ScrollView>
        );
    }
}

export default ChatScreen;
