import {Paths} from "@/constants/Paths";
import {Headers} from "@/constants/Headers";

export interface AmalgamResponse {
    content: string;
    tokenCount: number;
}

export default class AmalgamAPIClient {
    static async fetchAmalgam(projectId: number): Promise<AmalgamResponse> {
        const response = await fetch(Paths.amalgam(projectId) ,{
            headers: {
                [Headers.ACCEPT]: Headers.APPLICATION_JSON,
            },
        });
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`${response.status} ${response.statusText}`);
        }
    }
}
