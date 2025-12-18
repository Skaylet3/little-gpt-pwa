import type { Message, ChatRequest, ChatResponse } from "@/app/types/chat";

const API_ENDPOINT = "/api/chat";

export class ChatApiError extends Error {
  constructor(
    message: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = "ChatApiError";
  }
}

export async function sendChatMessage(messages: Message[]): Promise<string> {
  const request: ChatRequest = {
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };

  const response = await fetch(API_ENDPOINT, {
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

  return data.content;
}
