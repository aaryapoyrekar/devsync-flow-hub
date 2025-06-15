
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface UseAuthFormResult {
  loading: boolean;
  error: string | null;
  unconfirmedEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

export function useAuthForm(): UseAuthFormResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    setUnconfirmedEmail(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      if (
        error.message &&
        (error.message.toLowerCase().includes("email not confirmed") ||
          error.message.toLowerCase().includes("email needs to be confirmed"))
      ) {
        setUnconfirmedEmail(email);
        setError("Your email address is not confirmed. Please check your inbox for a confirmation email.");
      } else {
        setError(error.message);
      }
      return;
    }
    navigate("/dashboard", { replace: true });
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    setUnconfirmedEmail(null);
    // Supabase "meta data" can store the name for now (if you implement profiles later)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });

    // Add role insert after successful signup
    let user_id: string | null = null;
    if (!error && data?.user?.id) {
      user_id = data.user.id;
      // Give every new user the "member" role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert([{ user_id, role: "member" }]);
      // If roleError, inform user but don't block sign up
      if (roleError) {
        setError("Account created but failed to set role: " + roleError.message);
      }
    }

    setLoading(false);

    if (error) {
      if (
        error.message &&
        (error.message.toLowerCase().includes("email not confirmed") ||
          error.message.toLowerCase().includes("email needs to be confirmed"))
      ) {
        setUnconfirmedEmail(email);
        setError("Your email address is not confirmed. Please check your inbox for a confirmation email.");
      } else {
        setError(error.message);
      }
      return;
    }
    // After signup, alert the user to check their email and do not immediately navigate
    setUnconfirmedEmail(email); // Show the check email screen
  };

  const resendConfirmation = async (email: string) => {
    setLoading(true);
    setError(null);
    // Supabase method to resend confirmation (by re-invoking signUp on an existing user)
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setLoading(false);
    if (error) {
      setError("Failed to resend confirmation email: " + error.message);
    }
  };

  return { loading, error, unconfirmedEmail, login, signup, resendConfirmation };
}
