
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  return (
    <div className="max-w-[380px] mx-auto mt-24 flex flex-col gap-7 border bg-card shadow-lg rounded-xl px-7 py-10">
      <div className="flex items-center gap-2 mb-2">
        <LogIn size={22} className="text-primary" />
        <h2 className="text-2xl font-bold">Login</h2>
      </div>
      <form className="flex flex-col space-y-4">
        <input className="bg-input border px-3 py-2 rounded-lg focus:outline-none" placeholder="Email" type="email" autoFocus />
        <input className="bg-input border px-3 py-2 rounded-lg focus:outline-none" placeholder="Password" type="password" />
        <Button type="submit" className="w-full font-semibold">Log In</Button>
      </form>
      <div className="text-muted-foreground text-sm text-center">
        Don&apos;t have an account? <a href="/register" className="text-primary underline hover:text-accent-foreground">Register</a>
      </div>
    </div>
  );
}
