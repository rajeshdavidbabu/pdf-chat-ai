"use client";

import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { Chat } from "@/components/chat";
import PdfDisplayer from "./PdfDisplayer";
import { createContext, useRef, useState } from "react";
import { Button, Content, Header, Layout } from "@douyinfe/semi-ui";
import { useHover } from "ahooks";

export const PdfContext = createContext<{
  showChat: boolean;
  setShowChat?: React.Dispatch<React.SetStateAction<boolean>>;
  selectedText: string;
  setSelectedText?: React.Dispatch<React.SetStateAction<string>>;
  aiMode: string;
  setAiMode?: React.Dispatch<React.SetStateAction<string>>;
  fileName: string;
  setFileName?: React.Dispatch<React.SetStateAction<string>>;
}>({
  showChat: false,
  setShowChat: undefined,
  selectedText: "",
  setSelectedText: undefined,
  aiMode: "",
  setAiMode: undefined,
  fileName: "",
  setFileName: undefined,
});

export default function Home() {
  const [showChat, setShowChat] = useState(true);
  const [selectedText, setSelectedText] = useState("");
  const [aiMode, setAiMode] = useState("translation");
  const [fileName, setFileName] = useState<string>("");
  const titleRef = useRef(null);
  const isHovering = useHover(titleRef);
  return (
    <>
      <div
        ref={titleRef}
        className="flex justify-center items-center font-bold"
        style={{
          height: 48,
          backgroundColor: "black",
        }}
      >
        <div className="flex items-center px-20 py-2">
          <div className="mr-3">{fileName}</div>
          {isHovering ? (
            <Button
              style={{ color: "rgba(255, 226, 143, 1)" }}
              onClick={() =>
                (
                  document.querySelector("#upload-pdf-input") as HTMLElement
                )?.click()
              }
            >
              Open New...
            </Button>
          ) : null}
        </div>
      </div>
      <main
        className="flex w-full"
        style={{
          height: "calc(100vh - 56px)",
          backgroundColor: "rgba(var(--semi-grey-0), 1)",
        }}
      >
        <PdfContext.Provider
          value={{
            showChat,
            setShowChat,
            selectedText,
            setSelectedText,
            aiMode,
            setAiMode,
            fileName,
            setFileName,
          }}
        >
          <PdfDisplayer />
          {showChat ? <Chat /> : null}
        </PdfContext.Provider>
      </main>
    </>
  );
}
