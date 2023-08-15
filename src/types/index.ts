export type ChatGPTAgent = "user" | "assistant";

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
  sources?: string[];
}
