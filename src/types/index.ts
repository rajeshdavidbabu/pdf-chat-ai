export type ChatGPTAgent = "user" | "assistant";

export type DocumentInfo = {
  pageContent: string;
  line_from: number;
  line_to: number;
  page_no: number;
};

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
  sources?: DocumentInfo[];
}
