"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface TypingIndicatorProps {
  conversationId: Id<"conversations">;
  currentUserId: Id<"users">;
}

export function TypingIndicator({
  conversationId,
  currentUserId,
}: TypingIndicatorProps) {
  const typingUsers = useQuery(api.typing.getTypingUsers, {
    conversationId,
    currentUserId,
  });

  if (!typingUsers || typingUsers.length === 0) return null;

  const names = typingUsers
    .map((t) => t.user?.name?.split(" ")[0])
    .filter(Boolean);

  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : `${names.join(", ")} are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-zinc-500">
      <span>{label}</span>
      <span className="flex gap-0.5">
        <span className="animate-bounce h-1.5 w-1.5 rounded-full bg-zinc-400 [animation-delay:0ms]" />
        <span className="animate-bounce h-1.5 w-1.5 rounded-full bg-zinc-400 [animation-delay:150ms]" />
        <span className="animate-bounce h-1.5 w-1.5 rounded-full bg-zinc-400 [animation-delay:300ms]" />
      </span>
    </div>
  );
}
