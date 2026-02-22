"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTimestamp, cn } from "@/lib/utils";
import { Trash2, MoreHorizontal, Smile } from "lucide-react";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

interface Reaction {
  _id: Id<"reactions">;
  messageId: Id<"messages">;
  userId: Id<"users">;
  emoji: string;
}

interface MessageItemProps {
  id: Id<"messages">;
  content: string;
  isDeleted: boolean;
  createdAt: number;
  sender: {
    _id: Id<"users">;
    name: string;
    imageUrl: string;
  } | null;
  reactions: Reaction[];
  isOwn: boolean;
  showSenderName: boolean;
  currentUserId: Id<"users">;
}

export function MessageItem({
  id,
  content,
  isDeleted,
  createdAt,
  sender,
  reactions,
  isOwn,
  showSenderName,
  currentUserId,
}: MessageItemProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const toggleReaction = useMutation(api.messages.toggleReaction);

  const handleDelete = async () => {
    await deleteMessage({ messageId: id, userId: currentUserId });
  };

  const handleReaction = async (emoji: string) => {
    await toggleReaction({ messageId: id, userId: currentUserId, emoji });
    setShowEmojiPicker(false);
  };

  // Group reactions by emoji
  const reactionGroups = reactions.reduce<Record<string, { count: number; mine: boolean }>>(
    (acc, r) => {
      if (!acc[r.emoji]) acc[r.emoji] = { count: 0, mine: false };
      acc[r.emoji].count++;
      if (r.userId === currentUserId) acc[r.emoji].mine = true;
      return acc;
    },
    {}
  );

  return (
    <div
      className={cn(
        "group flex items-end gap-2 px-4 py-1",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {!isOwn && (
        <Avatar className="h-7 w-7 shrink-0 self-end mb-1">
          <AvatarImage src={sender?.imageUrl ?? ""} />
          <AvatarFallback className="text-xs">
            {sender?.name[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col max-w-[75%]", isOwn ? "items-end" : "items-start")}>
        {/* Sender name (for group chats) */}
        {showSenderName && !isOwn && (
          <span className="text-xs font-medium text-zinc-500 mb-1 px-1">
            {sender?.name}
          </span>
        )}

        {/* Bubble + actions */}
        <div className={cn("relative flex items-end gap-1.5", isOwn ? "flex-row-reverse" : "flex-row")}>
          {/* Action buttons (shown on hover, hidden for deleted) */}
          {!isDeleted && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              <button
                onClick={() => setShowEmojiPicker((v) => !v)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
              >
                <Smile className="h-3.5 w-3.5" />
              </button>
              {isOwn && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isOwn ? "end" : "start"}>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete message
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* Emoji picker floating panel */}
          {showEmojiPicker && (
            <div className={cn(
              "absolute bottom-8 z-20 flex gap-1 p-1.5 rounded-full bg-white border border-zinc-200 shadow-lg",
              isOwn ? "right-0" : "left-0"
            )}>
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-lg hover:scale-125 transition-transform leading-none"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Message bubble */}
          <div
            className={cn(
              "rounded-2xl px-3.5 py-2 text-sm",
              isOwn
                ? "bg-blue-600 text-white rounded-br-sm"
                : "bg-zinc-100 text-zinc-900 rounded-bl-sm"
            )}
          >
            {isDeleted ? (
              <span className={cn("italic", isOwn ? "text-white/60" : "text-zinc-400")}>
                {isOwn ? "You deleted this message" : "This message was deleted"}
              </span>
            ) : (
              <span className="whitespace-pre-wrap wrap-break-word">{content}</span>
            )}
          </div>
        </div>

        {/* Reactions (not shown for deleted messages) */}
        {!isDeleted && Object.keys(reactionGroups).length > 0 && (
          <div className={cn("flex flex-wrap gap-1 mt-1", isOwn ? "justify-end" : "justify-start")}>
            {Object.entries(reactionGroups).map(([emoji, { count, mine }]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs border transition-colors",
                  mine
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                )}
              >
                {emoji} {count}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="mt-1 px-1 text-[10px] text-zinc-400">
          {formatTimestamp(createdAt)}
        </span>
      </div>
    </div>
  );
}
