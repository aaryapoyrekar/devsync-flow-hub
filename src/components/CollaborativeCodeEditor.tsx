
import React, { useCallback, useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { markdown } from "@codemirror/lang-markdown";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const LANGUAGE_OPTIONS = [
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "Markdown", value: "markdown" },
];

const FILE_TEMPLATES: Record<string, string> = {
  javascript: "// Start coding JavaScript!\n",
  python: "# Start coding Python!\n",
  markdown: "# Start writing Markdown!\n",
};

const EXTENSIONS_MAP: Record<string, any> = {
  javascript: javascript(),
  python: python(),
  markdown: markdown(),
};

type CursorInfo = {
  username: string;
  color: string;
  pos: number;
};

function randomColorFromString(str: string) {
  // Dummy color generator for user cursors
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const color = ["#34d399", "#f59e42", "#38bdf8", "#f43f5e", "#c084fc", "#fbbf24", "#64748b"];
  return color[Math.abs(hash) % color.length];
}

export default function CollaborativeCodeEditor() {
  const { user, loading } = useAuthUser();
  const username = user?.user_metadata?.name || user?.email || "Anonymous";
  const roomId = "main-editor"; // In a real app, this could be param
  const [value, setValue] = useState<string>(FILE_TEMPLATES["javascript"]);
  const [language, setLanguage] = useState("javascript");
  const [cursors, setCursors] = useState<Record<string, CursorInfo>>({});
  const editorRef = useRef<any>(null);

  // Setup supabase RE channel for presence+broadcast
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`collab-editor-${roomId}`, {
      config: { presence: { key: user.id } },
    });

    // Send presence info (cursor)
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, CursorInfo[]>;
        let newCursors: Record<string, CursorInfo> = {};
        Object.keys(state).forEach((k) => {
          const info = state[k][0];
          if (info && info.username !== username) newCursors[k] = info;
        });
        setCursors(newCursors);
      })
      .on("broadcast", { event: "code_update" }, (payload) => {
        setValue(payload.payload.code);
      })
      .on("broadcast", { event: "cursor" }, (payload) => {
        const { userId, pos, username: uname, color } = payload.payload;
        setCursors(prev => ({
          ...prev,
          [userId]: { username: uname, color, pos }
        }));
      });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          username,
          color: randomColorFromString(username),
          pos: 0,
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, username, roomId]);

  // Broadcast code updates
  const onChange = useCallback(
    (val: string, viewUpdate?: any) => {
      setValue(val);
      if (!user) return;
      // Only broadcast if local change
      supabase.channel(`collab-editor-${roomId}`).send({
        type: "broadcast",
        event: "code_update",
        payload: { code: val }
      });
    },
    [user, roomId]
  );

  // Broadcast cursor changes
  const onCursor = useCallback(
    (view: any) => {
      if (!user) return;
      const pos = view?.state?.selection?.main?.head;
      supabase.channel(`collab-editor-${roomId}`).send({
        type: "broadcast",
        event: "cursor",
        payload: {
          userId: user.id,
          username,
          color: randomColorFromString(username),
          pos,
        },
      });
    },
    [user, username, roomId]
  );

  // Display foreign cursors in the editor (rudimentary, via overlay)
  const renderCursors = () =>
    Object.entries(cursors).map(([k, info]) => {
      // Hack: show near the top left of editor, this is not perfect - for production, use CodeMirror decorations
      return (
        <div
          key={k}
          className="absolute z-20 px-2 py-1 rounded text-xs font-semibold"
          style={{
            top: 6 + (20 * Object.keys(cursors).indexOf(k)),
            left: 8,
            background: info.color,
            color: "#fff",
            opacity: 0.85,
          }}
        >
          {info.username}
        </div>
      );
    });

  // Handle language switch and reset template
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    setValue(FILE_TEMPLATES[e.target.value]);
    // Broadcast the language & code switch
    supabase.channel(`collab-editor-${roomId}`).send({
      type: "broadcast",
      event: "code_update",
      payload: { code: FILE_TEMPLATES[e.target.value] },
    });
  };

  return (
    <div className="relative bg-card border rounded-lg shadow-lg p-2 min-h-[440px]">
      <div className="flex gap-3 items-center pb-3 px-2">
        <span className="font-semibold flex items-center gap-1">
          <span className="size-4 inline-block rounded bg-primary mr-2" />
          Live Collaboration
        </span>
        <label>
          <span className="text-xs text-muted-foreground mr-1">Language:</span>
          <select
            className="rounded bg-muted py-1 px-2 border ml-1"
            value={language}
            onChange={handleLanguageChange}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs text-muted-foreground ml-3">
          File: <span className="font-mono font-medium">{language === "javascript" ? "main.js" : language === "python" ? "main.py" : "README.md"}</span>
        </span>
      </div>
      <div className="relative">
        {/* Display other users' cursors */}
        {renderCursors()}
        <CodeMirror
          ref={editorRef}
          value={value}
          height="340px"
          theme="dark"
          extensions={[EXTENSIONS_MAP[language]]}
          onChange={(val, viewUpdate) => {
            onChange(val, viewUpdate);
          }}
          basicSetup={{
            tabSize: 2,
          }}
          onUpdate={(viewUpdate) => {
            onCursor(viewUpdate.view);
          }}
          className={cn("rounded border bg-background text-base")}
        />
      </div>
      <div className="flex gap-3 mt-2 px-2 items-end">
        <span className="text-xs text-muted-foreground">Cursors: </span>
        {Object.values(cursors).map((info, idx) => (
          <span
            key={info.username + idx}
            className="inline-block px-2 rounded bg-muted"
            style={{ color: info.color, fontWeight: 600 }}
          >
            {info.username}
          </span>
        ))}
      </div>
    </div>
  );
}
