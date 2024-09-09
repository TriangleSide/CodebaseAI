import {Paths} from "../api/Paths";
import {ContentTypes} from "../http/Headers";
import {Methods} from "../http/Methods";

export interface Project {
    id: number;
    path: string;
}

export interface ListProjectsResponse {
    projects: Project[];
}

export class ProjectAPIClient {
    private static readonly LIST_LIMIT_HEADER = 'limit';

    static async list(limit?: number): Promise<ListProjectsResponse> {
        const queryParams = new URLSearchParams();
        if (limit !== undefined) {
            queryParams.set(ProjectAPIClient.LIST_LIMIT_HEADER, limit.toString());
        }

        const response = await fetch(`${Paths.PROJECTS}?${queryParams.toString()}`);
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

    static async update(projectId: number): Promise<void> {
        const response = await fetch(Paths.projectId(projectId), {
            method: Methods.PUT,
        });

        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }
    }
}