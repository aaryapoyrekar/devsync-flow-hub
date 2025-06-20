
import { useRef } from "react";
import { useAuthForm } from "@/hooks/useAuthForm";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function Register() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { loading, error, unconfirmedEmail, signup, resendConfirmation } = useAuthForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameRef.current?.value || "";
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    await signup(name, email, password);
  };

  const handleResend = async () => {
    if (unconfirmedEmail) {
      await resendConfirmation(unconfirmedEmail);
    }
  };

  const registeredSuccessfully = !!unconfirmedEmail;

  return (
    <div className="max-w-[410px] mx-auto mt-20 flex flex-col gap-7 border bg-card shadow-lg rounded-xl px-7 py-10 w-full">
      <div className="flex items-center gap-2 mb-2">
        <UserPlus size={22} className="text-primary" />
        <h2 className="text-2xl font-bold">Register</h2>
      </div>
      {!registeredSuccessfully && (
        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <input
            ref={nameRef}
            className="bg-input border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
            placeholder="Name"
            type="text"
            autoFocus
            disabled={loading}
          />
          <input
            ref={emailRef}
            className="bg-input border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
            placeholder="Email"
            type="email"
            disabled={loading}
          />
          <input
            ref={passwordRef}
            className="bg-input border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
            placeholder="Password"
            type="password"
            disabled={loading}
          />
          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-b-transparent rounded-full" />
                Creating account...
              </span>
            ) : (
              "Register"
            )}
          </Button>
        </form>
      )}

      {registeredSuccessfully && (
        <Alert variant="default" className="mt-2 bg-yellow-100 border-yellow-300">
          <AlertTitle>Confirm your email</AlertTitle>
          <AlertDescription>
            Registration successful! Please check your inbox (<span className="font-mono">{unconfirmedEmail}</span>) for a confirmation email before you can log in.
            <div className="mt-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="font-semibold"
                onClick={handleResend}
                disabled={loading}
              >
                {loading ? "Resending..." : "Resend Confirmation Email"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {error && !registeredSuccessfully && (
        <div className="px-3 py-2 rounded bg-destructive/10 text-destructive text-sm mt-2 border border-destructive/40">
          {error}
        </div>
      )}
      {!registeredSuccessfully && (
        <div className="text-muted-foreground text-sm text-center">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-primary underline hover:text-accent-foreground"
          >
            Login
          </a>
        </div>
      )}
    </div>
  );
}
