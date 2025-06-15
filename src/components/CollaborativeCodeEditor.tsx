
import React, { useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { markdown } from "@codemirror/lang-markdown";
import { useAuthUser } from "@/hooks/useAuthUser";
import { cn } from "@/lib/utils";
// Yjs and provider imports
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { EditorView, keymap, drawSelection, ViewUpdate, Decoration, DecorationSet } from "@codemirror/view";
import { Extension, StateField, StateEffect } from "@codemirror/state";

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

const YWS_URL = "wss://demos.yjs.dev"; // Official public y-websocket for demo/testing; use own for production!
const ROOM = "devsync-collab-editor-demo";

function randomColorFromString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const color = [
    "#34d399", "#f59e42", "#38bdf8", "#f43f5e", "#c084fc", "#fbbf24", "#64748b"
  ];
  return color[Math.abs(hash) % color.length];
}

// Custom extension for showing remote user cursors
function yRemoteCursorExtension(yAwareness: any, selfClientId: number) {
  return EditorView.decorations.compute([EditorView.decorations], (state) => {
    const decos: any[] = [];
    if (yAwareness && yAwareness.getStates) {
      yAwareness.getStates().forEach((aw: any, clientId: number) => {
        if (clientId === selfClientId) return;
        const pos = aw.cursor?.pos;
        const color = aw.user?.color ?? "#888";
        const name = aw.user?.name ?? "User";
        if (typeof pos === "number") {
          decos.push(
            Decoration.widget({
              widget: new CursorWidget(name, color),
              side: 1
            }).range(pos)
          );
        }
      });
    }
    return Decoration.set(decos, true);
  });
}

class CursorWidget extends WidgetType {
  name: string;
  color: string;
  constructor(name: string, color: string) {
    super();
    this.name = name;
    this.color = color;
  }
  toDOM() {
    const el = document.createElement("span");
    el.style.borderLeft = `2px solid ${this.color}`;
    el.style.marginLeft = "1px";
    el.style.height = "1.2em";
    el.style.display = "inline-block";
    el.style.verticalAlign = "middle";
    el.style.background = "rgba(0,0,0,0.10)";
    el.style.position = "relative";
    el.innerHTML = `<span style="position:absolute;top:-1.3em;left:0.2em;background:${this.color};color:#fff;padding:0 4px;border-radius:3px;font-size:0.7em;z-index:32;white-space:nowrap;">${this.name}</span>`;
    return el;
  }
}

export default function CollaborativeCodeEditor() {
  const { user } = useAuthUser();
  const username = user?.user_metadata?.name || user?.email || "Anonymous";
  const [language, setLanguage] = useState("javascript");
  const [localValue, setLocalValue] = useState(FILE_TEMPLATES["javascript"]);
  const [clientId, setClientId] = useState<number| null>(null);
  const editorRef = useRef<any>();
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);
  const awarenessRef = useRef<any>(null);
  // track usernames for cursors/who's online
  const [onlineUsers, setOnlineUsers] = useState<{name: string; color: string}[]>([]);

  // setup Yjs & awareness
  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    const provider = new WebsocketProvider(YWS_URL, `${ROOM}-${language}`, ydoc);
    providerRef.current = provider;
    const ytext = ydoc.getText("codemirror");
    ytextRef.current = ytext;

    // Awareness: for cursors/user info
    const awareness = provider.awareness;
    awarenessRef.current = awareness;
    setClientId(provider.awareness.clientID);
    awareness.setLocalStateField("user", { name: username, color: randomColorFromString(username) });

    // On awareness update, update online users
    const updateAw = () => {
      const states = Array.from(awareness.getStates().values());
      setOnlineUsers(
        states
          .map((s: any) => s.user)
          .filter((u: any) => !!u)
      );
    };
    awareness.on("change", updateAw);
    updateAw();

    // Yjs: When ytext changes, update local value (but avoid immediate echo)
    const observer = () => {
      const curVal = ytext?.toString() ?? "";
      setLocalValue(curVal);
    };
    ytext.observe(observer);

    // Initialize the doc with the language's template if empty
    if (ytext.length === 0) ytext.insert(0, FILE_TEMPLATES[language]);

    return () => {
      ytext.unobserve(observer);
      awareness.off("change", updateAw);
      provider.destroy();
      ydoc.destroy();
    };
    // Only re-run on language switch or user
  }, [language, username]);

  // On local edit, update Yjs text (but avoid echo by using source of truth from Yjs emit)
  const handleCodeChange = (val: string) => {
    if (ytextRef.current) {
      if (ytextRef.current.toString() !== val) {
        // Compute minimal diff
        ytextRef.current.delete(0, ytextRef.current.length);
        ytextRef.current.insert(0, val);
      }
    }
    setLocalValue(val);
  };

  // On cursor movement, update awareness
  const handleUpdate = (viewUpdate: ViewUpdate) => {
    const main = viewUpdate.state.selection.main;
    if (awarenessRef.current) {
      awarenessRef.current.setLocalStateField("cursor", { pos: main.head });
    }
  };

  // handle language switch (clear Yjs data and use new room)
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  // Render current online users (via awareness)
  const renderCursors = () => (
    <div className="flex gap-2 flex-wrap items-center mt-2 px-2">
      <span className="text-xs text-muted-foreground">Online:</span>
      {onlineUsers.map((info, idx) => (
        <span key={info.name + idx} className="inline-block px-2 rounded bg-muted"
          style={{ color: info.color, fontWeight: 600 }}>
          {info.name}
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative bg-card border rounded-lg shadow-lg p-2 min-h-[440px]">
      <div className="flex gap-3 items-center pb-3 px-2">
        <span className="font-semibold flex items-center gap-1">
          <span className="size-4 inline-block rounded bg-primary mr-2" />
          Live Collaboration (Yjs)
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
      <div>
        <CodeMirror
          ref={editorRef}
          value={localValue}
          height="340px"
          theme="dark"
          extensions={[
            EXTENSIONS_MAP[language],
            drawSelection(),
            // @ts-ignore
            clientId !== null && awarenessRef.current ? yRemoteCursorExtension(awarenessRef.current, clientId) : []
          ]}
          basicSetup={{
            tabSize: 2,
          }}
          onChange={handleCodeChange}
          onUpdate={handleUpdate}
          className={cn("rounded border bg-background text-base")}
        />
      </div>
      {renderCursors()}
    </div>
  );
}
