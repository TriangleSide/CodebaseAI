import {Paths} from "../api/Paths";
import {ContentTypes} from "../http/Headers";
import {Methods} from "../http/Methods";

export interface Project {
    id?: number;
    path: string;
}

export interface ListProjectsResponse {
    projects: Project[];
}

export class ProjectAPIClient {
    static async list(): Promise<ListProjectsResponse> {
        const response = await fetch(Paths.PROJECTS);
        if (response.ok) {
            const data: ListProjectsResponse = await response.json();
            return data;
        } else {
            throw new Error(`${response.status} ${response.statusText}`);
        }
    }

    static async create(projectPath: string): Promise<Project> {
        const response = await fetch(Paths.PROJECTS, {
            method: Methods.POST,
            headers: {
                [ContentTypes.HEADER]: ContentTypes.JSON,
            },
            body: JSON.stringify({ path: projectPath }),
        });

        if (response.ok) {
            const project: Project = await response.json();
            return project;
        } else {
            throw new Error(`${response.status} ${response.statusText}`);
        }
    }

    static async delete(projectId: number): Promise<void> {
        const response = await fetch(Paths.projectId(projectId), {
            method: Methods.DELETE,
        });

        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }
    }
}