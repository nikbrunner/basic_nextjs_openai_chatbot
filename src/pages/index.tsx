import React, { useState, } from "react";
import { initialSystemMessage, initialUserMessage } from "@/prompts/initial";
import useChat, { AssistantResponse } from "../queries/useChat";


export type Message = {
    role: "user" | "system" | "assistant";
    content: string;
}

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        initialSystemMessage,
        initialUserMessage,
    ]);

    console.log("Test: index.tsx [[messages]]", messages);

    const { isLoading, isFetching, isError, error } = useChat(
        messages,
        {
            enabled: messages.length >= 2 && messages[messages.length - 1].role === "user",
            onSuccess: data => {
                if (data) {
                    console.log("Test: jooooo [[data]]", data);
                    return addMessage("assistant", data as unknown as string);
                }
            },
        }
    );


    const addMessage = (role: "user" | "assistant", content: string) => {
        setMessages((prevMessages) => [...prevMessages, { role, content }]);
    };

    const renderUserMessage = (message: Message) => {
        return (
            <div className="flex justify-end">
                <div className="bg-blue-300 text-black px-2 py-1 rounded-md shadow-black shadow-lg">
                    <p>{String(message.content)}</p>
                </div>
            </div>
        );
    };

    const renderAssistantMessage = (message: Message) => {
        const response = JSON.parse(message.content) as AssistantResponse;

        return (
            <div className="flex justify-start">
                <div className="bg-green-300 text-black p-4 rounded-md shadow-black shadow-lg">
                    {response.progress > 0 && (
                        <p className="bg-gray-800 text-white mb-3 px-2 py-0 rounded-full inline-block">
                            {response.progress}
                        </p>
                    )}
                    <p className="mb-3 text-black">{response.text}</p>
                    <div className="flex gap-2 flex-row">
                        {response.answers?.map((answer) => {
                            return (
                                <button
                                    key={answer}
                                    className="bg-green-500 px-2 py-1 rounded-md hover:bg-green-600 transition"
                                    onClick={() => addMessage("user", answer)}
                                >
                                    {answer}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-slate-800 relative max-w-4xl mx-auto flex justify-center items-center flex-col p-20">
            {isError && (
                <div className="bg-red-500 text-white p-4 rounded-md mb-4">
                    <p>{JSON.stringify(error)}</p>
                </div>
            )}
            <div>
                {messages.map((message, index) => {
                    if (index >= 2) {
                        return (
                            <div key={index} className="mb-2 p-4">
                                {message.role === "user" && renderUserMessage(message)}
                                {message.role === "assistant" && renderAssistantMessage(message)}
                            </div>
                        );
                    }
                })}
                {(isLoading || isFetching) && (
                    <p className="fixed top-3 left-3 bg-gray-900 text-sky-50 rounded-md p-2">
                        Loading...
                    </p>
                )}
            </div>
        </div>
    );
};

export default App;
