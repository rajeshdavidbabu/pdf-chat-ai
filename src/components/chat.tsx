"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { InputMessage } from "./input-message";
import { scrollToBottom, initialMessage } from "@/lib/utils";
import { ChatLine } from "./chat-line";
import { ChatGPTMessage, DocumentInfo } from "@/types";
import { Document } from "langchain/document";
import { PdfContext } from "@/app/page";
import { Button, Input, TextArea } from "@douyinfe/semi-ui";
import "./chat.css";
import { IHighlight } from "@/app/types/types";

interface ITempChat {
  selectedText: string;
  chatHistory: [string, string][];
}

export interface History {
  highlightId: string;
  chatHistory: [string, string][];
  highlight: IHighlight;
}

export interface FileStorage {
  fileName: string;
  histories: History[];
}
export interface ChatStorage {
  files: FileStorage[];
}

const aiModeToEndpoint = {
  translate: "/api/translate",
  chat: "/api/chat",
};

export const Chat = () => {
  const {
    addHighlight,
    setHighlights,
    selectedHighlight,
    highlights,
    fileName,
    storage,
    indexKey,
    selectedText,
    aiMode,
    summary,
    isAIBusy,
    setIsAIBusy,
  } = useContext(PdfContext);
  const endpoint = "/api/chat";
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatGPTMessage[]>(initialMessage);
  const [chatHistory, setChatHistory] = useState<[string, string][]>([]);
  const [streamingAIContent, setStreamingAIContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [currHighlightId, setCurrHighlightId] = useState<string>("");

  console.log("chatHistory: ", chatHistory);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const id = hash.split("-")[1];
      setCurrHighlightId(id);
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [fileName]);

  
  useEffect(() => {
    console.log('storage: ', storage
    .find((s) => s.fileName === localStorage.getItem("fileName") || "")
    ?.histories);
    const chatHistory = storage
    .find((s) => s.fileName === localStorage.getItem("fileName") || "")
    ?.histories.find((h) => h.highlightId === currHighlightId)?.chatHistory ||
    [];
    setChatHistory(chatHistory);
    const msgList: ChatGPTMessage[] = [];
    chatHistory.forEach(item => {
      msgList.push({
        role: 'user',
        content: item[0],
      });
      msgList.push({
        role: 'assistant',
        content: item[1],
      });
    });
    setMessages(msgList);
  }, [currHighlightId]);

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

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(
        "tempChat",
        JSON.stringify({
          selectedText,
          chatHistory,
        })
      );
    }
  }, [isLoading]);

  const handleStreamEnd = (
    question: string,
    streamingAIContent: string,
    sourceDocuments: string
  ) => {
    let sourceContents: DocumentInfo[] = [];
    if (sourceDocuments) {
      sourceContents = JSON.parse(sourceDocuments);
    }
    let sources: DocumentInfo[] = [];

    sourceContents.forEach((element) => {
      sources.push(element);
    });
    // Add the streamed message as the AI response
    // And clear the streamingAIContent state
    updateMessages({
      role: "assistant",
      content: streamingAIContent,
      sources,
    });
    updateStreamingAIContent("");
    updateChatHistory(question, streamingAIContent);
  };

  // send message to API /api/chat endpoint
  const sendQuestion = async (
    question: string,
    aiMode: "translate" | "chat" = "chat"
  ) => {
    const endpoint = aiModeToEndpoint[aiMode];

    setIsLoading(true);
    updateMessages({
      role: "user",
      content: aiMode === "translate" ? `Translate ${question}` : question,
    });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          chatHistory,
          indexKey,
          ...(aiMode === "translate" && { language: "Chinese" }),
        }),
      });

      const reader = response?.body?.getReader();
      let streamingAIContent = "";
      let tokensEnded = false;
      let sourceDocuments = "";

      while (true) {
        const { done, value } = (await reader?.read()) || {};

        if (done) {
          break;
        }

        const text = new TextDecoder().decode(value);
        if (text.includes("tokens-ended") && !tokensEnded) {
          tokensEnded = true;

          let texts = text.split("tokens-ended");
          if (texts.length > 1) {
            streamingAIContent = streamingAIContent + texts[0];
            updateStreamingAIContent(streamingAIContent);
          }
          if (texts.length > 2) {
            sourceDocuments += texts[1];
          }
        } else if (tokensEnded) {
          sourceDocuments += text;
        } else {
          streamingAIContent = streamingAIContent + text;
          updateStreamingAIContent(streamingAIContent);
        }
      }
      handleStreamEnd(question, streamingAIContent, sourceDocuments);
    } catch (error) {
      console.log("Error occured ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (aiMode === "translate" && selectedText !== "") {
      sendQuestion(selectedText, "translate");
    }
  }, [aiMode, selectedText]);

  useEffect(() => {
    if (summary !== "") {
      updateMessages({
        role: "assistant",
        content: "Summary:\n" + summary,
      });
    }
  }, [summary]);

  const saveCurrChat = () => {
    const highlightsCopy = [...highlights];
    const index = highlightsCopy.findIndex(
      (h) => h.id === selectedHighlight?.id
    );
    console.log("selectedHighlight: ", selectedHighlight);
    highlightsCopy[index] = {
      ...highlightsCopy[index],
      isSaved: true,
    };
    console.log("highlightsCopy: ", highlightsCopy);
    setHighlights && setHighlights(highlightsCopy);

    let storage: FileStorage[] = [];
    if (localStorage.getItem("chatStorage")) {
      storage = JSON.parse(
        localStorage.getItem("chatStorage") || "[]"
      ) as FileStorage[];
    }
    const currFileStorage: FileStorage = storage.find(
      (i) => i.fileName === localStorage.getItem("fileName")
    ) || {
      fileName: localStorage.getItem("fileName") || "",
      histories: [],
    };
    const historyItemIndex =
      currFileStorage?.histories.findIndex(
        (h) => h.highlightId === selectedHighlight?.id
      ) || -1;
    const newHistoryItem: History = {
      highlight: { ...selectedHighlight, isSaved: true } as IHighlight,
      highlightId: selectedHighlight?.id || "",
      chatHistory,
    };
    if (historyItemIndex >= 0 && currFileStorage?.histories) {
      currFileStorage.histories[historyItemIndex] = newHistoryItem;
    } else {
      currFileStorage?.histories.push(newHistoryItem);
    }
    console.log("currFileStorage: ", currFileStorage);
    if (currFileStorage) {
      const fileStorageIndex = storage.findIndex(
        (i) => i.fileName === localStorage.getItem("fileName")
      );
      if (fileStorageIndex >= 0) {
        storage[
          storage.findIndex(
            (i) => i.fileName === localStorage.getItem("fileName")
          )
        ] = currFileStorage;
      } else {
        storage.push(currFileStorage);
      }
      console.log("storage: ", storage);
    }
    localStorage.setItem("chatStorage", JSON.stringify(storage));
  };

  useEffect(() => {
    let storage: FileStorage[] = [];
    if (localStorage.getItem("chatStorage")) {
      storage = JSON.parse(
        localStorage.getItem("chatStorage") || "[]"
      ) as FileStorage[];
    }
  }, [highlights]);

  let placeholder = "Type a message to start ...";

  if (messages.length > 2) {
    placeholder = "Type to continue your conversation";
  }
  console.log("messages: ", messages);

  return (
    <div
      className="overflow-y-auto"
      style={{
        width: "20vw",
        padding: "12px 12px 0 12px",
        backgroundColor: "white",
        maxHeight: "100%",
      }}
    >
      <div ref={containerRef}>
        {messages.map(({ content, role, sources }, index) => (
          <ChatLine
            key={index}
            role={role}
            content={content}
            sources={sources}
          />
        ))}
        {streamingAIContent ? (
          <ChatLine role={"assistant"} content={streamingAIContent} />
        ) : (
          <></>
        )}
      </div>

      {/* <InputMessage
        input={input}
        setInput={setInput}
        sendMessage={sendQuestion}
        placeholder={placeholder}
        isLoading={isLoading}
      /> */}
      {/* <div className="text-black">{selectedText}</div> */}
      <div style={{ position: "sticky", bottom: 0, backgroundColor: "white" }}>
        <TextArea
          className="mt-2"
          style={{ backgroundColor: "rgba(var(--semi-grey-0), 1)" }}
          value={userQuestion}
          rows={2}
          onChange={setUserQuestion}
          onEnterPress={(e) => {
            sendQuestion(`${selectedText} ${userQuestion}`);
            setTimeout(() => {
              setUserQuestion("");
            }, 50);
          }}
        />
        <div className="flex justify-end mt-2">
          {selectedHighlight?.position ? (
            <Button
              className="save-annotation"
              theme="borderless"
              type="primary"
              style={{ marginRight: 8, color: "black" }}
              onClick={saveCurrChat}
            >
              Save as annotation
            </Button>
          ) : null}
          <Button
            theme="solid"
            type="primary"
            onClick={() => {
              sendQuestion(`${selectedText} ${userQuestion}`);
              setTimeout(() => {
                setUserQuestion("");
              }, 50);
            }}
            disabled={isLoading || isAIBusy}
            style={{ backgroundColor: "black", color: "white" }}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
