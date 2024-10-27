import React from 'react';
import Chat from "@/components/chat/Chat";
import SelectedProject from "@/components/project/SelectedProject";
import { ThemedView } from "@triangleside/reactnativebase";
import {ScrollView} from "react-native";

export default function ChatScreen(): React.ReactNode {
    return (
        <ScrollView>
            <ThemedView centerHorizontally={true}>
                <SelectedProject>
                    <Chat />
                </SelectedProject>
            </ThemedView>
        </ScrollView>
    );
}
