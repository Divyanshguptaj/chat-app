"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function useCurrentUser() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);

  const convexUser = useQuery(
    api.users.getByClerkId,
    isLoaded && user ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    if (!isLoaded || !user) return;
    syncUser({
      clerkId: user.id,
      name: user.fullName ?? user.username ?? "Unknown",
      email: user.emailAddresses[0]?.emailAddress ?? "",
      imageUrl: user.imageUrl ?? "",
    });
  }, [isLoaded, user, syncUser]);

  return {
    clerkUser: user,
    convexUser,
    isLoaded: isLoaded && convexUser !== undefined,
  };
}
