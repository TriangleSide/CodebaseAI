import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Overlay, Button, Input, Text } from 'react-native-elements';

interface Props {
    show: boolean;
    onHide: () => void;
    onAddProject: (path: string) => void;
}

interface State {
    projectPath: string;
}

export default class AddProjectModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { projectPath: '' };
    }

    handleSubmit = () => {
        this.props.onAddProject(this.state.projectPath);
        this.props.onHide();
    };

    handleProjectPathChange = (value: string) => {
        this.setState({ projectPath: value });
    };

    render() {
        return (
            <Overlay
                isVisible={this.props.show}
                onBackdropPress={this.props.onHide}
                overlayStyle={styles.overlay}
            >
                <Text h4 style={styles.title}>
                    Add New Project
                </Text>
                <Input
                    label="Project Path"
                    placeholder="Enter project path"
                    value={this.state.projectPath}
                    onChangeText={this.handleProjectPathChange}
                    inputStyle={styles.input}
                    labelStyle={styles.label}
                />
                <View style={styles.buttonContainer}>
                    <Button
                        title="Close"
                        type="outline"
                        onPress={this.props.onHide}
                        buttonStyle={styles.button}
                        titleStyle={styles.buttonTitle}
                    />
                    <Button
                        title="Add Project"
                        onPress={this.handleSubmit}
                        buttonStyle={styles.button}
                        titleStyle={styles.buttonTitle}
                    />
                </View>
            </Overlay>
        );
    }
}

const styles = StyleSheet.create({
    overlay: {
        backgroundColor: '#000',
        padding: 20,
        borderRadius: 10,
    },
    title: {
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        color: '#fff',
    },
    label: {
        color: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        width: 120,
        backgroundColor: '#1e90ff',
    },
    buttonTitle: {
        color: '#fff',
    },
});
