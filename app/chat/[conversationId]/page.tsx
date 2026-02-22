import { ChatArea } from "@/components/chat/ChatArea";
import { Id } from "@/convex/_generated/dataModel";

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { conversationId } = await params;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ChatArea conversationId={conversationId as Id<"conversations">} />
    </div>
  );
}
