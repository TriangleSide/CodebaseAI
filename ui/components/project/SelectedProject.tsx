import React from 'react';
import { ProjectAPIClient, Project } from "@/api/ProjectAPIClient";
import { Dispatch } from 'redux';
import {clearSelectedProject, setSelectedProject,} from "@/state/slices/project";
import {RootState} from "@/state/store";
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

type Props = OwnProps & StoreProps & DispatchProps;

interface State {
    project: Project | null;
    loading: boolean;
    error: string | null;
}

class SelectedProject extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            project: null,
            loading: true,
            error: '',
        };
    }

    componentDidMount() {
        this.fetchSelectedProject();
    }

    fetchSelectedProject = async () => {
        try {
            this.setState({
                project: null,
                loading: true,
                error: null,
            })
            this.props.clearSelectedProject()
            const listProjectsResponse = await ProjectAPIClient.list();
            const projects = listProjectsResponse.projects;
            let selected: Project | null = null;
            if (projects.length > 0) {
                selected = projects[0]
                this.props.setSelectedProject(selected)
            }
            this.setState({
                project: selected,
                loading: false,
                error: null,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            this.setState({
                project: null,
                loading: false,
                error: errorMessage,
            });
            this.props.clearSelectedProject()
        }
    };

    render() {
        const { project, loading, error } = this.state;

        if (loading) {
            return (
                <div>
                    Loading selected project...
                </div>
            )
        }

        if (!project) {
            return (
                <div>
                    Go the the projects page to create a project before getting started.
                </div>
            )
        }

        if (error !== null) {
            return (
                <div>
                    Selected project error: {error}
                </div>
            )
        }

        return (
            <div>
                {this.props.children}
            </div>
        )
    }
}

export default connectToStore(SelectedProject, mapStoreToProps, mapDispatchToProps);