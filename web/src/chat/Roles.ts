export type role = 'user' | 'assistant' | 'codebase';

export class Roles {
    public static readonly USER: role = 'user';
    public static readonly ASSISTANT: role = 'assistant';
    public static readonly CODEBASE: role = 'codebase';
}