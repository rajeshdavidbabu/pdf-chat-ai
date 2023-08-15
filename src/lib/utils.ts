import { ChatGPTMessage } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function scrollToBottom(containerRef: React.RefObject<HTMLElement>) {
  if (containerRef.current) {
    const lastMessage = containerRef.current.lastElementChild;
    if (lastMessage) {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: "smooth",
        block: "end",
      };
      lastMessage.scrollIntoView(scrollOptions);
    }
  }
}

// Reference:
// github.com/hwchase17/langchainjs/blob/357d6fccfc78f1332b54d2302d92e12f0861c12c/examples/src/guides/expression_language/cookbook_conversational_retrieval.ts#L61
export const formatChatHistory = (chatHistory: [string, string][]) => {
  const formattedDialogueTurns = chatHistory.map(
    (dialogueTurn) => `Human: ${dialogueTurn[0]}\nAssistant: ${dialogueTurn[1]}`
  );

  return formattedDialogueTurns.join("\n");
};

export function sanitizeAndFormatText(inputText: string) {
  // Replace newline characters and hyphens with spaces
  let formattedText = inputText.replace(/[\n-]/g, " ");

  // Remove consecutive spaces
  formattedText = formattedText.replace(/\s+/g, " ");

  return formattedText;
}

// Default UI Message
export const initialMessage: ChatGPTMessage[] = [
  {
    role: "assistant",
    content:
      "Hi! I am your PDF assistant. Please load your pdf data into my knowledge store using the command `npm run prepare:data`. Once done you can ask any question about it !! ",
  },
];
