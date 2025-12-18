import type { Message } from "@/app/types/chat";

export function createUserMessage(content: string): Message {
  return {
    role: "user",
    content,
  };
}

export function createAssistantMessage(content: string): Message {
  return {
    role: "assistant",
    content,
  };
}

export function createErrorMessage(error?: string): Message {
  return createAssistantMessage(
    error || "Sorry, I encountered an error. Please try again."
  );
}
