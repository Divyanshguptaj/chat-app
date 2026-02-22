import { cn } from "@/lib/utils";
import { isOnline } from "@/hooks/useOnlineStatus";

interface OnlineIndicatorProps {
  lastSeen: number;
  className?: string;
  size?: "sm" | "md";
}

export function OnlineIndicator({
  lastSeen,
  className,
  size = "sm",
}: OnlineIndicatorProps) {
  const online = isOnline(lastSeen);
  return (
    <span
      className={cn(
        "inline-block rounded-full border-2 border-white",
        size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5",
        online ? "bg-green-500" : "bg-zinc-400",
        className
      )}
      title={online ? "Online" : "Offline"}
    />
  );
}
