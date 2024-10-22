import {Paths} from "@/constants/Paths";
import {ContentTypes} from "@/constants/Headers";
import {Methods} from "@/constants/Methods";

export type role = string;

export class Roles {
    public static readonly USER: role = 'user';
    public static readonly ASSISTANT: role = 'assistant';
    public static readonly CODEBASE: role = 'codebase';
    public static readonly ERROR: role = 'error';
}

export interface Message {
    role: role;
    content: string;
}

export interface ChatRequest {
    messages: Message[];
}

export interface ChatResponse {
    content: string | null;
    done: boolean | null;
    error: string | null;
}

export type TokenCallback = (token: string) => void;

export default class ChatAPIClient {
    static async sendMessage(messages: Message[], tokenCallback: TokenCallback): Promise<void> {
        const response = await fetch(Paths.CHAT, {
            method: Methods.POST,
            headers: {
                [ContentTypes.HEADER]: ContentTypes.JSON,
            },
            body: JSON.stringify({ messages } as ChatRequest),
        });

        if (response.ok) {
            if (!response.body) {
                throw new Error("Response body is null.")
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    break;
                }
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(Boolean);
                for (const line of lines) {
                    if (line.trim()) {
                        const streamResponse: ChatResponse = JSON.parse(line);
                        if (streamResponse.error != null) {
                            throw new Error(streamResponse.error);
                        } else if (streamResponse.done != null && streamResponse.done) {
                            break;
                        } else if (streamResponse.content != null) {
                            tokenCallback(streamResponse.content);
                        } else {
                            throw new Error('Unknown response stream state.');
                        }
                    }
                }
            }
        } else {
            throw new Error(`${response.status} ${response.statusText}`);
        }
    }
}