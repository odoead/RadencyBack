
export interface AiResponse {
    answer: string;
    suggestedQuestions: string[];
    isSuccess: boolean;
    errorMessage?: string;
}