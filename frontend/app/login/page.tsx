"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

function AuthInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function signUp() {
    const handle = username.trim().toLowerCase();
    if (!USERNAME_RE.test(handle)) {
      return toast.error("Username: 3–20 chars, a–z, 0–9, _");
    }
    if (password.length < 6) return toast.error("Password must be at least 6 characters");

    setLoading(true);
    const supabase = createClient();

    const { data: available } = await supabase.rpc("username_available", { p_username: handle });
    if (available === false) {
      setLoading(false);
      return toast.error("That username is taken");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: handle, display_name: handle } },
    });
    setLoading(false);

    if (error) return toast.error(error.message);
    if (data.session) router.push(next); // email confirmation disabled
    else setCheckEmail(true); // confirmation required
  }

  async function logIn() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    router.push(next);
  }

  if (checkEmail) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-6">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Hunch<span className="text-primary">.</span>
        </h1>
        <div className="rounded-2xl bg-card p-5">
          <p className="font-medium">Confirm your email</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a confirmation link to {email}. Open it, then come back and log in.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-5 p-6">
      <h1 className="font-display text-5xl font-semibold tracking-tight">
        Hunch<span className="text-primary">.</span>
      </h1>

      <Tabs defaultValue="signup">
        <TabsList className="w-full">
          <TabsTrigger className="flex-1" value="signup">Create account</TabsTrigger>
          <TabsTrigger className="flex-1" value="login">Log in</TabsTrigger>
        </TabsList>

        <TabsContent value="signup" className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="su-username">Username</Label>
            <Input id="su-username" autoCapitalize="none" placeholder="ramenfan" value={username}
              onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="su-email">Email</Label>
            <Input id="su-email" type="email" inputMode="email" autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="su-password">Password</Label>
            <Input id="su-password" type="password" autoComplete="new-password" value={password}
              onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button className="mt-1 h-12 text-base" onClick={signUp} disabled={loading || !email || !password || !username}>
            {loading ? "Creating…" : "Create account"}
          </Button>
        </TabsContent>

        <TabsContent value="login" className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="li-email">Email</Label>
            <Input id="li-email" type="email" inputMode="email" autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="li-password">Password</Label>
            <Input id="li-password" type="password" autoComplete="current-password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && logIn()} />
          </div>
          <Button className="mt-1 h-12 text-base" onClick={logIn} disabled={loading || !email || !password}>
            {loading ? "Signing in…" : "Log in"}
          </Button>
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <AuthInner />
    </Suspense>
  );
}
