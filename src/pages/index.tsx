import React, { useState, useEffect, useRef } from "react";
import { Configuration, OpenAIApi } from "openai";
import { useQuery } from "react-query";
import { initialSystemMessage, initialUserMessage } from "@/prompts/initial";

// TODO: track recommended category (prop in Response)
// TODO: clean up
// TODO: add loading indicator
// TODO: add error handling
// TODO: remove input
// TODO: add action to navigate to client with recommended category

const config = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export interface Response {
  text: string;
  answers?: string[];
  progress: number;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const getAssistantResponse = async (messages: Message[]) => {
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: messages,
    max_tokens: 500,
    temperature: 0,
  });

  return response.data.choices[0].message?.content.trim() || "";
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    initialSystemMessage,
    initialUserMessage,
  ]);

  const shouldFetch =
    messages.length >= 2 && messages[messages.length - 1].role === "user";

  const { isLoading, isFetching, isError, error } = useQuery(
    "getAssistantResponse",
    () => getAssistantResponse(messages),
    {
      enabled: shouldFetch,
      onSuccess: (data) => data && addMessage("assistant", data),
    }
  );

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages((prevMessages) => [...prevMessages, { role, content }]);
  };

  const renderUserMessage = (message: Message) => {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-300 text-black px-2 py-1 rounded-md">
          <p>{String(message.content)}</p>
        </div>
      </div>
    );
  };

  const renderAssistantMessage = (message: Message) => {
    const response = JSON.parse(message.content) as Response;

    return (
      <div className="flex justify-start">
        <div className="bg-green-300 text-black p-4 rounded-md">
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
    <div className="relative max-w-4xl mx-auto flex justify-center items-center flex-col p-20">
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
                {message.role === "assistant" &&
                  renderAssistantMessage(message)}
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
