"use client";

import { useState, useRef, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Menu, Bot, ArrowUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Sidebar, type Conversation } from "@/app/widgets/Sidebar";
import { chatStore } from "@/app/stores/ChatStore";
import type { Message } from "@/app/types/chat";

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
        "sticky top-0 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4",
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

      {/* place 'Bot' icon to separate component in the future */}

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

const ChatView = observer(() => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatStore.messages.length]);

  return (
    <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
      <div className="flex flex-col gap-4 p-4 pt-20">
        {chatStore.messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}

        {/* Loading indicator */}
        {chatStore.isLoading && (
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
});

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

const Footer = observer(() => {
  return (
    <footer className="sticky bottom-0 w-full border-t border-gray-200 bg-white px-4 pb-6 pt-4">
      <MessageInput
        value={chatStore.inputValue}
        onChange={(value) => chatStore.setInputValue(value)}
        onSubmit={() => chatStore.sendMessage()}
        disabled={chatStore.isLoading}
      />
      <p className="mt-3 text-center text-xs text-gray-400">
        AI can make mistakes.
        <br />
        Double check the important information.
      </p>
    </footer>
  );
});

// =============================================================================
// MAIN PAGE (future: pages/HomePage/HomePage.tsx)
// =============================================================================

const HomePage = observer(() => {
  // UI state (not moved to store - local to this page)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    chatStore.loadConversations();
  }, []);

  // Handler stubs for future business logic integration
  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleConversationClick = (conversation: Conversation) => {
    chatStore.loadConversation(conversation.id);
    setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    chatStore.setCurrentConversation(null);
    chatStore.clearInput();
    chatStore.clearMessages();
    setIsSidebarOpen(false);
  };

  const handleSuggestionClick = (suggestion: SuggestionCard) => {
    chatStore.setInputValue(suggestion.title);
  };

  return (
    <>
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        conversations={chatStore.conversations}
        activeConversationId={chatStore.currentConversationId ?? undefined}
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
          {!chatStore.hasMessages ? (
            <>
              <WelcomeSection />
              <SuggestionsList
                suggestions={SUGGESTION_CARDS}
                onSuggestionClick={handleSuggestionClick}
              />
            </>
          ) : (
            <ChatView />
          )}
        </main>

        {/* Footer - fixed at bottom */}
        <Footer />
      </div>
    </>
  );
});

export default HomePage;
