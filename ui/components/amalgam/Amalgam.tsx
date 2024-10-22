import React from 'react';
import {StyleSheet} from 'react-native';
import {Button, Divider} from 'react-native-elements';
import AmalgamAPIClient, { AmalgamResponse } from "@/api/AmalgamAPIClient";
import { Project } from "@/api/ProjectAPIClient";
import { RootState } from "@/state/store";
import { AmalgamSummary } from "@/components/amalgam/AmalgamSummary";
import { ProjectSummary } from "@/components/project/ProjectSummary";
import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";
import {connectToStore} from "@/state/connect";

interface StoreProps {
    selectedProject: Project | null;
}

interface OwnProps {
}

const mapStoreToProps = (state: RootState): StoreProps => ({
    selectedProject: state.projects.selectedProject
});

type Props = OwnProps & StoreProps

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

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
        if (prevProps.selectedProject != this.props.selectedProject) {
            this.fetchAmalgamData();
        }
    }

    fetchAmalgamData = async () => {
        this.setState({
            amalgam: null,
            loading: true,
            error: null,
        });
        try {
            if (!this.props.selectedProject) {
                throw new Error('Project not selected.');
            }
            const data = await AmalgamAPIClient.fetchAmalgam(this.props.selectedProject.id);
            this.setState({
                amalgam: data,
                loading: false
            });
        } catch (err) {
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
        const amalgamTxt: string = this.state.amalgam ? this.state.amalgam.content : "";
        navigator.clipboard.writeText(amalgamTxt);
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
    };

    render() {
        const { amalgam, loading, error, copied } = this.state;
        const { selectedProject } = this.props;

        let content: React.ReactNode;
        if (loading) {
            content = (
                <ThemedText style={styles.message}>Loading...</ThemedText>
            );
        } else if (error) {
            content = (
                <ThemedText style={styles.error}>Error: {error}</ThemedText>
            );
        } else {
            content = (
                <ThemedView>
                    <Button
                        onPress={this.handleCopy}
                        title={copied ? "Copied!" : "Copy to Clipboard"}
                        buttonStyle={copied ? styles.copiedButton : styles.primaryButton}
                    />
                    <ThemedView style={styles.spacing} />
                    <ThemedText style={styles.summaryText}>
                        {ProjectSummary(selectedProject)}
                    </ThemedText>
                    <ThemedText style={styles.summaryText}>
                        {AmalgamSummary(amalgam)}
                    </ThemedText>
                    <ThemedView style={styles.amalgamContainer}>
                        <ThemedText style={[{ fontSize: 12 }]}>
                            {amalgam?.content}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            );
        }

        return (
            <ThemedView style={styles.container}>
                <ThemedText type={"title"}>
                    Amalgam Data
                </ThemedText>
                <Divider/>
                {content}
            </ThemedView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
    },
    primaryButton: {
    },
    copiedButton: {
        backgroundColor: 'green',
    },
    spacing: {
        height: 16,
    },
    summaryText: {
        fontSize: 16,
        marginVertical: 8,
    },
    amalgamContainer: {
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'blue',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
    },
    error: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
});

export default connectToStore<OwnProps, StoreProps>(Amalgam, mapStoreToProps);
