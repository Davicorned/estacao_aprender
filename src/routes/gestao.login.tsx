import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoAsset from "@/assets/logo-estacao-aprender.svg.asset.json";

export const Route = createFileRoute("/gestao/login")({
  component: GestaoLogin,
});

function GestaoLogin() {
  const { user, signIn, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/gestao/dashboard" });
  }, [loading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error: err } = await signIn(email, password);
    setBusy(false);
    if (err) setError(err);
  }

  async function handleReset() {
    if (!email) {
      toast.error("Informe o e-mail no campo acima");
      return;
    }
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/gestao/login",
    });
    if (err) toast.error(err.message);
    else toast.success("Verifique seu e-mail para redefinir a senha");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#FEF3E8] to-white px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <div className="flex justify-center">
          <img src={logoAsset.url} alt="Estação Aprender" className="h-14" />
        </div>
        <p className="mt-4 text-center text-xs font-medium uppercase tracking-wider text-[#D67F43]">
          Sistema de Gestão
        </p>
        <h1 className="mt-1 text-center text-2xl font-semibold text-gray-900">Entrar</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-gradient-to-r from-[#D67F43] to-[#C4682E] text-white hover:opacity-90"
          >
            {busy ? "…" : "Entrar"}
          </Button>
        </form>

        <button
          type="button"
          onClick={handleReset}
          className="mt-4 w-full text-center text-sm text-gray-500 hover:text-[#D67F43]"
        >
          Esqueci minha senha
        </button>
      </div>
    </div>
  );
}