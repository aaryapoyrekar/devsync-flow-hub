import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CodeEditor from "./pages/CodeEditor";
import KanbanBoard from "./pages/KanbanBoard";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const NoLayout = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Index (redirect) */}
          <Route path="/" element={<Index />} />
          {/* Auth pages get no sidebar layout */}
          <Route element={<NoLayout><Login /></NoLayout>} path="/login" />
          <Route element={<NoLayout><Register /></NoLayout>} path="/register" />
          {/* Main pages with sidebar layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor"
            element={
              <ProtectedRoute allowedRoles={["admin", "member"]}>
                <MainLayout>
                  <CodeEditor />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/kanban"
            element={
              <ProtectedRoute allowedRoles={["admin", "member"]}>
                <MainLayout>
                  <KanbanBoard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute allowedRoles={["admin", "member"]}>
                <MainLayout>
                  <Chat />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
