 "use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Confirming your invitation…");

  useEffect(() => {
    let active = true;
    async function confirm() {
      const supabase = createClient();
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type") || "invite";
      const next = searchParams.get("next") || "/";
      let error = null;

      if (token_hash) {
        ({ error } = await supabase.auth.verifyOtp({ token_hash, type }));
      } else if (typeof window !== "undefined" && window.location.hash) {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          ({ error } = await supabase.auth.setSession({ access_token, refresh_token }));
        } else {
          error = new Error(params.get("error_description") || "Invitation link is invalid or has expired.");
        }
      } else {
        error = new Error("Invitation token is missing. Ask an administrator to send a new invitation.");
      }

      if (!active) return;
      if (error) {
        setMessage(error.message || "Unable to confirm invitation. Ask an administrator to send a new invitation.");
        return;
      }
      router.replace(next.startsWith("/") && !next.startsWith("//") ? next : "/");
    }
    confirm().catch((e) => { if (active) setMessage(e?.message || "Unable to confirm invitation."); });
    return () => { active = false; };
  }, [router, searchParams]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section style={{ maxWidth: 560, textAlign: "center" }}>
        <h1>Invitation confirmation</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}
