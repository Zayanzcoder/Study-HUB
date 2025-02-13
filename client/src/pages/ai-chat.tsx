import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { apiRequest } from "@/lib/queryClient";
import { Send } from "lucide-react";

interface Message {
  content: string;
  isAI: boolean;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const chatMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const res = await apiRequest("POST", "/api/ai/chat", { prompt });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { content: data.response, isAI: true },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { content: input, isAI: false }]);
    chatMutation.mutate(input);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message, i) => (
          <ChatBubble
            key={i}
            message={message.content}
            isAI={message.isAI}
          />
        ))}
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
