import { Sidebar } from "@/components/chat/Sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      {/* Sidebar – always visible on desktop, hidden on mobile when in a chat */}
      <div className="hidden md:flex md:w-80 lg:w-96 flex-shrink-0 flex-col h-full">
        <Sidebar />
      </div>

      {/* Mobile sidebar (shown when no conversation is open – see /chat/page.tsx) */}
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
