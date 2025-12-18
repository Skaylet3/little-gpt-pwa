import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// =============================================================================
// TYPES
// =============================================================================

interface ChatRequest {
  conversationId: string;
  message: string;
}

// =============================================================================
// SYSTEM PROMPT (defines AI behavior)
// =============================================================================

const SYSTEM_PROMPT = `You are a helpful, friendly AI assistant.
You provide clear, concise, and accurate responses.
You can help with a wide range of tasks including answering questions,
explaining concepts, helping with code, writing, and general conversation.
If you don't know something, you say so honestly.`;

// =============================================================================
// API HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set");
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { conversationId, message }: ChatRequest = await request.json();

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: "conversationId and message are required" },
        { status: 400 }
      );
    }

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: session.user.id,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Save user message to DB
    const userMessage = await prisma.message.create({
      data: {
        role: "user",
        content: message,
        conversationId,
      },
    });

    // Fetch conversation history from DB
    const history = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      select: { role: true, content: true },
    });

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Build messages array with system prompt + history
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openaiMessages,
    });

    const responseContent = completion.choices[0]?.message?.content || "";

    // Save assistant response to DB
    const assistantMessage = await prisma.message.create({
      data: {
        role: "assistant",
        content: responseContent,
        conversationId,
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Return only the assistant message
    return NextResponse.json({
      id: assistantMessage.id,
      role: "assistant",
      content: responseContent,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate response", details: errorMessage },
      { status: 500 }
    );
  }
}
