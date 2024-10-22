import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import ThemedText from "@/components/themed/ThemedText";
import ThemedView from "@/components/themed/ThemedView";
import ThemedOverlay from "@/components/themed/ThemedOverlay";
import ThemedInput from "@/components/themed/ThemedInput";

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
        <ThemedOverlay
            isVisible={show}
            onBackdropPress={onHide}
            overlayStyle={styles.overlay}
        >
            <ThemedText style={styles.title}>
                Add New Project
            </ThemedText>
            <ThemedInput
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
        </ThemedOverlay>
    );
};

const styles = StyleSheet.create({
    overlay: {
        padding: 20,
        borderRadius: 10,
    },
    title: {
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        borderWidth: 3,
        padding: 5,
    },
    label: {
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        width: 120,
    },
    buttonTitle: {
    },
});

export default AddProjectModal;
