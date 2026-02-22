# ChatApp

A real-time full-stack chat application built with **Next.js 16**, **Convex**, **Clerk**, and **Tailwind CSS + shadcn/ui**.

## Features

- **Authentication** – Sign up / sign in via email or social login (Clerk)
- **User Discovery** – Browse and search all users with live filtering
- **1-on-1 DMs** – Real-time private conversations with Convex subscriptions
- **Message Timestamps** – Smart formatting (today: time only, older: date + time)
- **Empty States** – Helpful messages throughout the UI
- **Responsive Layout** – Desktop sidebar + chat; mobile full-screen with back navigation
- **Online / Offline Status** – Green dot indicator, updated every 15 seconds
- **Typing Indicator** – Animated dots that disappear after 2s of inactivity
- **Unread Badges** – Real-time unread count per conversation, cleared on open
- **Smart Auto-scroll** – Auto-scrolls to new messages; shows "↓ New messages" button when scrolled up
- **Delete Messages** – Soft delete with "This message was deleted" placeholder
- **Message Reactions** – 👍 ❤️ 😂 😮 😢 with toggle support and per-emoji counts
- **Group Chat** – Create named groups with multiple members

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Backend / DB | Convex |
| Auth | Clerk |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Icons | Lucide React |

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/Divyanshguptaj/chat-app.git
cd chat-app
npm install
```

### 2. Set up Clerk

1. Create an account at [clerk.com](https://clerk.com)
2. Create a new application
3. In **JWT Templates**, create a template named `convex` and copy the **Issuer URL**
4. Note your **Publishable Key** and **Secret Key**

### 3. Set up Convex

```bash
npx convex dev
# Follow the prompts to create a project
```

In the **Convex Dashboard** → your project → **Settings → Environment Variables**:

| Key | Value |
|-----|-------|
| `CLERK_JWT_ISSUER_DOMAIN` | Your Clerk JWT Issuer URL |

### 4. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat
```

### 5. Run the development server

In two separate terminals:

```bash
# Terminal 1: Convex backend
npm run convex

# Terminal 2: Next.js frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
chat-app/
├── app/
│   ├── (auth)/           # Clerk sign-in / sign-up pages
│   ├── chat/             # Main chat layout, conversation pages
│   └── layout.tsx        # Root layout with providers
├── components/
│   ├── chat/             # Sidebar, ChatArea, MessageList, etc.
│   ├── providers/        # ConvexClerkProvider
│   └── ui/               # shadcn/ui components
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema
│   ├── users.ts          # User queries & mutations
│   ├── conversations.ts  # Conversation logic
│   ├── messages.ts       # Message CRUD + reactions
│   ├── typing.ts         # Typing indicators
│   └── readReceipts.ts   # Unread tracking
├── hooks/                # useCurrentUser, useOnlineStatus
└── lib/                  # Utilities (cn, formatTimestamp)
```

## Deployment

Deploy to **Vercel** + **Convex** (both have generous free tiers):

```bash
# Deploy Convex backend
npm run convex:deploy

# Deploy Next.js to Vercel
vercel
```
