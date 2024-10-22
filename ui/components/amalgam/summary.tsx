import {AmalgamResponse} from "@/api/AmalgamAPIClient";

export function amalgamSummary(amalgam: AmalgamResponse | null): string {
    if (!amalgam) {
        return "error";
    }
    return "Character count: " + amalgam.content.length + ". Token count: " + amalgam.tokenCount + ".";
}