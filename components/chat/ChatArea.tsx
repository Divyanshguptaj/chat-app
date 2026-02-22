"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OnlineIndicator } from "./OnlineIndicator";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { isOnline } from "@/hooks/useOnlineStatus";

interface ChatAreaProps {
  conversationId: Id<"conversations">;
}

export function ChatArea({ conversationId }: ChatAreaProps) {
  const { convexUser, isLoaded } = useCurrentUser();

  const conversation = useQuery(api.conversations.getById, { conversationId });
  const otherParticipantIds =
    conversation?.participants.filter((id) => id !== convexUser?._id) ?? [];

  const otherUsers = useQuery(
    api.users.getManyByIds,
    otherParticipantIds.length > 0
      ? { userIds: otherParticipantIds as Id<"users">[] }
      : "skip"
  );

  if (!isLoaded || conversation === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!convexUser || conversation === null) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-500">
        Conversation not found.
      </div>
    );
  }

  const isGroup = conversation.isGroup;
  const displayName = isGroup
    ? conversation.groupName ?? "Group Chat"
    : otherUsers?.[0]?.name ?? "...";
  const otherUser = otherUsers?.[0];

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 bg-white">
        {/* Back button (mobile) */}
        <Link
          href="/chat"
          className="md:hidden p-1.5 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-zinc-600" />
        </Link>

        {isGroup ? (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
        ) : (
          <div className="relative flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser?.imageUrl ?? ""} />
              <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            {otherUser && (
              <OnlineIndicator
                lastSeen={otherUser.lastSeen}
                className="absolute -bottom-0.5 -right-0.5"
              />
            )}
          </div>
        )}

        <div className="min-w-0">
          <p className="font-semibold text-zinc-900 truncate">{displayName}</p>
          {!isGroup && otherUser && (
            <p className={`text-xs ${isOnline(otherUser.lastSeen) ? "text-green-600" : "text-zinc-400"}`}>
              {isOnline(otherUser.lastSeen) ? "Online" : "Offline"}
            </p>
          )}
          {isGroup && (
            <p className="text-xs text-zinc-400">
              {conversation.participants.length} members
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageList
        conversationId={conversationId}
        currentUserId={convexUser._id}
        isGroup={isGroup}
      />

      {/* Input */}
      <MessageInput
        conversationId={conversationId}
        senderId={convexUser._id}
      />
    </div>
  );
}
