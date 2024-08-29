export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatRequest {
    messages: Message[];
}

export interface ApiStreamResponse {
    content: string | null;
    success: boolean | null;
}

export interface AmalgamResponse {
    content: string;
    tokenCount: number;
}

export type TokenCallback = (token: string) => void;

export default class ApiClient {
    public static readonly API_BASE_URL = "http://127.0.0.1:8080/api";

    static async fetchAmalgam(): Promise<AmalgamResponse> {
        const response = await fetch(`${ApiClient.API_BASE_URL}/amalgam`);
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`${response.status} ${response.statusText}`);
        }
    }

    static async sendMessage(messages: Message[], tokenCallback: TokenCallback): Promise<void> {
        const response = await fetch(`${ApiClient.API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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