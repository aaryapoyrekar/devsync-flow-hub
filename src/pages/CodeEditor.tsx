
import { Code } from "lucide-react";
import CollaborativeCodeEditor from "@/components/CollaborativeCodeEditor";

const CodeEditor = () => {
  return (
    <div className="max-w-6xl mx-auto py-4">
      <div className="flex items-center gap-3 mb-6">
        <Code className="text-primary" size={28} />
        <h1 className="text-2xl font-semibold">Collaborative Code Editor</h1>
      </div>
      <CollaborativeCodeEditor />
      <div className="mt-6 text-muted-foreground text-sm text-center">
        <span>
          Multiple users can edit together in real time. Cursors are visible with usernames. <br />
          Use the language selector above to try switching between languages and file types.
        </span>
      </div>
    </div>
  );
};
export default CodeEditor;
