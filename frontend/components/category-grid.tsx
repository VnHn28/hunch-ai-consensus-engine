"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { toast } from "sonner";

export function CategoryGrid({ isPro }: { isPro: boolean }) {
  const router = useRouter();
  const [proOpen, setProOpen] = useState(false);

  function pick(key: string, locked: boolean) {
    if (locked) {
      setProOpen(true);
      return;
    }
    router.push(`/create/${key}`);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((c) => {
          const locked = c.pro && !isPro;
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              onClick={() => pick(c.key, locked)}
              className="relative flex flex-col items-start gap-2 rounded-2xl bg-card p-4 text-left transition active:scale-[0.98]"
            >
              {locked && (
                <Badge className="absolute right-2 top-2 gap-1 bg-primary/15 text-primary" variant="secondary">
                  <Lock className="size-3" /> Pro
                </Badge>
              )}
              <span className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
                <Icon className="size-5" />
              </span>
              <span className="font-semibold leading-tight">{c.label}</span>
              <span className="text-xs text-muted-foreground">{c.sub}</span>
            </button>
          );
        })}
      </div>

      <Dialog open={proOpen} onOpenChange={setProOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock with Hunch Pro</DialogTitle>
            <DialogDescription>
              Travel plans, movie nights, and any group call — coming soon. For now, “Where to eat”
              is free for everyone.
            </DialogDescription>
          </DialogHeader>
          <Button
            className="h-12 text-base"
            onClick={() => {
              setProOpen(false);
              toast("We’ll let you know when Pro is live ✨");
            }}
          >
            Notify me
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
