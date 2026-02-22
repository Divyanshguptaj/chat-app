import { Sidebar } from "@/components/chat/Sidebar";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <>
      {/* Mobile: show sidebar as full screen */}
      <div className="flex md:hidden h-full flex-col">
        <Sidebar />
      </div>

      {/* Desktop: empty state */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center px-8 bg-zinc-50">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 mb-4">
          <MessageSquare className="h-10 w-10 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-700">
          Select a conversation
        </h2>
        <p className="text-sm text-zinc-400 mt-2 max-w-xs">
          Choose an existing conversation from the sidebar, or search for a
          user to start a new chat.
        </p>
      </div>
    </>
  );
}
