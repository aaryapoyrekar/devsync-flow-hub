
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (content: string) => void;
}
export default function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function handleSend() {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        ref={textareaRef}
        rows={2}
        value={value}
        placeholder="Message #general (Markdown, @mention, code supported) — Shift+Enter for newline"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[44px] max-h-40 resize-none"
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          Powered by Markdown. Use <span className="font-mono px-1">```code```</span> or @mention users.
        </span>
        <Button onClick={handleSend} size="sm" className="px-4 h-8">
          Send
        </Button>
      </div>
    </div>
  );
}
