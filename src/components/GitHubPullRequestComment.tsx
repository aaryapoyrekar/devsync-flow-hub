
import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface GitHubPullRequestCommentProps {
  author: string;
  content: string;
  date: string;
}

export function GitHubPullRequestComment({
  author,
  content,
  date,
}: GitHubPullRequestCommentProps) {
  return (
    <div className="flex items-start gap-3 mb-2">
      <Avatar>
        <AvatarFallback>{author[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="bg-accent rounded-md px-4 py-2 w-full">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{author}</span>
          <span className="text-muted-foreground text-xs">{date}</span>
        </div>
        <div className="mt-1 text-base">{content}</div>
      </div>
    </div>
  );
}
