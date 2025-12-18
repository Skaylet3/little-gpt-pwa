export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: Pick<Message, "role" | "content">[];
}

export interface ChatResponse {
  content: string;
}
