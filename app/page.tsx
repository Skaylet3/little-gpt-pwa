"use client";

import { useState } from "react";
import { Menu, Bot, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sidebar, type Conversation } from "@/app/widgets/Sidebar";

// =============================================================================
// TYPES (future: app/types/chat.ts)
// =============================================================================

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
    // TODO: Create new conversation
    console.log("New chat started");
  };

  const handleSuggestionClick = (suggestion: SuggestionCard) => {
    setInputValue(suggestion.title);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);
    // TODO: Integrate with useChat hook for API calls
    console.log("Submitting:", inputValue);

    // Simulate API delay for testing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setInputValue("");
    setIsLoading(false);
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
          <WelcomeSection />
          <SuggestionsList
            suggestions={SUGGESTION_CARDS}
            onSuggestionClick={handleSuggestionClick}
          />
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
