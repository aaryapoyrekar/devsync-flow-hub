
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type UserRole = "admin" | "member" | null;

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setRole(null);
      return;
    }
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id)
      .limit(1)
      .single();

    if (error) {
      setRole(null);
    } else {
      setRole(data?.role || null);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        fetchRole(session?.user ?? null);
        setLoading(false);
      }
    );

    // Initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      fetchRole(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  return { user, session, role, loading, isAuthenticated: !!user && !!session };
}
