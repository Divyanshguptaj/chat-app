"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OnlineIndicator } from "./OnlineIndicator";
import { formatConversationTime, cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Users } from "lucide-react";

interface ConversationItemProps {
  conversationId: Id<"conversations">;
  isGroup: boolean;
  groupName?: string;
  otherParticipants: Array<{
    _id: Id<"users">;
    name: string;
    imageUrl: string;
    lastSeen: number;
  }>;
  lastMessageTime?: number;
  lastMessagePreview?: string;
  currentUserId: Id<"users">;
  isActive: boolean;
}

export function ConversationItem({
  conversationId,
  isGroup,
  groupName,
  otherParticipants,
  lastMessageTime,
  lastMessagePreview,
  currentUserId,
  isActive,
}: ConversationItemProps) {
  const unreadCount = useQuery(api.readReceipts.getUnreadCount, {
    conversationId,
    userId: currentUserId,
  });

  const other = otherParticipants[0];
  const displayName = isGroup
    ? groupName ?? "Group Chat"
    : other?.name ?? "Unknown";
  const displayImage = isGroup ? null : other?.imageUrl;

  return (
    <Link href={`/chat/${conversationId}`}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-3 cursor-pointer transition-colors",
          isActive
            ? "bg-blue-50 hover:bg-blue-100"
            : "hover:bg-zinc-100"
        )}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {isGroup ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          ) : (
            <>
              <Avatar className="h-10 w-10">
                <AvatarImage src={displayImage ?? ""} />
                <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              {other && (
                <OnlineIndicator
                  lastSeen={other.lastSeen}
                  className="absolute -bottom-0.5 -right-0.5"
                />
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={cn("truncate text-sm font-semibold", isActive ? "text-blue-900" : "text-zinc-900")}>
              {displayName}
            </p>
            {lastMessageTime && (
              <span className="text-xs text-zinc-400 flex-shrink-0">
                {formatConversationTime(lastMessageTime)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="truncate text-xs text-zinc-500">
              {lastMessagePreview ?? "No messages yet"}
            </p>
            {unreadCount != null && unreadCount > 0 && (
              <Badge className="flex-shrink-0 h-5 min-w-5 bg-blue-600 text-white text-xs px-1.5">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
