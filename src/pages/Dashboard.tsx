import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Index from "./Index";
import NotFound from "./NotFound";
import Dashboard from "./Dashboard";
import Login from "./Login";
import Register from "./Register";
import CodeEditor from "./CodeEditor";
import KanbanBoard from "./KanbanBoard";
import Chat from "./Chat";
import ProtectedRoute from "../components/ProtectedRoute";

const Dashboard = () => {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome to DevSync</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Collaborate with your team in real time, manage projects, chat, and build amazing software—together.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/editor" className="rounded-xl border bg-card shadow p-6 hover:shadow-lg hover:scale-105 transition transform">
          <div className="font-semibold text-xl mb-2">Code Editor</div>
          <div className="text-muted-foreground">Collaborative coding in the browser</div>
        </a>
        <a href="/kanban" className="rounded-xl border bg-card shadow p-6 hover:shadow-lg hover:scale-105 transition transform">
          <div className="font-semibold text-xl mb-2">Kanban Board</div>
          <div className="text-muted-foreground">Visual project tracking for teams</div>
        </a>
        <a href="/chat" className="rounded-xl border bg-card shadow p-6 hover:shadow-lg hover:scale-105 transition transform">
          <div className="font-semibold text-xl mb-2">Team Chat</div>
          <div className="text-muted-foreground">Communicate in real time</div>
        </a>
        <a href="/pulls" className="rounded-xl border bg-card shadow p-6 hover:shadow-lg hover:scale-105 transition transform">
          <div className="font-semibold text-xl mb-2">Pull Requests</div>
          <div className="text-muted-foreground">Review GitHub PRs, discuss, and comment</div>
        </a>
      </div>
    </div>
  );
};

export default Dashboard;
