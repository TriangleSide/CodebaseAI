import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    Alert
} from 'react-native';
import { Button, ListItem } from 'react-native-elements';
import AddProjectModal from '@/projects/AddProjectModal';
import { ProjectAPIClient, Project } from "@/projects/ProjectAPIClient";
import {RootState} from "@/state/Reducer";
import {Dispatch} from "redux";
import {clearSelectedProject, setSelectedProject} from "@/projects/SelectedProjectStore";
import {connect, ConnectedProps} from "react-redux";

interface ReduxProps {
    setSelectedProject: (project: Project | null) => void;
    clearSelectedProject: () => void;
}

const reduxMapStateToProps = (state: RootState): Partial<ReduxProps> => ({});

const reduxMapDispatchToProps = (dispatch: Dispatch): ReduxProps => ({
    setSelectedProject: (project: Project | null) => dispatch(setSelectedProject(project)),
    clearSelectedProject: () => dispatch(clearSelectedProject()),
});

const reduxConnector = connect(reduxMapStateToProps, reduxMapDispatchToProps);
type reduxConnectedProps = ConnectedProps<typeof reduxConnector>;

interface Props extends reduxConnectedProps {
    children?: React.ReactNode;
}

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
            <ListItem
                bottomDivider
                onPress={() => this.handleSelect(item!)}
                containerStyle={item.id === selectedProjectId ? styles.activeItem : styles.item}
            >
                <ListItem.Content>
                    <ListItem.Title>{item.path}</ListItem.Title>
                </ListItem.Content>
                <Button
                    title="Delete"
                    type="clear"
                    titleStyle={{ color: 'red' }}
                    onPress={() => this.deleteProject(item!)}
                />
            </ListItem>
        );
    };

    render() {
        const { projects, loading, error, showModal, selectedProjectId } = this.state;

        return (
            <View style={styles.container}>
                <Text style={styles.header}>Projects</Text>
                <Text style={styles.description}>
                    These are the absolute paths to the roots of your projects.
                </Text>
                <Button
                    title="Add New Project"
                    onPress={this.toggleModal}
                    buttonStyle={styles.addButton}
                />
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
                ) : error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : (
                    <View style={styles.listContainer}>
                        {projects.length > 0 && (
                            <Text style={styles.selectText}>Select a project below.</Text>
                        )}
                        <FlatList
                            data={projects}
                            keyExtractor={(item) => item.id!.toString()}
                            renderItem={this.renderItem}
                        />
                        {this.props.children}
                    </View>
                )}
                <AddProjectModal
                    show={showModal}
                    onHide={this.toggleModal}
                    onAddProject={this.handleAddProject}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
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
        backgroundColor: '#2089dc',
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
        backgroundColor: '#fff',
    },
    activeItem: {
        backgroundColor: '#cce5ff',
    },
});

export default reduxConnector(Projects);
