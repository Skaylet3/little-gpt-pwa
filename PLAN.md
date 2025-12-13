# Little-GPT Setup Plan

## Project Overview
A ChatGPT-like chatbot with OpenAI API integration, offline support, and full PWA capabilities.

---

## Phase 1: Dependencies

### Task 1.1: Install required packages
```bash
bun add openai next-pwa idb
```

### Task 1.2: Install optional utilities
```bash
bun add clsx
```

---

## Phase 2: Environment Configuration

### Task 2.1: Create `.env.example`
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Task 2.2: Create `.env.local`
```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
```

### Task 2.3: Update `.gitignore`
Ensure `.env.local` is ignored (should already be there).

---

## Phase 3: Project Structure

### Task 3.1: Create folder structure
```bash
mkdir -p app/api/chat
mkdir -p app/components/Chat
mkdir -p app/components/ui
mkdir -p lib
mkdir -p types
mkdir -p utils
mkdir -p public/icons
```

---

## Phase 4: TypeScript Types

### Task 4.1: Create `types/chat.ts`
```typescript
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
}
```

---

## Phase 5: OpenAI Integration

### Task 5.1: Create `lib/openai.ts`
```typescript
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const SYSTEM_PROMPT = `You are a helpful AI assistant. Be concise, friendly, and helpful.`;
```

### Task 5.2: Create `app/api/chat/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { openai, SYSTEM_PROMPT } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: false,
    });

    return NextResponse.json({
      message: response.choices[0].message,
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response' },
      { status: 500 }
    );
  }
}
```

---

## Phase 6: PWA Configuration

### Task 6.1: Create `public/manifest.json`
```json
{
  "name": "Little GPT",
  "short_name": "LittleGPT",
  "description": "A lightweight ChatGPT-like assistant with offline support",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#0a0a0a",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Task 6.2: Update `next.config.ts`
```typescript
import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.openai\.com\/.*/i,
      handler: 'NetworkOnly',
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
  ],
});

export default pwaConfig(nextConfig);
```

### Task 6.3: Update `app/layout.tsx` - Add PWA meta tags
Add to `<head>`:
```tsx
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#0a0a0a" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Little GPT" />
<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
```

### Task 6.4: Create placeholder icons
Create simple placeholder icons at:
- `public/icons/icon-192x192.png`
- `public/icons/icon-512x512.png`

---

## Phase 7: Offline Storage

### Task 7.1: Create `utils/storage.ts`
```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Conversation } from '@/types/chat';

interface ChatDB extends DBSchema {
  conversations: {
    key: string;
    value: Conversation;
    indexes: { 'by-updated': number };
  };
}

const DB_NAME = 'little-gpt-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ChatDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<ChatDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('conversations', { keyPath: 'id' });
        store.createIndex('by-updated', 'updatedAt');
      },
    });
  }
  return dbPromise;
}

export async function saveConversation(conversation: Conversation) {
  const db = await getDB();
  await db.put('conversations', conversation);
}

export async function getConversation(id: string) {
  const db = await getDB();
  return db.get('conversations', id);
}

export async function getAllConversations() {
  const db = await getDB();
  return db.getAllFromIndex('conversations', 'by-updated');
}

export async function deleteConversation(id: string) {
  const db = await getDB();
  await db.delete('conversations', id);
}
```

### Task 7.2: Create `utils/helpers.ts`
```typescript
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(timestamp);
}
```

---

## Phase 8: Verify Setup

### Task 8.1: Run lint check
```bash
bun run lint
```

### Task 8.2: Run build test
```bash
bun run build
```

### Task 8.3: Test dev server
```bash
bun run dev
```

---

## Execution Checklist

- [ ] Phase 1: Install dependencies (`openai`, `next-pwa`, `idb`, `clsx`)
- [ ] Phase 2: Environment files (`.env.example`, `.env.local`)
- [ ] Phase 3: Create folder structure
- [ ] Phase 4: Create `types/chat.ts`
- [ ] Phase 5: Create `lib/openai.ts` and `app/api/chat/route.ts`
- [ ] Phase 6: PWA setup (`manifest.json`, `next.config.ts`, meta tags, icons)
- [ ] Phase 7: Offline storage (`utils/storage.ts`, `utils/helpers.ts`)
- [ ] Phase 8: Verify setup (lint, build, dev)

---

## After Setup Complete

Ready to implement:
1. Chat UI components (`ChatContainer`, `MessageList`, `MessageInput`, `Message`)
2. Chat hook for state management (`useChat`)
3. Main page integration
4. Streaming responses (optional enhancement)
5. Conversation history sidebar
