import { makeAutoObservable, runInAction } from "mobx";
import type { Message } from "@/app/types/chat";
import { sendChatMessage } from "@/app/services/chatApi";
import {
  createUserMessage,
  createAssistantMessage,
  createErrorMessage,
} from "@/app/utils/messageFactory";

class ChatStore {
  messages: Message[] = [];
  inputValue = "";
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  setInputValue(value: string) {
    this.inputValue = value;
  }

  clearInput() {
    this.inputValue = "";
  }

  clearMessages() {
    this.messages = [];
  }

  addMessage(message: Message) {
    this.messages.push(message);
  }

  // ---------------------------------------------------------------------------
  // Async Actions
  // ---------------------------------------------------------------------------

  async sendMessage() {
    const content = this.inputValue.trim();
    if (!content || this.isLoading) return;

    // Add user message and clear input
    this.addMessage(createUserMessage(content));
    this.clearInput();
    this.isLoading = true;

    try {
      const responseContent = await sendChatMessage(this.messages);

      runInAction(() => {
        this.messages.push(createAssistantMessage(responseContent));
      });
    } catch (error) {
      console.error("Chat error:", error);

      runInAction(() => {
        this.messages.push(createErrorMessage());
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Computed
  // ---------------------------------------------------------------------------

  get hasMessages() {
    return this.messages.length > 0;
  }

  get canSubmit() {
    return this.inputValue.trim().length > 0 && !this.isLoading;
  }
}

export const chatStore = new ChatStore();
