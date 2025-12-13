"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Bot, ArrowUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Sidebar, type Conversation } from "@/app/widgets/Sidebar";

// =============================================================================
// TYPES (future: app/types/chat.ts)
// =============================================================================

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface SuggestionCard {
  id: string;
  title: string;
  description: string;
}

// =============================================================================
// CONSTANTS (future: app/lib/constants.ts)
// =============================================================================

const SUGGESTION_CARDS: SuggestionCard[] = [
  {
    id: "1",
    title: "Explain quantum computing",
    description: "In simple terms for beginners",
  },
  {
    id: "2",
    title: "Write a creative story",
    description: "About a robot learning to paint",
  },
  {
    id: "3",
    title: "Help me debug code",
    description: "Find and fix errors in my program",
  },
  {
    id: "4",
    title: "Summarize an article",
    description: "Get key points from long text",
  },
];

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    title: "Product Design Tips",
    description: "Discussion about modern UI patterns",
    timestamp: "2h ago",
  },
  {
    id: "2",
    title: "React Performance",
    description: "Optimizing component rendering",
    timestamp: "5h ago",
  },
  {
    id: "3",
    title: "API Architecture",
    description: "RESTful design best practices",
    timestamp: "1d ago",
  },
  {
    id: "4",
    title: "TypeScript Generics",
    description: "Advanced type patterns explained",
    timestamp: "2d ago",
  },
  {
    id: "5",
    title: "TypeScript Generics",
    description: "Advanced type patterns explained",
    timestamp: "2d ago",
  },
];

// =============================================================================
// HEADER COMPONENT (future: widgets/Header/Header.tsx)
// =============================================================================

interface HeaderProps {
  title: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  className?: string;
}

export function Header({ title, leftAction, rightAction, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4",
        className
      )}
    >
      <div className="flex size-10 items-center justify-start">
        {leftAction}
      </div>
      <h1 className="text-xl font-bold text-blue-600">{title}</h1>
      <div className="flex size-10 items-center justify-end">
        {rightAction}
      </div>
    </header>
  );
}

// =============================================================================
// WELCOME SECTION (future: widgets/WelcomeSection/WelcomeSection.tsx)
// =============================================================================

function WelcomeSection() {
  return (
    <section className="flex flex-col items-center px-4 pt-20 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-blue-50">
        <Bot className="size-8 text-blue-600" strokeWidth={1.5} />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">
        How can I help you today?
      </h2>
      <p className="text-sm font-medium text-gray-500">
        Ask me anything and I&apos;ll do my best to assist you
      </p>
    </section>
  );
}

// =============================================================================
// SUGGESTION CARD (future: entities/SuggestionCard/SuggestionCard.tsx)
// =============================================================================

interface SuggestionCardItemProps {
  title: string;
  description: string;
  onClick?: () => void;
}

function SuggestionCardItem({
  title,
  description,
  onClick,
}: SuggestionCardItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl bg-gray-100 p-4 text-left",
        "border-[1.5px] border-neutral-300",
        "transition-colors hover:bg-gray-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      )}
    >
      <span className="block text-base font-semibold text-neutral-950">
        {title}
      </span>
      <span className="block text-sm font-medium text-neutral-500">{description}</span>
    </button>
  );
}

// =============================================================================
// SUGGESTIONS LIST (future: features/SuggestionsList/SuggestionsList.tsx)
// =============================================================================

interface SuggestionsListProps {
  suggestions: SuggestionCard[];
  onSuggestionClick?: (suggestion: SuggestionCard) => void;
}

function SuggestionsList({
  suggestions,
  onSuggestionClick,
}: SuggestionsListProps) {
  return (
    <section
      aria-label="Suggested prompts"
      className="flex flex-col gap-3 px-4 pb-4 pt-10"
    >
      {suggestions.map((suggestion) => (
        <SuggestionCardItem
          key={suggestion.id}
          title={suggestion.title}
          description={suggestion.description}
          onClick={() => onSuggestionClick?.(suggestion)}
        />
      ))}
    </section>
  );
}

