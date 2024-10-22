import React from 'react';
import {
    StyleSheet,
    ActivityIndicator,
    FlatList
} from 'react-native';
import { Button } from 'react-native-elements';
import AddProjectModal from '@/components/project/AddProjectModal';
import { ProjectAPIClient, Project } from "@/api/ProjectAPIClient";
import {RootState} from "@/state/store";
import {Dispatch} from "redux";
import {clearSelectedProject, setSelectedProject} from "@/state/slices/project";
import ThemedListItem from "react-native-elements/dist/list/ListItem";
import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";
import {connectToStore} from "@/state/connect";

interface DispatchProps {
    setSelectedProject: (project: Project) => void;
    clearSelectedProject: () => void;
}

interface StoreProps {}

interface OwnProps {
    children?: React.ReactNode;
}

const mapStoreToProps = (state: RootState): StoreProps => ({
    selectedProject: state.projects.selectedProject
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    setSelectedProject: (project: Project) => dispatch(setSelectedProject(project)),
    clearSelectedProject: () => dispatch(clearSelectedProject()),
});

type Props = OwnProps & StoreProps & DispatchProps

interface State {
    projects: Project[];
    loading: boolean;
    error: string | null;
    showModal: boolean;
    selectedProjectId?: number;
}

class Projects extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            projects: [],
            loading: true,
            error: '',
            showModal: false,
            selectedProjectId: undefined,
        };
    }

    componentDidMount() {
        this.fetchProjects();
    }

    fetchProjects = async () => {
        try {
            this.setState({
                loading: true,
                projects: [],
                error: null,
                selectedProjectId: undefined,
            });
            this.props.clearSelectedProject()
            const listProjectsResponse = await ProjectAPIClient.list();
            const projects = listProjectsResponse.projects;
            let selectedId: number | undefined = undefined
            if (projects.length > 0) {
                selectedId = projects[0].id;
                this.props.setSelectedProject({
                    id: projects[0].id,
                    path: projects[0].path,
                })
            }
            const sortedProjects = projects.sort((a, b) => a.path.localeCompare(b.path));
            this.setState({
                projects: sortedProjects,
                loading: false,
                error: null,
                selectedProjectId: selectedId
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            this.setState({
                error: errorMessage,
                projects: [],
                loading: false,
                selectedProjectId: undefined,
            });
            this.props.clearSelectedProject()
        }
    };

    handleAddProject = async (projectPath: string) => {
        try {
            this.setState({
                loading: true,
                projects: [],
                error: null,
                selectedProjectId: undefined,
            });
            await ProjectAPIClient.create(projectPath);
            await this.fetchProjects();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while adding the project';
            this.setState({
                error: errorMessage,
                projects: [],
                loading: false,
                selectedProjectId: undefined,
            });
        }
    };

    toggleModal = () => {
        this.setState(prevState => ({ showModal: !prevState.showModal }));
    };

    deleteProject = async (project: Project) => {
        try {
            this.setState({
                loading: true,
                projects: [],
                error: null,
                selectedProjectId: undefined,
            });
            await ProjectAPIClient.delete(project.id);
            await this.fetchProjects();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete the project';
            this.setState({
                error: errorMessage,
                projects: [],
                loading: false,
                selectedProjectId: undefined,
            });
        }
    };

    handleSelect = async (project: Project) => {
        this.setState({
            selectedProjectId: project.id
        });
        try {
            await ProjectAPIClient.update(project.id);
            this.props.setSelectedProject(project);
        } catch (err) {
            console.error("Failed to update project", project, err);
        }
    };

    renderItem = ({ item }: { item: Project }) => {
        const { selectedProjectId } = this.state;
        return (
            <ThemedListItem
                bottomDivider
                onPress={() => this.handleSelect(item!)}
                containerStyle={item.id === selectedProjectId ? styles.activeItem : styles.item}
            >
                <ThemedListItem.Content>
                    <ThemedListItem.Title>{item.path}</ThemedListItem.Title>
                </ThemedListItem.Content>
                <Button
                    title="Delete"
                    type="clear"
                    titleStyle={{ color: 'red' }}
                    onPress={() => this.deleteProject(item!)}
                />
            </ThemedListItem>
        );
    };

    render() {
        const { projects, loading, error, showModal, selectedProjectId } = this.state;

        return (
            <ThemedView style={styles.container}>
                <ThemedText style={styles.header}>Projects</ThemedText>
                <ThemedText style={styles.description}>
                    These are the absolute paths to the roots of your projects.
                </ThemedText>
                <Button
                    title="Add New Project"
                    onPress={this.toggleModal}
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
                            renderItem={this.renderItem}
                        />
                        {this.props.children}
                    </ThemedView>
                )}
                <AddProjectModal
                    show={showModal}
                    onHide={this.toggleModal}
                    onAddProject={this.handleAddProject}
                />
            </ThemedView>
        );
    }
}

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
    item: {
    },
    activeItem: {
        backgroundColor: "#123123"
    },
});

export default connectToStore<OwnProps, StoreProps, DispatchProps>(Projects, mapStoreToProps, mapDispatchToProps);
