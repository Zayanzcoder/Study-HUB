import { ChatBubble } from "@/components/ui/chat-bubble";

interface Message {
  id: number;
  content: string;
  isUser: boolean;
}

interface ChatWindowProps {
  messages: Message[];
}

export default function ChatWindow({ messages }: ChatWindowProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          message={message.content}
          isAI={!message.isUser}
        />
      ))}
    </div>
  );
}
