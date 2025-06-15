
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GitHubPullRequestComment } from "./GitHubPullRequestComment";
import { Button } from "@/components/ui/button";

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

interface PullRequest {
  id: string;
  title: string;
  status: "open" | "closed" | "merged" | "draft";
  author: string;
  date: string;
  comments: Comment[];
}

interface PullRequestCardProps {
  pullRequest: PullRequest;
  onAddComment: (prId: string, content: string) => void;
}

const statusMap = {
  open: { text: "Open", color: "green" },
  closed: { text: "Closed", color: "red" },
  merged: { text: "Merged", color: "purple" },
  draft: { text: "Draft", color: "gray" },
};

export function GitHubPullRequestCard({ pullRequest, onAddComment }: PullRequestCardProps) {
  const [commentInput, setCommentInput] = useState("");

  function handleComment() {
    if (!commentInput.trim()) return;
    onAddComment(pullRequest.id, commentInput.trim());
    setCommentInput("");
  }

  const status = statusMap[pullRequest.status];

  return (
    <div className="border rounded-lg bg-card shadow-md mb-6 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h3 className="text-xl font-semibold mb-1">{pullRequest.title}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <span className={`text-xs font-semibold`} style={{ color: status.color }}>
                {status.text}
              </span>
            </Badge>
            <span className="text-muted-foreground text-xs">
              #{pullRequest.id} opened on {pullRequest.date}{" "}
              by {pullRequest.author}
            </span>
          </div>
        </div>
        <Avatar>
          <AvatarFallback>{pullRequest.author[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      <div className="px-6 py-4">
        <div className="mb-3 font-semibold text-sm text-muted-foreground">Comment Thread:</div>
        <div className="mb-2">
          {pullRequest.comments.map((comment) => (
            <GitHubPullRequestComment
              key={comment.id}
              author={comment.author}
              content={comment.content}
              date={comment.date}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            className="w-full rounded border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Add inline comment…"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
          />
          <Button variant="secondary" size="sm" onClick={handleComment}>
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
}
