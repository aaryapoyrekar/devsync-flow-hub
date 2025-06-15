
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface UseAuthFormResult {
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
}

export function useAuthForm(): UseAuthFormResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    navigate("/dashboard", { replace: true });
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    // Supabase "meta data" can store the name for now (if you implement profiles later)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    // After signup, either require email confirm or auto-login depending on Supabase settings
    navigate("/dashboard", { replace: true });
  };

  return { loading, error, login, signup };
}
