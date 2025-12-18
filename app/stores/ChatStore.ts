import { makeAutoObservable, runInAction } from "mobx";
import type { Message, Conversation } from "@/app/types/chat";
import {
  sendChatMessage,
  getConversations,
  createConversation,
  getConversationMessages,
} from "@/app/services/chatApi";
import {
  createUserMessage,
  createAssistantMessage,
  createErrorMessage,
} from "@/app/utils/messageFactory";

class ChatStore {
  messages: Message[] = [];
  conversations: Conversation[] = [];
  currentConversationId: string | null = null;
  inputValue = "";
  isLoading = false;
  isLoadingConversations = false;

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

  setCurrentConversation(id: string | null) {
    this.currentConversationId = id;
  }

  // ---------------------------------------------------------------------------
  // Async Actions
  // ---------------------------------------------------------------------------

  async loadConversations() {
    this.isLoadingConversations = true;

    try {
      const conversations = await getConversations();

      runInAction(() => {
        this.conversations = conversations;
      });
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      runInAction(() => {
        this.isLoadingConversations = false;
      });
    }
  }

  async createNewConversation() {
    try {
      const conversation = await createConversation();

      runInAction(() => {
        this.conversations.unshift(conversation);
        this.currentConversationId = conversation.id;
        this.messages = [];
      });

      return conversation;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      throw error;
    }
  }

  async loadConversation(conversationId: string) {
    this.isLoading = true;

    try {
      const messages = await getConversationMessages(conversationId);

      runInAction(() => {
        this.currentConversationId = conversationId;
        this.messages = messages;
      });
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async sendMessage() {
    const content = this.inputValue.trim();
    if (!content || this.isLoading) return;

    // Create conversation if none exists
    if (!this.currentConversationId) {
      try {
        await this.createNewConversation();
      } catch {
        return;
      }
    }

    // Add user message to UI immediately
    const userMessage = createUserMessage(content);
    this.messages.push(userMessage);
    this.clearInput();
    this.isLoading = true;

    try {
      const response = await sendChatMessage(
        this.currentConversationId!,
        content
      );

      runInAction(() => {
        this.messages.push(createAssistantMessage(response.content));
        // Update conversation in list (move to top, update description)
        this.updateConversationInList(response.content);
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

  private updateConversationInList(lastMessage: string) {
    const index = this.conversations.findIndex(
      (c) => c.id === this.currentConversationId
    );

    if (index !== -1) {
      const conversation = this.conversations[index];
      // Update description and timestamp
      conversation.description = lastMessage.slice(0, 100);
      conversation.timestamp = "Just now";
      // Move to top of list
      this.conversations.splice(index, 1);
      this.conversations.unshift(conversation);
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

  get hasConversations() {
    return this.conversations.length > 0;
  }
}

export const chatStore = new ChatStore();
