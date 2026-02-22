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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id]);

  return {
    clerkUser: user,
    convexUser,
    isLoaded: isLoaded && convexUser !== undefined,
  };
}
