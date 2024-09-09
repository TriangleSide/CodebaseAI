import {Project} from "./ProjectAPIClient";

export function ProjectSummary(project: Project | null | undefined): string {
    if (!project) {
        return "error";
    }
    return project.path;
}