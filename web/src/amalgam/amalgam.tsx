import React from 'react';
import { Button, Container } from 'react-bootstrap';
import AmalgamAPIClient, {AmalgamResponse} from "./AmalgamAPIClient";
import {Project} from "../projects/ProjectAPIClient";
import {RootState} from "../state/Reducer";
import {connect, ConnectedProps} from "react-redux";
import {AmalgamSummary} from "./AmalgamSummary";
import {ProjectSummary} from "../projects/ProjectSummary";

interface ReduxProps {
    selectedProject: Project | null;
}

const reduxMapStateToProps = (state: RootState): Partial<ReduxProps> => ({
    selectedProject: state.project.selectedProject
});

const reduxConnector = connect(reduxMapStateToProps);
type reduxConnectedProps = ConnectedProps<typeof reduxConnector>;

interface Props extends reduxConnectedProps {}

interface State {
    amalgam: AmalgamResponse | null;
    loading: boolean;
    error: string | null;
    copied: boolean;
}

class Amalgam extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            amalgam: null,
            loading: true,
            error: null,
            copied: false
        };
    }

    componentDidMount() {
        this.fetchAmalgamData();
    }

    fetchAmalgamData = async () => {
        this.setState({
            amalgam: null,
            loading: true,
            error: null,
        });
        try {
            if (!this.props.selectedProject) {
                throw new Error('Project not found');
            }
            const data = await AmalgamAPIClient.fetchAmalgam(this.props.selectedProject.id);
            this.setState({
                amalgam: data,
                loading: false
            });
        } catch (err) {
            console.error('Failed to fetch amalgam data:', err);
            if (err instanceof Error) {
                this.setState({
                    error: err.message,
                    loading: false,
                });
            } else {
                this.setState({
                    error: 'An unknown error occurred',
                    loading: false,
                });
            }
        }
    };

    handleCopy = () => {
        let amalgamTxt: string = ""
        if (this.state.amalgam) {
            amalgamTxt = this.state.amalgam.content
        }
        navigator.clipboard.writeText(amalgamTxt);
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
    };

    render() {
        const { amalgam, loading, error, copied } = this.state;

        let content: React.JSX.Element;
        if (loading) {
            content = (
                <div>Loading...</div>
            )
        } else if (error) {
            content = (
                <div>Error: {error}</div>
            )
        } else {
            content = (
                <div>
                    <Button onClick={this.handleCopy} variant={copied ? "success" : "primary"}>
                        {copied ? "Copied!" : "Copy to Clipboard"}
                    </Button>
                    <br/><br/>
                    <p>
                        {ProjectSummary(this.props.selectedProject)}
                    </p>
                    <p>
                        {AmalgamSummary(amalgam)}
                    </p>
                    <div className="amalgam-container">
                        {amalgam?.content}
                    </div>
                </div>
            )
        }

        return (
            <div>
                <Container>
                    <div>
                        <br/>
                        <h2>Amalgam Data</h2>
                        {content}
                    </div>
                </Container>
                <br/>
            </div>
        );
    }
}

export default reduxConnector(Amalgam);
