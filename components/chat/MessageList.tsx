"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageItem } from "./MessageItem";
import { TypingIndicator } from "./TypingIndicator";
import { Loader2, MessageSquare, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageListProps {
  conversationId: Id<"conversations">;
  currentUserId: Id<"users">;
  isGroup: boolean;
}

export function MessageList({
  conversationId,
  currentUserId,
  isGroup,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const prevMessageCountRef = useRef(0);

  const messages = useQuery(api.messages.getByConversation, { conversationId });
  const markAsRead = useMutation(api.readReceipts.markAsRead);

  // Check scroll position
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setIsAtBottom(atBottom);
    if (atBottom) setNewMessageCount(0);
  }, []);

  // Auto-scroll + unread tracking
  useEffect(() => {
    if (!messages) return;
    const newCount = messages.length;
    const added = newCount - prevMessageCountRef.current;

    if (added > 0 && prevMessageCountRef.current > 0) {
      if (isAtBottom) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        setNewMessageCount(0);
      } else {
        setNewMessageCount((c) => c + added);
      }
    } else if (prevMessageCountRef.current === 0 && newCount > 0) {
      // Initial load – jump to bottom instantly
      bottomRef.current?.scrollIntoView();
    }

    prevMessageCountRef.current = newCount;
  }, [messages, isAtBottom]);

  // Mark as read when viewing
  useEffect(() => {
    if (!currentUserId || !conversationId) return;
    markAsRead({ conversationId, userId: currentUserId });
  }, [conversationId, currentUserId, markAsRead, messages?.length]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setNewMessageCount(0);
  };

  if (messages === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center px-4">
        <MessageSquare className="h-16 w-16 text-zinc-200 mb-4" />
        <p className="text-base font-medium text-zinc-500">No messages yet</p>
        <p className="text-sm text-zinc-400 mt-1">
          Say hello to start the conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-2"
      >
        {messages.map((msg, i) => {
          const prev = messages[i - 1];
          const showSenderName =
            isGroup &&
            msg.sender?._id !== currentUserId &&
            msg.sender?._id !== prev?.sender?._id;

          return (
            <MessageItem
              key={msg._id}
              id={msg._id}
              content={msg.content}
              isDeleted={msg.isDeleted}
              createdAt={msg._creationTime}
              sender={msg.sender as MessageItemProps_sender | null}
              reactions={msg.reactions ?? []}
              isOwn={msg.senderId === currentUserId}
              showSenderName={showSenderName}
              currentUserId={currentUserId}
            />
          );
        })}
        <TypingIndicator
          conversationId={conversationId}
          currentUserId={currentUserId}
        />
        <div ref={bottomRef} />
      </div>

      {/* New messages button */}
      {newMessageCount > 0 && !isAtBottom && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <Button
            size="sm"
            onClick={scrollToBottom}
            className="rounded-full shadow-lg gap-1.5 bg-blue-600 hover:bg-blue-700"
          >
            <ChevronDown className="h-4 w-4" />
            {newMessageCount} new message{newMessageCount > 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper type (kept here to avoid extra file)
type MessageItemProps_sender = {
  _id: Id<"users">;
  name: string;
  imageUrl: string;
};
