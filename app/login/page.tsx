"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ADMIN_PASS_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_ADMIN_PASS && process.env.NEXT_PUBLIC_ADMIN_PASS.length > 0
);

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = useMemo(() => searchParams.get("redirect") ?? "/dashboard", [searchParams]);
  const [adminPass, setAdminPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGoogleSignIn = () => {
    void signIn("google", { callbackUrl: redirectTo });
  };

  const handleAdminUnlock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!adminPass.trim()) {
      setError("Lütfen admin parolasını gir.");
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/admin/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pass: adminPass.trim() })
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          const message =
            payload?.error === "invalid_pass"
              ? "Parola hatalı. Tekrar dene."
              : payload?.error === "not_configured"
                ? "Admin parolası yapılandırılmamış. Lütfen geliştiricin ile iletişime geç."
                : "Giriş başarısız oldu. Daha sonra tekrar dene.";
          setError(message);
          return;
        }

        window.location.href = redirectTo ?? "/admin";
      } catch (err) {
        console.error(err);
        setError("Beklenmeyen bir hata oluştu. Lütfen tekrar dene.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-transparent">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4">
        <div className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-lg space-y-6">
          <header className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-[var(--ink-1)]">Sign in to Dewrk</h1>
            <p className="text-sm text-[var(--ink-3)]">
              Google hesabınla saniyeler içinde giriş yap, yeni testnet görevlerini takip et.
            </p>
          </header>

          <Button
            onClick={handleGoogleSignIn}
            className="h-11 w-full rounded-xl bg-white text-[var(--ink-1)] shadow-sm ring-1 ring-inset ring-black/10 transition hover:bg-white/90"
          >
            Continue with Google
          </Button>

          {ADMIN_PASS_ENABLED && (
            <div className="space-y-3 pt-4">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-3)]">
                  Admin erişimi
                </p>
                <p className="mt-1 text-[11px] text-[var(--ink-3)]">
                  Parolayı girerek yönetim panelini kilitten çıkarabilirsin.
                </p>
              </div>
              <form className="space-y-3" onSubmit={handleAdminUnlock}>
                <Input
                  type="password"
                  placeholder="Admin passphrase"
                  value={adminPass}
                  onChange={(event) => setAdminPass(event.target.value)}
                  disabled={isPending}
                  autoComplete="current-password"
                />
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-xl bg-[var(--mint)] text-white transition hover:bg-[var(--aqua)]"
                >
                  {isPending ? "Unlocking…" : "Unlock admin"}
                </Button>
              </form>
              {error && <p className="text-center text-xs text-red-600">{error}</p>}
            </div>
          )}

          <p className="text-center text-xs text-[var(--ink-3)]">
            Farklı bir sağlayıcı istiyorsan bize{" "}
            <Link href="mailto:team@dewrk.com" className="font-medium text-[var(--mint)] hover:underline">
              team@dewrk.com
            </Link>{" "}
            üzerinden yaz.
          </p>
        </div>
      </div>
    </div>
  );
}
