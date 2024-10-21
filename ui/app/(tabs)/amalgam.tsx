import React from 'react';
import Amalgam from "@/amalgam/amalgam";
import {ThemedView} from "@/components/ThemedView";
import {ScrollView} from "react-native";

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
                    <Amalgam/>
                </ThemedView>
            </ScrollView>
        );
    }
}

export default AmalgamScreen;
