
import React, { useRef, useState, useEffect } from "react";
import ChatInput from "./ChatInput";
import { MarkdownMessage } from "./MarkdownMessage";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  id: string;
  user: string;
  content: string;
  timestamp: number;
}
const USERS = ["alice", "bob", "carol"];
function fakeUser() {
  return USERS[Math.floor(Math.random() * USERS.length)];
}
export default function InAppChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      user: "alice",
      content: "Welcome to the #general channel! Type @mentions, Markdown, or code like `print('hi')`.",
      timestamp: Date.now(),
    },
  ]);
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  function handleSend(content: string) {
    setMessages((msgs) => [
      ...msgs,
      {
        id: String(Date.now()),
        user: "me",
        content,
        timestamp: Date.now(),
      },
    ]);
  }

  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 overflow-auto pr-2">
        <div className="flex flex-col gap-4 p-2">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-primary">
                {msg.user === "me" ? "👤" : msg.user.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex gap-2 items-center mb-0.5">
                  <span className="font-medium">{msg.user}</span>
                  <span className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}</span>
                </div>
                <MarkdownMessage content={msg.content} />
              </div>
            </div>
          ))}
          <div ref={scrollBottomRef} />
        </div>
      </ScrollArea>
      <div className="mt-4 pt-2 border-t bg-background">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
