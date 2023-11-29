export type ChatGPTAgent = "user" | "assistant";

type DocumentInfo = {
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
