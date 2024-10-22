import React from 'react';
import Amalgam from "@/components/amalgam/Amalgam";
import {ThemedView} from "@/components/ThemedView";
import {ScrollView} from "react-native";
import SelectedProject from "@/components/project/SelectedProject";

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
