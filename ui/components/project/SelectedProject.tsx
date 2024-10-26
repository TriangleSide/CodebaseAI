import React, { useState, useEffect } from 'react';
import { ProjectAPIClient, Project } from "@/api/ProjectAPIClient";
import { useStoreDispatch, useStoreSelector } from "@/state/store";
import { clearSelectedProject, setSelectedProject } from "@/state/slices/project";
import { ThemedView, ThemedText } from "@triangleside/reactnativebase";


interface Props {
    children?: React.ReactNode;
}

const SelectedProject: React.FC<Props> = ({ children }) => {
    const selectedProject = useStoreSelector((state) => state.projects.selectedProject);
    const dispatch = useStoreDispatch();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSelectedProject = async () => {
            try {
                setLoading(true);
                setError(null);
                dispatch(clearSelectedProject());

                const listProjectsResponse = await ProjectAPIClient.list();
                const projects = listProjectsResponse.projects;
                let selected: Project | null = null;

                if (projects.length > 0) {
                    selected = projects[0];
                    dispatch(setSelectedProject(selected));
                }

                setLoading(false);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(errorMessage);
                setLoading(false);
                dispatch(clearSelectedProject());
            }
        };

        fetchSelectedProject();
    }, [dispatch]);

    if (loading) {
        return <ThemedText>Loading selected project...</ThemedText>;
    }

    if (error) {
        return <ThemedText>Selected project error: {error}</ThemedText>;
    }

    if (!selectedProject) {
        return <ThemedText>Go to the projects page to create a project before getting started.</ThemedText>;
    }

    return <ThemedView>{children}</ThemedView>;
};

export default SelectedProject;
