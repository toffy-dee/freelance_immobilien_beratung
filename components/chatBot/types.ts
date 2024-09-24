export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatCompletionResponse {
    choices: {
        message: {
            content: string | null;
        };
    }[];
}
