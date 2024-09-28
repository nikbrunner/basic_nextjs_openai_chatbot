import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Message } from "../pages";
import { useEffect } from "react";



type Options = Partial<UseQueryOptions<AssistantResponse | null> & { onSuccess: (messages: AssistantResponse | null) => void; }>;

const useChat = (messages: Message[], options?: Options) => {
    const query = useQuery(
        {
            queryKey: ["getAssistantResponse"],
            queryFn: () => getAssistantResponse(messages),
            ...options
        }
    );

    useEffect(() => {
        if (query.isSuccess && query.data) {
            options?.onSuccess?.(query.data);
        }
    }, [query.isSuccess, query.data]);

    return query;
};

export interface AssistantResponse {
    text: string;
    answers?: string[];
    progress: number;
}

const getAssistantResponse = async (messages: Message[]): Promise<AssistantResponse | null> => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages }),
        });
        const data = await response.json();
        return data.messages;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export default useChat;
