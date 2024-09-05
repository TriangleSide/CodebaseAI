import {Paths} from "../api/Paths";
import {ContentTypes} from "../http/Headers";
import {Methods} from "../http/Methods";
import {role} from "./Roles";

export interface Message {
    role: role;
    content: string;
}

export interface ChatRequest {
    messages: Message[];
}

export interface ApiStreamResponse {
    content: string | null;
    success: boolean | null;
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

        if (response.ok && response.body != null) {
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
                        const streamResponse: ApiStreamResponse = JSON.parse(line);
                        if (streamResponse.success != null) {
                            if (!streamResponse.success) {
                                throw new Error('Error during token stream.');
                            }
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