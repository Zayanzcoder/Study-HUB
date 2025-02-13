import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import ChatWindow from "@/components/chat/chat-window";
import { apiRequest } from "@/lib/queryClient";

type Message = {
  id: number;
  content: string;
  isUser: boolean;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat", { message });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 2, content: data.response, isUser: false },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, content: input, isUser: true },
    ]);
    sendMessage.mutate(input);
    setInput("");
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)]">
      <ChatWindow messages={messages} />
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            disabled={sendMessage.isPending}
          />
          <Button type="submit" disabled={sendMessage.isPending}>
            Send
          </Button>
        </div>
      </form>
    </Card>
  );
}
