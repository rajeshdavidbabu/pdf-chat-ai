"use client"

import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { Chat } from "@/components/chat";
import PdfDisplayer from "./PdfDisplayer";
import { createContext, useState } from "react";

export const PdfContext = createContext<{
  showChat: boolean,
  setShowChat?: React.Dispatch<React.SetStateAction<boolean>>,
  selectedText: string,
  setSelectedText?: React.Dispatch<React.SetStateAction<string>>,
  aiMode: string,
  setAiMode?: React.Dispatch<React.SetStateAction<string>>
}>({
  showChat: false,
  setShowChat: undefined,
  selectedText: '',
  setSelectedText: undefined,
  aiMode: '',
  setAiMode: undefined,
});

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [aiMode, setAiMode] = useState('translation');
  // const PdfContext = useContext(Pdf)
  return (
    <main className="relative container flex min-h-screen flex-col">
      <PdfContext.Provider value={{ showChat, setShowChat, selectedText, setSelectedText, aiMode, setAiMode }}>
        <PdfDisplayer />
        {showChat ? <Chat /> : null}
      </PdfContext.Provider>
    </main>
  );
}
