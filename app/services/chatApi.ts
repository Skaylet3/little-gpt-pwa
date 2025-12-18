import type { Message, ChatRequest, ChatResponse, Conversation } from "@/app/types/chat";

export class ChatApiError extends Error {
  constructor(
    message: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = "ChatApiError";
  }
}

// Send a message to a conversation
export async function sendChatMessage(
  conversationId: string,
  message: string
): Promise<ChatResponse> {
  const request: ChatRequest = { conversationId, message };

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const data: ChatResponse & { error?: string; details?: string } =
    await response.json();

  if (!response.ok) {
    throw new ChatApiError(
      data.error || "Failed to get response",
      data.details
    );
  }

  return data;
}

// Get all conversations for the current user
export async function getConversations(): Promise<Conversation[]> {
  const response = await fetch("/api/conversations");

  if (!response.ok) {
    throw new ChatApiError("Failed to fetch conversations");
  }

  return response.json();
}

// Create a new conversation
export async function createConversation(title?: string): Promise<Conversation> {
  const response = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new ChatApiError("Failed to create conversation");
  }

  return response.json();
}

// Get messages for a conversation
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const response = await fetch(`/api/conversations/${conversationId}/messages`);

  if (!response.ok) {
    throw new ChatApiError("Failed to fetch messages");
  }

  return response.json();
}
