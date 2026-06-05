import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddFriendButton } from "@/components/add-friend-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function AddFriendPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const handle = decodeURIComponent(username).replace(/^@/, "").toLowerCase();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/add-friend/${handle}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", handle)
    .single();

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-5 p-6 text-center">
      {!profile ? (
        <>
          <p className="text-lg font-medium">No user @{handle}</p>
          <Link href="/" className="text-primary">Go home</Link>
        </>
      ) : (
        <>
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary/15 text-xl text-primary">
              {(profile.display_name || profile.username).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xl font-semibold">@{profile.username}</p>
            <p className="text-sm text-muted-foreground">wants to be Hunch friends?</p>
          </div>
          <AddFriendButton username={profile.username} self={profile.id === user.id} />
          <Link href="/" className="text-sm text-muted-foreground">Maybe later</Link>
        </>
      )}
    </main>
  );
}
