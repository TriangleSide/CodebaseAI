import {Project} from "@/api/ProjectAPIClient";

export function projectSummary(project: Project | null | undefined): string {
    if (!project) {
        return "error";
    }

    const pathParts = project.path.split('/');
    const lastTwoSegments = pathParts.slice(-2).join('/');

    return `Project: .../${lastTwoSegments}`;
}