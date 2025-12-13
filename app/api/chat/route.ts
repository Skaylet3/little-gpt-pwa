import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

// =============================================================================
// TYPES
// =============================================================================

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: Message[];
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
    // Check API key first
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set");
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { messages }: ChatRequest = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Build messages array with system prompt
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((msg) => ({
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

    return NextResponse.json({
      role: "assistant",
      content: responseContent,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Return more specific error info
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate response", details: errorMessage },
      { status: 500 }
    );
  }
}
