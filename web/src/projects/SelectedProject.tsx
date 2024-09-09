import React from 'react';
import { ProjectAPIClient, Project } from "./ProjectAPIClient";
import {connect, ConnectedProps} from 'react-redux';
import {RootState} from "../state/Reducer";
import {setSelectedProject} from "./SelectedProjectState";
import { Dispatch } from 'redux';

interface ReduxProps {
    setSelectedProject: (project: Project | null) => void;
}

const reduxMapStateToProps = (state: RootState): Partial<ReduxProps> => ({});

const reduxMapDispatchToProps = (dispatch: Dispatch): ReduxProps => ({
    setSelectedProject: (project: Project | null) => dispatch(setSelectedProject(project))
});

const reduxConnector = connect(reduxMapStateToProps, reduxMapDispatchToProps);
type reduxConnectedProps = ConnectedProps<typeof reduxConnector>;

interface Props extends reduxConnectedProps {
    children?: React.ReactNode;
}

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
            const listProjectsResponse = await ProjectAPIClient.list(1);
            const projects = listProjectsResponse.projects;
            const selectedProject = projects.length > 0 ? projects[0] : null
            this.props.setSelectedProject(selectedProject);
            this.setState({
                project: selectedProject,
                loading: false,
                error: null,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            this.props.setSelectedProject(null);
            this.setState({
                project: null,
                loading: false,
                error: errorMessage,
            });
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

export default reduxConnector(SelectedProject);