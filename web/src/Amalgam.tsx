import React from 'react';
import { Button, Container } from 'react-bootstrap';
import ApiClient from "./APIClient";

export interface AmalgamProps {}
export interface AmalgamState {
    amalgamData: string;
    loading: boolean;
    error: string | null;
    copied: boolean;
}

export default class Amalgam extends React.Component<AmalgamProps, AmalgamState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            amalgamData: '',
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
            const data = await ApiClient.fetchAmalgam();
            this.setState({ amalgamData: data, loading: false });
        } catch (err) {
            console.error('Failed to fetch amalgam data:', err);
            if (err instanceof Error) {
                this.setState({ error: err.message, loading: false });
            } else {
                this.setState({ error: 'An unknown error occurred', loading: false });
            }
        }
    };

    handleCopy = () => {
        navigator.clipboard.writeText(this.state.amalgamData);
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
    };

    render() {
        const { amalgamData, loading, error, copied } = this.state;

        if (loading) {
            return <div>Loading...</div>;
        }

        if (error) {
            return <div>Error: {error}</div>;
        }

        return (
            <Container>
                <h1>Amalgam Data</h1>
                <Button onClick={this.handleCopy} variant={copied ? "success" : "primary"}>
                    {copied ? "Copied!" : "Copy to Clipboard"}
                </Button>
                <div className="amalgam-container">
                    {amalgamData}
                </div>
            </Container>
        );
    }
}
