import React from 'react';
import { Button, Container, ListGroup } from 'react-bootstrap';
import { APIClient, Project } from "./APIClient";
import AddProjectModal from './AddProjectModal';

interface ProjectsProps {
    children?: React.ReactNode;
}

interface ProjectsState {
    projects: Project[];
    loading: boolean;
    error: string;
    showModal: boolean;
}

export default class Projects extends React.Component<ProjectsProps, ProjectsState> {
    constructor(props: ProjectsProps) {
        super(props);
        this.state = {
            projects: [],
            loading: true,
            error: '',
            showModal: false,
        };
    }

    componentDidMount() {
        this.fetchProjects();
    }

    fetchProjects = async () => {
        try {
            const response = await APIClient.list();
            this.setState({ projects: response.projects, loading: false, error: '' });
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
            }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete the project';
            this.setState({ error: errorMessage });
        }
    };

    render() {
        const { projects, loading, error, showModal } = this.state;

        return (
            <Container>
                <br/>
                <h2>Projects</h2>
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
                        <ListGroup>
                            {projects.map(project => (
                                <ListGroup.Item key={project.id} className="bg-dark text-white">
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
                        {this.props.children}
                    </div>
                )}
                <AddProjectModal
                    show={showModal}
                    onHide={this.toggleModal}
                    onAddProject={this.handleAddProject}
                />
            </Container>
        );
    }
}
