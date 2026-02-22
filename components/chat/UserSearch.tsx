"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, X } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { OnlineIndicator } from "./OnlineIndicator";
import { useRouter } from "next/navigation";

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { convexUser } = useCurrentUser();

  const users = useQuery(
    api.users.getAllUsers,
    convexUser ? { currentClerkId: convexUser.clerkId } : "skip"
  );

  const getOrCreate = useMutation(api.conversations.getOrCreate);

  const filtered = users?.filter((u) =>
    u.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectUser = async (userId: string) => {
    if (!convexUser) return;
    const convId = await getOrCreate({
      currentUserId: convexUser._id,
      otherUserId: userId as never,
    });
    setOpen(false);
    setQuery("");
    router.push(`/chat/${convId}`);
  };

  return (
    <div className="relative">
      {open ? (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              className="pl-9 pr-9"
              placeholder="Search users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button
              onClick={() => { setOpen(false); setQuery(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {query && (
            <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
              {filtered?.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-zinc-500">
                  No users found for &ldquo;{query}&rdquo;
                </p>
              ) : (
                filtered?.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleSelectUser(u._id)}
                    className="flex w-full items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors border-b last:border-b-0"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.imageUrl} />
                        <AvatarFallback>{u.name[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <OnlineIndicator
                        lastSeen={u.lastSeen}
                        className="absolute -bottom-0.5 -right-0.5"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-zinc-500">{u.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 transition-colors"
        >
          <Search className="h-4 w-4" />
          Search people...
        </button>
      )}
    </div>
  );
}
