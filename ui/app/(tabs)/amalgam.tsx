import React from 'react';
import Amalgam from "@/amalgam/Amalgam";
import {ThemedView} from "@/components/ThemedView";
import {ScrollView} from "react-native";
import SelectedProject from "@/projects/SelectedProject";

interface Props {}
interface State {}

class AmalgamScreen extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <ScrollView>
                <ThemedView>
                    <SelectedProject>
                        <Amalgam />
                    </SelectedProject>
                </ThemedView>
            </ScrollView>
        );
    }
}

export default AmalgamScreen;
