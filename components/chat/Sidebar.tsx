"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { ConversationItem } from "./ConversationItem";
import { UserSearch } from "./UserSearch";
import { NewGroupDialog } from "./NewGroupDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OnlineIndicator } from "./OnlineIndicator";
import { UserButton } from "@clerk/nextjs";
import { MessageSquare } from "lucide-react";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";

export function Sidebar() {
  useOnlineStatus();
  const params = useParams();
  const activeConvId = params?.conversationId as string | undefined;

  const { convexUser, isLoaded } = useCurrentUser();

  const conversations = useQuery(
    api.conversations.getUserConversations,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  return (
    <aside className="flex h-full w-full flex-col bg-white border-r border-zinc-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <h1 className="text-lg font-bold text-zinc-900">Chats</h1>
        </div>
        <div className="flex items-center gap-1">
          <NewGroupDialog />
          <UserButton />
        </div>
      </div>

      {/* Current user info */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100">
        {convexUser ? (
          <>
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={convexUser.imageUrl} />
                <AvatarFallback>{convexUser.name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <OnlineIndicator
                lastSeen={convexUser.lastSeen}
                className="absolute -bottom-0.5 -right-0.5"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{convexUser.name}</p>
              <p className="text-xs text-green-600">Online</p>
            </div>
          </>
        ) : (
          <>
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
          </>
        )}
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-zinc-100">
        <UserSearch />
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {!isLoaded ? (
          <div className="space-y-1 px-1 pt-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-28 rounded" />
                  <Skeleton className="h-3 w-40 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <MessageSquare className="h-12 w-12 text-zinc-300 mb-3" />
            <p className="text-sm font-medium text-zinc-500">No conversations yet</p>
            <p className="text-xs text-zinc-400 mt-1">
              Search for a user above to start chatting
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {conversations?.map((conv) => (
              <ConversationItem
                key={conv._id}
                conversationId={conv._id as Id<"conversations">}
                isGroup={conv.isGroup}
                groupName={conv.groupName}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                otherParticipants={conv.otherParticipants as any}
                lastMessageTime={conv.lastMessageTime}
                lastMessagePreview={conv.lastMessagePreview}
                currentUserId={convexUser!._id}
                isActive={activeConvId === conv._id}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
