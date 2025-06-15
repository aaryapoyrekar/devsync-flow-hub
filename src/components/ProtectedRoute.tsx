
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthUser } from "@/hooks/useAuthUser";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("admin" | "member")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { loading, isAuthenticated, role } = useAuthUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="animate-spin w-6 h-6 border-2 border-primary border-b-transparent rounded-full" />
        <span className="ml-3 text-lg">Checking authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role as any)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-2xl font-semibold text-destructive mb-2">Access denied</div>
        <div className="text-muted-foreground">You do not have permission to view this page.</div>
      </div>
    );
  }

  return <>{children}</>;
}
