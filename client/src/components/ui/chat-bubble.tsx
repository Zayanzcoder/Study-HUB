import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";
import { User, MessageSquare } from "lucide-react";

interface ChatBubbleProps {
  message: string;
  isAI?: boolean;
  className?: string;
}

export function ChatBubble({ message, isAI = false, className }: ChatBubbleProps) {
  return (
    <Card
      className={cn(
        "w-fit max-w-[80%]",
        isAI ? "ml-4" : "ml-auto mr-4",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          {isAI ? (
            <MessageSquare className="h-6 w-6 text-primary" />
          ) : (
            <User className="h-6 w-6 text-accent" />
          )}
          <p className="text-sm">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
