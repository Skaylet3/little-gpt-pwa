import { ChatStore } from "./ChatStore";
import * as chatApi from "@/app/services/chatApi";
import * as messageFactory from "@/app/utils/messageFactory";

// Mock the API module
jest.mock("@/app/services/chatApi");
jest.mock("@/app/utils/messageFactory");

const mockedChatApi = chatApi as jest.Mocked<typeof chatApi>;
const mockedMessageFactory = messageFactory as jest.Mocked<typeof messageFactory>;

describe("ChatStore", () => {
  let store: ChatStore;

  beforeEach(() => {
    // Clear sessionStorage and create fresh store
    sessionStorage.clear();
    store = new ChatStore();

    // Setup default mocks
    mockedMessageFactory.createUserMessage.mockImplementation((content) => ({
      role: "user",
      content,
    }));
    mockedMessageFactory.createAssistantMessage.mockImplementation((content) => ({
      role: "assistant",
      content,
    }));
    mockedMessageFactory.createErrorMessage.mockReturnValue({
      role: "assistant",
      content: "Something went wrong. Please try again.",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Sync Actions
  // ---------------------------------------------------------------------------

  describe("setInputValue", () => {
    it("updates inputValue", () => {
      store.setInputValue("hello");
      expect(store.inputValue).toBe("hello");
    });
  });

  describe("clearInput", () => {
    it("clears inputValue", () => {
      store.inputValue = "hello";
      store.clearInput();
      expect(store.inputValue).toBe("");
    });
  });

  describe("clearMessages", () => {
    it("empties messages array", () => {
      store.messages = [{ role: "user", content: "hi" }];
      store.clearMessages();
      expect(store.messages).toHaveLength(0);
    });
  });

  describe("setCurrentConversation", () => {
    it("sets currentConversationId", () => {
      store.setCurrentConversation("abc123");
      expect(store.currentConversationId).toBe("abc123");
    });

    it("saves to sessionStorage when id provided", () => {
      store.setCurrentConversation("abc123");
      expect(sessionStorage.getItem("currentConversationId")).toBe("abc123");
    });

    it("removes from sessionStorage when null", () => {
      sessionStorage.setItem("currentConversationId", "abc123");
      store.setCurrentConversation(null);
      expect(sessionStorage.getItem("currentConversationId")).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Computed Properties
  // ---------------------------------------------------------------------------

  describe("hasMessages", () => {
    it("returns false when no messages", () => {
      expect(store.hasMessages).toBe(false);
    });

    it("returns true when messages exist", () => {
      store.messages = [{ role: "user", content: "hi" }];
      expect(store.hasMessages).toBe(true);
    });
  });

  describe("canSubmit", () => {
    it("returns false when input is empty", () => {
      store.inputValue = "";
      expect(store.canSubmit).toBe(false);
    });

    it("returns false when input is only whitespace", () => {
      store.inputValue = "   ";
      expect(store.canSubmit).toBe(false);
    });

    it("returns false when loading", () => {
      store.inputValue = "hello";
      store.isLoading = true;
      expect(store.canSubmit).toBe(false);
    });

    it("returns true when has input and not loading", () => {
      store.inputValue = "hello";
      store.isLoading = false;
      expect(store.canSubmit).toBe(true);
    });
  });

  describe("hasConversations", () => {
    it("returns false when no conversations", () => {
      expect(store.hasConversations).toBe(false);
    });

    it("returns true when conversations exist", () => {
      store.conversations = [
        { id: "1", title: "Chat", description: "Test", timestamp: "Now" },
      ];
      expect(store.hasConversations).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Async Actions
  // ---------------------------------------------------------------------------

  describe("loadConversations", () => {
    it("sets isLoadingConversations while loading", async () => {
      mockedChatApi.getConversations.mockResolvedValue([]);

      const promise = store.loadConversations();
      expect(store.isLoadingConversations).toBe(true);

      await promise;
      expect(store.isLoadingConversations).toBe(false);
    });

    it("populates conversations on success", async () => {
      const mockConversations = [
        { id: "1", title: "Chat 1", description: "Desc 1", timestamp: "1h ago" },
        { id: "2", title: "Chat 2", description: "Desc 2", timestamp: "2h ago" },
      ];
      mockedChatApi.getConversations.mockResolvedValue(mockConversations);

      await store.loadConversations();

      expect(store.conversations).toEqual(mockConversations);
    });

    it("handles error gracefully", async () => {
      mockedChatApi.getConversations.mockRejectedValue(new Error("Network error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await store.loadConversations();

      expect(store.isLoadingConversations).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("createNewConversation", () => {
    it("creates conversation and sets it as current", async () => {
      const mockConversation = {
        id: "new-123",
        title: "New Chat",
        description: "",
        timestamp: "Just now",
      };
      mockedChatApi.createConversation.mockResolvedValue(mockConversation);

      const result = await store.createNewConversation();

      expect(result).toEqual(mockConversation);
      expect(store.currentConversationId).toBe("new-123");
      expect(store.conversations[0]).toEqual(mockConversation);
      expect(store.messages).toHaveLength(0);
    });

    it("throws error on failure", async () => {
      mockedChatApi.createConversation.mockRejectedValue(new Error("Failed"));

      await expect(store.createNewConversation()).rejects.toThrow("Failed");
    });
  });

  describe("loadConversation", () => {
    it("loads messages and sets current conversation", async () => {
      const mockMessages = [
        { role: "user" as const, content: "Hello" },
        { role: "assistant" as const, content: "Hi there!" },
      ];
      mockedChatApi.getConversationMessages.mockResolvedValue(mockMessages);

      await store.loadConversation("conv-123");

      expect(store.currentConversationId).toBe("conv-123");
      expect(store.messages).toEqual(mockMessages);
    });

    it("sets isLoading while loading", async () => {
      mockedChatApi.getConversationMessages.mockResolvedValue([]);

      const promise = store.loadConversation("conv-123");
      expect(store.isLoading).toBe(true);

      await promise;
      expect(store.isLoading).toBe(false);
    });
  });

  describe("sendMessage", () => {
    beforeEach(() => {
      store.currentConversationId = "conv-123";
      store.inputValue = "Hello AI";
    });

    it("does nothing when input is empty", async () => {
      store.inputValue = "";
      await store.sendMessage();
      expect(mockedChatApi.sendChatMessage).not.toHaveBeenCalled();
    });

    it("does nothing when already loading", async () => {
      store.isLoading = true;
      await store.sendMessage();
      expect(mockedChatApi.sendChatMessage).not.toHaveBeenCalled();
    });

    it("adds user message immediately", async () => {
      mockedChatApi.sendChatMessage.mockResolvedValue({
        id: "msg-1",
        role: "assistant",
        content: "Hello!",
      });

      const promise = store.sendMessage();

      // User message added before API resolves
      expect(store.messages[0]).toEqual({ role: "user", content: "Hello AI" });

      await promise;
    });

    it("clears input after sending", async () => {
      mockedChatApi.sendChatMessage.mockResolvedValue({
        id: "msg-1",
        role: "assistant",
        content: "Hello!",
      });

      await store.sendMessage();

      expect(store.inputValue).toBe("");
    });

    it("adds assistant response on success", async () => {
      mockedChatApi.sendChatMessage.mockResolvedValue({
        id: "msg-1",
        role: "assistant",
        content: "Hello human!",
      });

      await store.sendMessage();

      expect(store.messages).toHaveLength(2);
      expect(store.messages[1]).toEqual({
        role: "assistant",
        content: "Hello human!",
      });
    });

    it("adds error message on failure", async () => {
      mockedChatApi.sendChatMessage.mockRejectedValue(new Error("API Error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await store.sendMessage();

      expect(store.messages[1]).toEqual({
        role: "assistant",
        content: "Something went wrong. Please try again.",
      });
      consoleSpy.mockRestore();
    });

    it("creates conversation if none exists", async () => {
      store.currentConversationId = null;
      mockedChatApi.createConversation.mockResolvedValue({
        id: "new-conv",
        title: "New Chat",
        description: "",
        timestamp: "Now",
      });
      mockedChatApi.sendChatMessage.mockResolvedValue({
        id: "msg-1",
        role: "assistant",
        content: "Hi!",
      });

      await store.sendMessage();

      expect(mockedChatApi.createConversation).toHaveBeenCalled();
      expect(store.currentConversationId).toBe("new-conv");
    });
  });
});

// Export ChatStore class for testing (not singleton)
export { ChatStore };
