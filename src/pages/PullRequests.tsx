
import React, { useState } from "react";
import { GitHubPullRequestCard } from "@/components/GitHubPullRequestCard";

// Mock data for demonstration
const MOCK_PRS = [
  {
    id: "42",
    title: "Add feature: Kanban drag-and-drop",
    status: "open" as "open",
    author: "alice",
    date: "2025-06-15",
    comments: [
      {
        id: "c1",
        author: "bob",
        content: "Great work, but can you add tests?",
        date: "2025-06-15 12:00",
      },
    ],
  },
  {
    id: "41",
    title: "Fix bug: incorrect user permissions",
    status: "closed" as "closed",
    author: "carol",
    date: "2025-06-13",
    comments: [
      {
        id: "c2",
        author: "alice",
        content: "Looks good now, thanks!",
        date: "2025-06-13 08:30",
      },
      {
        id: "c3",
        author: "carol",
        content: "Merged 🌟",
        date: "2025-06-13 10:00",
      },
    ],
  },
  {
    id: "40",
    title: "Docs: update README",
    status: "merged" as "merged",
    author: "ben",
    date: "2025-06-10",
    comments: [],
  },
];

export default function PullRequests() {
  const [prs, setPrs] = useState(MOCK_PRS);

  function handleAddComment(prId: string, content: string) {
    setPrs((prs) =>
      prs.map((pr) =>
        pr.id === prId
          ? {
              ...pr,
              comments: [
                ...pr.comments,
                {
                  id: `c${Date.now()}`,
                  author: "current_user",
                  content,
                  date: new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              ],
            }
          : pr
      )
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-10">
      <h1 className="text-3xl font-bold mb-6">Pull Requests</h1>
      <div>
        {prs.length === 0 ? (
          <div className="text-muted-foreground text-center py-12 text-lg">No pull requests found.</div>
        ) : (
          prs.map((pr) => (
            <GitHubPullRequestCard
              key={pr.id}
              pullRequest={pr}
              onAddComment={handleAddComment}
            />
          ))
        )}
      </div>
    </div>
  );
}
