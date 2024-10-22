import {AmalgamResponse} from "@/api/AmalgamAPIClient";

export function AmalgamSummary(amalgam: AmalgamResponse | null): string {
    if (!amalgam) {
        return "error";
    }
    return "Character count: " + amalgam.content.length + ". Token count: " + amalgam.tokenCount + ".";
}