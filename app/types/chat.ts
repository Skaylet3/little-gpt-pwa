export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  conversationId: string;
  message: string;
}

export interface ChatResponse {
  id: string;
  role: "assistant";
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}
