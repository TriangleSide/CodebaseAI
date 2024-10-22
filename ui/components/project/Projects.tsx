import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    ActivityIndicator,
    FlatList
} from 'react-native';
import { Button, ListItem } from 'react-native-elements';
import AddProjectModal from '@/components/project/AddProjectModal';
import { ProjectAPIClient, Project } from "@/api/ProjectAPIClient";
import { useStoreDispatch } from "@/state/store";
import { clearSelectedProject, setSelectedProject } from "@/state/slices/project";
import ThemedView from "@/components/themed/ThemedView";
import ThemedText from "@/components/themed/ThemedText";
import ThemedListItem from "@/components/themed/ThemedListItem";

interface OwnProps {
    children?: React.ReactNode;
}

const Projects: React.FC<OwnProps> = ({ children }) => {
    const dispatch = useStoreDispatch();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>();

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            setSelectedProjectId(undefined);
            dispatch(clearSelectedProject());

            const listProjectsResponse = await ProjectAPIClient.list();
            const fetchedProjects = listProjectsResponse.projects;
            let selectedId: number | undefined = undefined;

            if (fetchedProjects.length > 0) {
                selectedId = fetchedProjects[0].id;
                dispatch(setSelectedProject({
                    id: fetchedProjects[0].id,
                    path: fetchedProjects[0].path,
                }));
            }

            const sortedProjects = fetchedProjects.sort((a, b) => a.path.localeCompare(b.path));
            setProjects(sortedProjects);
            setSelectedProjectId(selectedId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
            setSelectedProjectId(undefined);
            dispatch(clearSelectedProject());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleAddProject = async (projectPath: string) => {
        try {
            setLoading(true);
            setProjects([]);
            setError(null);
            setSelectedProjectId(undefined);

            await ProjectAPIClient.create(projectPath);
            await fetchProjects();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while adding the project';
            setError(errorMessage);
            setLoading(false);
        }
    };

    const toggleModal = () => {
        setShowModal(prevState => !prevState);
    };

    const deleteProject = async (project: Project) => {
        try {
            setLoading(true);
            await ProjectAPIClient.delete(project.id);
            await fetchProjects();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete the project';
            setError(errorMessage);
            setLoading(false);
        }
    };

    const handleSelect = async (project: Project) => {
        setSelectedProjectId(project.id);
        try {
            await ProjectAPIClient.update(project.id);
            dispatch(setSelectedProject(project));
        } catch (err) {
            console.error("Failed to update project", project, err);
        }
    };

    const renderItem = ({ item }: { item: Project }) => (
        <ThemedListItem
            bottomDivider
            onPress={() => handleSelect(item)}
            selected={item.id === selectedProjectId}
        >
            <ListItem.Content>
                <ListItem.Title>
                    <ThemedText>{item.path}</ThemedText>
                </ListItem.Title>
            </ListItem.Content>
            <Button
                title="Delete"
                type="clear"
                titleStyle={{ color: 'red' }}
                onPress={() => deleteProject(item)}
            />
        </ThemedListItem>
    );

    return (
        <ThemedView style={styles.container}>
            <ThemedText style={styles.header}>Projects</ThemedText>
            <ThemedText style={styles.description}>
                These are the absolute paths to the roots of your projects.
            </ThemedText>
            <Button
                title="Add New Project"
                onPress={toggleModal}
                buttonStyle={styles.addButton}
            />
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
            ) : error ? (
                <ThemedText style={styles.errorText}>{error}</ThemedText>
            ) : (
                <ThemedView style={styles.listContainer}>
                    {projects.length > 0 && (
                        <ThemedText style={styles.selectText}>Select a project below.</ThemedText>
                    )}
                    <FlatList
                        data={projects}
                        keyExtractor={(item) => item.id!.toString()}
                        renderItem={renderItem}
                    />
                    {children}
                </ThemedView>
            )}
            <AddProjectModal
                show={showModal}
                onHide={toggleModal}
                onAddProject={handleAddProject}
            />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        marginBottom: 16,
    },
    addButton: {
        marginBottom: 16,
    },
    loader: {
        marginTop: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginTop: 20,
    },
    listContainer: {
        flex: 1,
    },
    selectText: {
        fontSize: 16,
        marginBottom: 8,
    },
});

export default Projects;
