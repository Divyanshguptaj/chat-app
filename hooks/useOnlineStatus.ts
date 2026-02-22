"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

const ONLINE_INTERVAL = 15000; // ping every 15 seconds
const ONLINE_THRESHOLD = 35000; // online if pinged in last 35 seconds

export function useOnlineStatus() {
  const { user, isLoaded } = useUser();
  const updateLastSeen = useMutation(api.users.updateLastSeen);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const ping = () => updateLastSeen({ clerkId: user.id });
    ping();

    intervalRef.current = setInterval(ping, ONLINE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoaded, user, updateLastSeen]);
}

export function isOnline(lastSeen: number): boolean {
  return Date.now() - lastSeen < ONLINE_THRESHOLD;
}
