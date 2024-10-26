import React from 'react';
import Amalgam from "@/components/amalgam/Amalgam";
import { ThemedView } from "@triangleside/reactnativebase";
import {ScrollView} from "react-native";
import SelectedProject from "@/components/project/SelectedProject";

export default function AmalgamScreen(): React.ReactNode {
    return (
        <ScrollView>
            <ThemedView center={true}>
                <SelectedProject>
                    <Amalgam />
                </SelectedProject>
            </ThemedView>
        </ScrollView>
    );
}
