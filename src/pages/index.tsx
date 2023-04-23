import React, { useState, useEffect, useRef } from "react";
import { Configuration, OpenAIApi } from "openai";

const config = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

interface Response {
  text: string;
  answers?: string[];
  progress: number;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const initialMessage: Message = {
  role: "user",
  content: `You are now an advisor for Bike categories called BikeCenterGPT.
        You will ask 3 questions in total to the user and then make a recommendation. 
        For each response you create a valid JSON object with the following keys: "text", "answers", "progress".
        Do not include any explanations, only provide a  RFC8259 compliant JSON response  following this format without deviation. Please escape all special characters in your response.
        Never ask multiple questions at once. Always ask one question at a time and wait for an answer. Never ask the same question twice. Start by asking me the first question`.trim(),
};

const App: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  console.log("Test: index.tsx [[messages]]", messages);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      getAssistantResponse();
    }
  }, [messages]);

  const getAssistantResponse = async () => {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 500,
      temperature: 0,
    });

    const aiResponse = response.data.choices[0].message?.content.trim() || "";

    addMessage("assistant", aiResponse);
  };

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages((prevMessages) => [...prevMessages, { role, content }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addMessage("user", input);
      setInput("");
      inputRef.current?.focus();
    }
  };

  const renderUserMessage = (message: Message) => {
    return (
      <div className="flex justify-end">
        <div className="bg-green-300 text-black p-4 rounded-md">
          <p>{String(message.content)}</p>
        </div>
      </div>
    );
  };

  const renderAssistantMessage = (message: Message) => {
    const response = JSON.parse(message.content) as Response;
    const answers = response?.answers;
    const question = response.text;

    return (
      <div className="flex justify-start">
        <div className="bg-green-300 p-4 rounded-md">
          <p className="text-black">{question}</p>
          <div className="flex gap-2 flex-col p-4">
            {answers?.map((answer) => {
              return (
                <button
                  key={answer}
                  className="bg-green-500 p-2 rounded-md"
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
    <div className="flex justify-center items-center flex-col p-20">
      <form className="mb-10 fixed top-20 bg-black " onSubmit={handleSubmit}>
        <input
          type="text"
          className="text-black mr-3 p-2 rounded-md"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          ref={inputRef}
        />
        <button
          className="bg-green-500 border-2 border-green-300 rounded-md p-2"
          type="submit"
        >
          Send
        </button>
      </form>
      <div>
        {messages
          // filter out the first message
          .filter((_, index) => index !== 0)
          .map((message, index) => {
            return (
              <div
                key={index}
                className="mb-2 p-4 border-2 rounded-md border-green-300 "
              >
                {message.role === "user"
                  ? renderUserMessage(message)
                  : renderAssistantMessage(message)}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default App;
