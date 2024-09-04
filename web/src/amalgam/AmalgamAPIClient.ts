import {Paths} from "../api/Paths";

export interface AmalgamResponse {
    content: string;
    tokenCount: number;
}

export default class AmalgamAPIClient {
    static async fetchAmalgam(): Promise<AmalgamResponse> {
        const response = await fetch(Paths.AMALGAM);
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`${response.status} ${response.statusText}`);
        }
    }
}