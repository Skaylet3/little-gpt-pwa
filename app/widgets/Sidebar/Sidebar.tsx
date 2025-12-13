"use client";

import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Header } from "@/app/page";

// =============================================================================
// TYPES (future: app/types/conversation.ts)
// =============================================================================

interface Conversation {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isActive?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId?: string;
  onConversationClick?: (conversation: Conversation) => void;
  onNewChat?: () => void;
}

// =============================================================================
// CONVERSATION CARD (future: entities/ConversationCard/ConversationCard.tsx)
// =============================================================================

interface ConversationCardProps {
  title: string;
  description: string;
  timestamp: string;
  isActive?: boolean;
  onClick?: () => void;
}

function ConversationCard({
  title,
  description,
  timestamp,
  isActive = false,
  onClick,
}: ConversationCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl bg-white p-4 text-left",
        "border border-gray-200",
        "transition-colors hover:bg-gray-50",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div
          className={cn(
            "size-3 rounded-full",
            isActive ? "bg-blue-600" : "bg-gray-300"
          )}
          aria-hidden="true"
        />
        <span className="text-xs font-medium text-gray-400">{timestamp}</span>
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm font-medium text-gray-500 line-clamp-1">{description}</p>
    </button>
  );
}

// =============================================================================
// CONVERSATIONS LIST (future: features/ConversationsList/ConversationsList.tsx)
// =============================================================================

interface ConversationsListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onConversationClick?: (conversation: Conversation) => void;
}

function ConversationsList({
  conversations,
  activeConversationId,
  onConversationClick,
}: ConversationsListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-center text-sm text-gray-500">
          No conversations yet.
          <br />
          Start a new chat!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div
        className="flex flex-col gap-3 p-4"
        role="list"
        aria-label="Conversation history"
      >
        {conversations.map((conversation) => (
          <ConversationCard
            key={conversation.id}
            title={conversation.title}
            description={conversation.description}
            timestamp={conversation.timestamp}
            isActive={conversation.id === activeConversationId}
            onClick={() => onConversationClick?.(conversation)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

// =============================================================================
// NEW CHAT BUTTON (future: features/NewChatButton/NewChatButton.tsx)
// =============================================================================

interface NewChatButtonProps {
  onClick?: () => void;
}

function NewChatButton({ onClick }: NewChatButtonProps) {
  return (
    <div className="shrink-0 border-t border-gray-200 bg-gray-50 p-4">
      <Button
        type="button"
        onClick={onClick}
        className={cn(
          "w-full rounded-full",
          "bg-blue-600 text-base font-semibold text-white",
          "hover:bg-blue-700",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        )}
      >
        <Plus className="size-5" strokeWidth={2.5} />
        New Chat
      </Button>
    </div>
  );
}

// =============================================================================
// SIDEBAR OVERLAY (future: widgets/Sidebar/SidebarOverlay.tsx)
// =============================================================================

interface SidebarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

function SidebarOverlay({ isOpen, onClose }: SidebarOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 transition-opacity"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      aria-hidden="true"
    />
  );
}

// =============================================================================
// MAIN SIDEBAR COMPONENT (future: widgets/Sidebar/Sidebar.tsx)
// =============================================================================

export function Sidebar({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onConversationClick,
  onNewChat,
}: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      <SidebarOverlay isOpen={isOpen} onClose={onClose} />

      {/* Sidebar Panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex w-[86%] h-full max-w-sm flex-col bg-gray-50",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Chat history sidebar"
        aria-hidden={!isOpen}
      >
        <Header
          title="Chat History"
          rightAction={
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close sidebar"
              className="text-gray-700 hover:bg-gray-100"
            >
              <X className="size-6" />
            </Button>
          }
        />
        <ConversationsList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onConversationClick={onConversationClick}
        />
        <NewChatButton onClick={onNewChat} />
      </aside>
    </>
  );
}

// =============================================================================
// BARREL EXPORT
// =============================================================================

export type { Conversation, SidebarProps };
