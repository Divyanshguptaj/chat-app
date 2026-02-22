"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MessageInputProps {
  conversationId: Id<"conversations">;
  senderId: Id<"users">;
}

const TYPING_DEBOUNCE = 2000;

export function MessageInput({ conversationId, senderId }: MessageInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const sendMessage = useMutation(api.messages.send);
  const setTyping = useMutation(api.typing.setTyping);

  const triggerTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      setTyping({ conversationId, userId: senderId, isTyping: true });
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTypingRef.current = false;
      setTyping({ conversationId, userId: senderId, isTyping: false });
    }, TYPING_DEBOUNCE);
  }, [conversationId, senderId, setTyping]);

  const clearTyping = useCallback(() => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      setTyping({ conversationId, userId: senderId, isTyping: false });
    }
  }, [conversationId, senderId, setTyping]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (e.target.value.trim()) {
      triggerTyping();
    } else {
      clearTyping();
    }
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText("");
    setError(null);
    clearTyping();
    setSending(true);
    try {
      await sendMessage({ conversationId, senderId, content });
    } catch {
      setError("Failed to send message");
      setText(content);
      toast.error("Failed to send message. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-3 border-t border-zinc-200 bg-white">
      {error && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={handleSend}
            className="ml-2 font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-zinc-50 border-zinc-200 focus-visible:ring-blue-400"
          disabled={sending}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="rounded-full bg-blue-600 hover:bg-blue-700 flex-shrink-0"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
