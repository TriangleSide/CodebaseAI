import Constants from './Constants';

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

export default class ApiClient {
    static async fetchAmalgam(): Promise<string> {
        const response = await fetch(`${Constants.API_BASE_URL}/amalgam`);
        if (response.ok) {
            return response.text();
        } else {
            throw new Error(`${response.status} ${response.statusText}`);
        }
    }

    static async sendMessage(messages: Message[]): Promise<ReadableStream<Uint8Array>> {
        const response = await fetch(`${Constants.API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages } as ChatRequest),
        });

        if (response.ok && response.body != null) {
            return response.body;
        } else {
            throw new Error(`${response.status} ${response.statusText}`);
        }
    }
}
