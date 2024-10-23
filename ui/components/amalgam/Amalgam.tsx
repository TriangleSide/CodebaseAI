import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Divider } from 'react-native-elements';
import AmalgamAPIClient, { AmalgamResponse } from "@/api/AmalgamAPIClient";
import { useStoreSelector } from "@/state/store";
import { amalgamSummary } from "@/components/amalgam/summary";
import { projectSummary } from "@/components/project/summary";
import ThemedView from "@/components/themed/ThemedView";
import ThemedText from "@/components/themed/ThemedText";

interface Props {}

const Amalgam: React.FC<Props> = ({}) => {
    const selectedProject = useStoreSelector((state) => state.projects.selectedProject);

    const [amalgam, setAmalgam] = useState<AmalgamResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fetchAmalgamData = async () => {
        setAmalgam(null);
        setLoading(true);
        setError(null);

        if (!selectedProject) {
            throw new Error('Project not selected.');
        }

        await AmalgamAPIClient.fetchAmalgam(selectedProject.id).catch((err) => {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        }).finally(() => {
            setLoading(false);
        }).then((data) => {
            if (data) {
                setAmalgam(data);
            }
        })
    };

    const handleCopy = () => {
        const amalgamTxt: string = amalgam ? amalgam.content : "";
        navigator.clipboard.writeText(amalgamTxt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        fetchAmalgamData();
    }, [selectedProject]);

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
                    onPress={handleCopy}
                    title={copied ? "Copied!" : "Copy to Clipboard"}
                    buttonStyle={copied ? styles.copiedButton : styles.primaryButton}
                />
                <ThemedView style={styles.spacing} />
                <ThemedText style={styles.summaryText}>
                    {projectSummary(selectedProject)}
                </ThemedText>
                <ThemedText style={styles.summaryText}>
                    {amalgamSummary(amalgam)}
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
            <Divider />
            {content}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
    },
    primaryButton: {},
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
        borderWidth: 4,
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

export default Amalgam;
