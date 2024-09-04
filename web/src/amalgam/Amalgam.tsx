import React from 'react';
import { Button, Container } from 'react-bootstrap';
import AmalgamAPIClient, {AmalgamResponse} from "./AmalgamAPIClient";

export interface AmalgamProps {
    projectId?: number;
}

export interface AmalgamState {
    amalgam: AmalgamResponse | null;
    loading: boolean;
    error: string | null;
    copied: boolean;
}

export function AmalgamSummary(amalgam: AmalgamResponse | null): string {
    return "Character count: " + amalgam?.content.length + ". Token count: " + amalgam?.tokenCount + "."
}

export default class Amalgam extends React.Component<AmalgamProps, AmalgamState> {
    constructor(props: AmalgamProps) {
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
        try {
            const data = await AmalgamAPIClient.fetchAmalgam();
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
                        <h1>Amalgam Data</h1>
                        {content}
                    </div>
                </Container>
                <br/>
            </div>
        );
    }
}
