"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

export function NewGroupDialog() {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState<Id<"users">[]>([]);
  const router = useRouter();
  const { convexUser } = useCurrentUser();

  const users = useQuery(
    api.users.getAllUsers,
    convexUser ? { currentClerkId: convexUser.clerkId } : "skip"
  );

  const createGroup = useMutation(api.conversations.createGroup);

  const toggle = (id: Id<"users">) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selected.length < 1 || !convexUser) return;
    try {
      const id = await createGroup({
        name: groupName.trim(),
        participantIds: selected,
        creatorId: convexUser._id,
      });
      setOpen(false);
      setGroupName("");
      setSelected([]);
      router.push(`/chat/${id}`);
    } catch {
      toast.error("Failed to create group");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="New Group">
          <Users className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <p className="text-sm text-zinc-500">
            Select members ({selected.length} selected)
          </p>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {users?.map((u) => (
              <button
                key={u._id}
                onClick={() => toggle(u._id)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-100 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={u.imageUrl} />
                  <AvatarFallback>{u.name[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-left text-sm font-medium">
                  {u.name}
                </span>
                {selected.includes(u._id) && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={!groupName.trim() || selected.length < 1}
          >
            Create Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
