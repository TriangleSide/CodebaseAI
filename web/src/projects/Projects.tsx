import React from 'react';
import { Button, Container, ListGroup } from 'react-bootstrap';
import { ProjectAPIClient, Project } from "./ProjectAPIClient";
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
    error: string | null;
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
            this.setState({
                loading: true,
                projects: [],
                error: null,
                selectedProjectId: undefined,
            })
            const listProjectsResponse = await ProjectAPIClient.list();
            const projects = listProjectsResponse.projects;
            const selectedId = projects.length > 0 ? projects[0].id : undefined
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
        }
    };

    handleAddProject = async (projectPath: string) => {
        try {
            this.setState({
                loading: true,
                projects: [],
                error: null,
                selectedProjectId: undefined,
            })
            await ProjectAPIClient.create(projectPath);
            await this.fetchProjects()
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

    handleDelete = async (id: number) => {
        try {
            this.setState({
                loading: true,
                projects: [],
                error: null,
                selectedProjectId: undefined,
            })
            await ProjectAPIClient.delete(id);
            await this.fetchProjects()
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

    handleSelect = async (id: number) => {
        this.setState({
            selectedProjectId: id
        });
        try {
            await ProjectAPIClient.update(id);
        } catch (err) {
            console.error("Failed to update project", id, err);
        }
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
                            {projects.length > 0 ? (
                                <p>
                                    Select a project below.
                                </p>
                            ) : null}
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