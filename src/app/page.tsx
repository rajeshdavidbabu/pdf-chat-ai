"use client";

import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { Chat, FileStorage } from "@/components/chat";
import PdfDisplayer from "./PdfDisplayer";
import { createContext, useRef, useState } from "react";
import { Button, Layout } from "@douyinfe/semi-ui";
import { useHover } from "ahooks";
import { IHighlight, NewHighlight } from "./types/types";

export type PdfContextProps = {
  showChat: boolean;
  setShowChat?: React.Dispatch<React.SetStateAction<boolean>>;
  selectedText: string;
  setSelectedText?: React.Dispatch<React.SetStateAction<string>>;
  aiMode: 'chat' | 'translate';
  setAiMode?: React.Dispatch<React.SetStateAction<'chat' | 'translate'>>;
  fileName: string;
  setFileName?: React.Dispatch<React.SetStateAction<string>>;
  indexKey: string;
  setIndexKey?: React.Dispatch<React.SetStateAction<string>>;
  highlights: IHighlight[];
  setHighlights?: React.Dispatch<React.SetStateAction<IHighlight[]>>;
  addHighlight?: (highlight: NewHighlight) => void;
  selectedHighlight?: IHighlight;
  setSelectedHighlight?: React.Dispatch<
    React.SetStateAction<IHighlight | undefined>
  >;
  storage: FileStorage[];
};

export const PdfContext = createContext<PdfContextProps>({
  showChat: false,
  setShowChat: undefined,
  selectedText: "",
  setSelectedText: undefined,
  aiMode: "chat",
  setAiMode: undefined,
  fileName: "",
  setFileName: undefined,
  indexKey: "",
  setIndexKey: undefined,
  highlights: [],
  setHighlights: undefined,
  addHighlight: undefined,
  selectedHighlight: undefined,
  setSelectedHighlight: undefined,
  storage: [],
});

const getNextId = () => String(Math.random()).slice(2);

export default function Home() {
  const [showChat, setShowChat] = useState(true);
  const [selectedText, setSelectedText] = useState("");
  const [aiMode, setAiMode] = useState<'chat' | 'translate'>("chat");
  const [fileName, setFileName] = useState<string>("");
  const [indexKey, setIndexKey] = useState<string>("");
  const [highlights, setHighlights] = useState<IHighlight[]>([]);
  const titleRef = useRef(null);
  const isHovering = useHover(titleRef);
  const [selectedHighlight, setSelectedHighlight] = useState<IHighlight>();
  const [storage, setStorage] = useState<FileStorage[]>([]);

  useEffect(() => {
    const storage = JSON.parse(localStorage.getItem('chatStorage') || '[]') as FileStorage[];
    setStorage(storage);
    const highlights = storage.find(i => i.fileName === fileName)?.histories.map(h => h.highlight) || [];
    setHighlights(highlights);
  }, [fileName])

  const addHighlight = (highlight: NewHighlight) => {
    console.log("Saving highlight", highlight);
    const newHighlight = { ...highlight, id: getNextId(), isSaved: false };
    console.log("newHighlight: ", newHighlight);
    setSelectedHighlight({ ...newHighlight });
    setHighlights([newHighlight, ...highlights]);
  };

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
            indexKey,
            setIndexKey,
            highlights: highlights,
            setHighlights,
            addHighlight,
            selectedHighlight,
            setSelectedHighlight,
            storage,
          }}
        >
          <PdfDisplayer
            highlights={highlights}
            setHighlights={setHighlights}
            setSelectedHighlight={setSelectedHighlight}
            addHighlight={addHighlight}
          />
          {showChat ? <Chat /> : null}
        </PdfContext.Provider>
      </main>
    </>
  );
}