// =============================================================================
// MESSAGE BUBBLE (future: entities/MessageBubble/MessageBubble.tsx)
// =============================================================================

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-blue-600" : "bg-gray-200"
        )}
      >
        {isUser ? (
          <User className="size-4 text-white" />
        ) : (
          <Bot className="size-4 text-gray-600" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}

// =============================================================================
// CHAT VIEW (future: features/ChatView/ChatView.tsx)
// =============================================================================

interface ChatViewProps {
  messages: Message[];
  isLoading?: boolean;
}

function ChatView({ messages, isLoading }: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
      <div className="flex flex-col gap-4 p-4 pt-20">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
              <Bot className="size-4 text-gray-600" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-3">
              <span className="size-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
              <span className="size-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
              <span className="size-2 animate-bounce rounded-full bg-gray-400" />
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

// =============================================================================
// MESSAGE INPUT (future: features/MessageInput/MessageInput.tsx)
// =============================================================================

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

function MessageInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "Type your message...",
}: MessageInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && value.trim()) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Message input"
          className={cn(
            "h-12 w-full rounded-full bg-gray-100 px-5 text-base font-medium text-gray-900",
            "placeholder:text-neutral-500",
            "outline-none",
            "caret-neutral-950",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
      </div>
      <Button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className={cn(
          "size-12 shrink-0 rounded-full",
          "bg-blue-600 text-white hover:bg-blue-700",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
          "disabled:bg-blue-400 disabled:cursor-not-allowed"
        )}
      >
        <ArrowUp className="size-5" strokeWidth={2.5} />
      </Button>
    </div>
  );
}

// =============================================================================
// FOOTER (future: widgets/Footer/Footer.tsx)
// =============================================================================

interface FooterProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

function Footer({
  inputValue,
  onInputChange,
  onSubmit,
  isLoading = false,
}: FooterProps) {
  return (
    <footer className="sticky bottom-0 w-full border-t border-gray-200 bg-white px-4 pb-6 pt-4">
      <MessageInput
        value={inputValue}
        onChange={onInputChange}
        onSubmit={onSubmit}
        disabled={isLoading}
      />
      <p className="mt-3 text-center text-xs text-gray-400">
        AI can make mistakes.
        <br />
        Double check the important information.
      </p>
    </footer>
  );
}

// =============================================================================
// MAIN PAGE (future: pages/HomePage/HomePage.tsx)
// =============================================================================

export default function HomePage() {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>("1");
  const [messages, setMessages] = useState<Message[]>([]);

  // Handler stubs for future business logic integration
  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleConversationClick = (conversation: Conversation) => {
    setActiveConversationId(conversation.id);
    setIsSidebarOpen(false);
    // TODO: Load conversation messages
    console.log("Selected conversation:", conversation.id);
  };

  const handleNewChat = () => {
    setActiveConversationId(undefined);
    setIsSidebarOpen(false);
    setInputValue("");
    setMessages([]);
  };

  const handleSuggestionClick = (suggestion: SuggestionCard) => {
    setInputValue(suggestion.title);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
    };

    // Add user message to chat
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error:", data);
        throw new Error(data.details || data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        conversations={MOCK_CONVERSATIONS}
        activeConversationId={activeConversationId}
        onConversationClick={handleConversationClick}
        onNewChat={handleNewChat}
      />

      <div className="flex min-h-dvh flex-col bg-white">
        {/* Header */}
        <Header
          title="GPT Assistant"
          leftAction={
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMenuClick}
              aria-label="Open menu"
              className="text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <Menu className="size-6" />
            </Button>
          }
          className="fixed w-full z-30"
        />

        {/* Main Content - scrollable */}
        <main className="flex flex-1 flex-col overflow-y-auto">
          {messages.length === 0 ? (
            <>
              <WelcomeSection />
              <SuggestionsList
                suggestions={SUGGESTION_CARDS}
                onSuggestionClick={handleSuggestionClick}
              />
            </>
          ) : (
            <ChatView messages={messages} isLoading={isLoading} />
          )}
        </main>

        {/* Footer - fixed at bottom */}
        <Footer
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
