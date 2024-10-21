import React from 'react';
import Projects from "@/projects/Projects";
import { ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

interface Props {}
interface State {}

class ProjectsScreen extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <ScrollView>
                <ThemedView>
                    <Projects />
                </ThemedView>
            </ScrollView>
        );
    }
}

export default ProjectsScreen;
