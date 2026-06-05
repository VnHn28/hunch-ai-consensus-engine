"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CategoryGrid } from "@/components/category-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, LogOut } from "lucide-react";
import { getCategory } from "@/lib/categories";
import type { HomeData } from "@/lib/types";

export function HomeDashboard({ initial }: { initial: HomeData }) {
  const router = useRouter();
  const [home, setHome] = useState<HomeData>(initial);
  const [supabase] = useState(() => createClient());

  const refresh = useCallback(async () => {
    const { data } = await supabase.rpc("get_home");
    if (data) setHome(data as unknown as HomeData);
  }, [supabase]);

  useEffect(() => {
    // RLS scopes realtime delivery to this user's own rows.
    const channel = supabase
      .channel("home")
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "room_invites" }, () => refresh())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, refresh]);

  async function signOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Hunch<span className="text-primary">.</span>
          </h1>
          <p className="text-sm text-muted-foreground">Hey @{home.profile.username}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="relative" onClick={() => router.push("/friends")}>
            <Users className="size-4" />
            Friends
            {home.incoming_requests > 0 && (
              <Badge className="absolute -right-1.5 -top-1.5 size-5 justify-center rounded-full bg-accent p-0 text-accent-foreground">
                {home.incoming_requests}
              </Badge>
            )}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Sign out" onClick={signOut}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold">What are we deciding?</h2>
        <CategoryGrid isPro={home.profile.is_pro} />
      </section>

      {home.invites.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Invited by friends</h2>
          {home.invites.map((inv) => {
            const cat = getCategory(inv.category);
            return (
              <button
                key={inv.code}
                onClick={() => router.push(`/room/${inv.code}`)}
                className="flex items-center justify-between rounded-2xl bg-card p-4 text-left active:scale-[0.98]"
              >
                <span>
                  <span className="font-medium">{inv.question}</span>
                  <span className="block text-xs text-muted-foreground">
                    @{inv.inviter} · {cat?.label ?? inv.category}
                  </span>
                </span>
                <span className="text-sm font-medium text-primary">Join →</span>
              </button>
            );
          })}
        </section>
      )}
    </main>
  );
}
