"use client";

import { useRef, useState } from "react";
import { InputMessage } from "./input-message";
import { scrollToBottom, delay } from "@/lib/utils";
import { ChatLine } from "./chat-line";
import { ChatGPTMessage } from "@/types";
import { json } from "stream/consumers";

let placeholder = "Type a message to start ...";

// Default UI Message
export const initialMessages: ChatGPTMessage[] = [
  {
    role: "assistant",
    content:
      "Hi! I am your PDF assistant. Please load your pdf data into my knowledge store using the command `npm run prepare:data`. Once done you can ask any question about it !! ",
  },
];

export function Chat() {
  const endpoint = "/api/chat";
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatGPTMessage[]>(initialMessages);
  const [chatHistory, setChatHistory] = useState<[string, string][]>([]);
  const [streamingAIContent, setStreamingAIContent] = useState<string>("");

  const updateMessages = (message: ChatGPTMessage) => {
    setMessages((previousMessages) => [...previousMessages, message]);
    setTimeout(() => scrollToBottom(containerRef), 100);
  };

  const updateChatHistory = (question: string, answer: string) => {
    setChatHistory((previousHistory) => [
      ...previousHistory,
      [question, answer],
    ]);
  };

  const updateStreamingAIContent = (streamingAIContent: string) => {
    setStreamingAIContent(streamingAIContent);
    setTimeout(() => scrollToBottom(containerRef), 100);
  };

  // send message to API /api/chat endpoint
  const sendQuestion = async (question: string) => {
    const yourMessage: ChatGPTMessage = {
      role: "user",
      content: question,
    };
    updateMessages(yourMessage);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        chatHistory,
      }),
    });

    const reader = response?.body?.getReader();
    let streamingAIContent = "";

    while (true) {
      const { done, value } = (await reader?.read()) || {};

      if (done) {
        break;
      }

      const text = new TextDecoder().decode(value);
      streamingAIContent = streamingAIContent + text;
      updateStreamingAIContent(streamingAIContent);
    }

    updateMessages({ role: "assistant", content: streamingAIContent });
    updateChatHistory(question, streamingAIContent);
    updateStreamingAIContent("");
  };

  if (messages.length > 2) {
    placeholder = "Type to continue your conversation";
  }

  return (
    <div className="rounded-2xl border h-[75vh] flex flex-col justify-between">
      <div className="p-6 overflow-auto" ref={containerRef}>
        {messages.map(({ content, role }, index) => (
          <ChatLine key={index} role={role} content={content} />
        ))}
        {streamingAIContent ? (
          <ChatLine role={"assistant"} content={streamingAIContent} />
        ) : (
          <></>
        )}
      </div>

      <InputMessage
        input={input}
        setInput={setInput}
        sendMessage={sendQuestion}
        placeholder={placeholder}
      />
    </div>
  );
}
