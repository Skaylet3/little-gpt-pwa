import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/conversations - List user's conversations
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Format for frontend (match Sidebar's Conversation type)
  const formatted = conversations.map((conv) => ({
    id: conv.id,
    title: conv.title || "New Chat",
    description: conv.messages[0]?.content || "No messages yet",
    timestamp: formatTimestamp(conv.updatedAt),
  }));

  return NextResponse.json(formatted);
}

// POST /api/conversations - Create new conversation
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const title = body.title || null;

  const conversation = await prisma.conversation.create({
    data: {
      userId: session.user.id,
      title,
    },
  });

  return NextResponse.json({
    id: conversation.id,
    title: conversation.title || "New Chat",
    description: "No messages yet",
    timestamp: formatTimestamp(conversation.createdAt),
  });
}

// Helper to format timestamp
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}
