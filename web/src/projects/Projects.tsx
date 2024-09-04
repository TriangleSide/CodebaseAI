import React from 'react';
import { Button, Container, ListGroup } from 'react-bootstrap';
import { APIClient, Project } from "./APIClient";
import AddProjectModal from './AddProjectModal';

interface ChildProps {
    projectId?: number;
}

interface ProjectsProps {
    children?: React.ReactNode;
}

interface ProjectsState {
    projects: Project[];
    loading: boolean;
    error: string;
    showModal: boolean;
    selectedProjectId?: number;
}

export default class Projects extends React.Component<ProjectsProps, ProjectsState> {
    constructor(props: ProjectsProps) {
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
            const response = await APIClient.list();
            const projects = response.projects;
            this.setState({
                projects: projects,
                loading: false,
                error: '',
                selectedProjectId: projects.length > 0 ? projects[0].id : undefined
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            this.setState({ error: errorMessage, loading: false });
        }
    };

    handleAddProject = async (projectPath: string) => {
        try {
            const project = await APIClient.create(projectPath);
            this.setState(prevState => ({
                projects: [...prevState.projects, project],
                selectedProjectId: prevState.selectedProjectId ? prevState.selectedProjectId : project.id,
            }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while adding the project';
            this.setState({ error: errorMessage });
        }
    };

    toggleModal = () => {
        this.setState(prevState => ({ showModal: !prevState.showModal }));
    };

    handleDelete = async (id: number) => {
        try {
            await APIClient.delete(id);
            this.setState(prevState => ({
                projects: prevState.projects.filter(project => project.id !== id),
                selectedProjectId: prevState.selectedProjectId === id ? undefined : prevState.selectedProjectId
            }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete the project';
            this.setState({ error: errorMessage });
        }
    };

    handleSelect = (id: number) => {
        this.setState({ selectedProjectId: id });
    };

    render() {
        const { projects, loading, error, showModal, selectedProjectId } = this.state;

        return (
            <div>
                <Container>
                    <br/>
                    <h2>Projects</h2>
                    <p>
                        These are the absolute paths to the roots of your projects.
                    </p>
                    <Button variant="primary" onClick={this.toggleModal}>
                        Add New Project
                    </Button>
                    <br/><br/>
                    {loading ? (
                        <div>Loading...</div>
                    ) : error ? (
                        <div className="text-danger">{error}</div>
                    ) : (
                        <div>
                            <p>
                                Select a project below.
                            </p>
                            <ListGroup>
                                {projects.map(project => (
                                    <ListGroup.Item
                                        key={project.id}
                                        onClick={() => this.handleSelect(project.id!)}
                                        active={project.id === selectedProjectId}
                                        className="clickable">
                                        {project.path}
                                        <Button
                                            variant="danger"
                                            onClick={() => this.handleDelete(project.id!)}
                                            size="sm"
                                            className="float-end">
                                            Delete
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                            {projects.length > 0 ? React.Children.map(this.props.children, child => {
                                if (React.isValidElement<ChildProps>(child)) {
                                    return React.cloneElement(child, {
                                        projectId: selectedProjectId
                                    });
                                }
                                return child;
                            }) : null}
                        </div>
                    )}
                    <AddProjectModal
                        show={showModal}
                        onHide={this.toggleModal}
                        onAddProject={this.handleAddProject}
                    />
                </Container>
                <br/>
            </div>
        );
    }
}