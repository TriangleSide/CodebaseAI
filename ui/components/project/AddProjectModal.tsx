import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Overlay, Button, Input } from 'react-native-elements';
import ThemedText from "@/components/themed/ThemedText";
import ThemedView from "@/components/themed/ThemedView";

interface Props {
    show: boolean;
    onHide: () => void;
    onAddProject: (path: string) => void;
}

const AddProjectModal: React.FC<Props> = ({ show, onHide, onAddProject }) => {
    const [projectPath, setProjectPath] = useState<string>('');

    const handleSubmit = () => {
        onAddProject(projectPath);
        onHide();
    };

    const handleProjectPathChange = (value: string) => {
        setProjectPath(value);
    };

    return (
        <Overlay
            isVisible={show}
            onBackdropPress={onHide}
            overlayStyle={styles.overlay}
        >
            <ThemedText style={styles.title}>
                Add New Project
            </ThemedText>
            <Input
                label="Project Path"
                placeholder="Enter project path"
                value={projectPath}
                onChangeText={handleProjectPathChange}
                inputStyle={styles.input}
                labelStyle={styles.label}
            />
            <ThemedView style={styles.buttonContainer}>
                <Button
                    title="Close"
                    type="outline"
                    onPress={onHide}
                    buttonStyle={styles.button}
                    titleStyle={styles.buttonTitle}
                />
                <Button
                    title="Add Project"
                    onPress={handleSubmit}
                    buttonStyle={styles.button}
                    titleStyle={styles.buttonTitle}
                />
            </ThemedView>
        </Overlay>
    );
};

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

export default AddProjectModal;
