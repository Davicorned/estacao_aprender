import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const { user, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: "/admin" });
    }
  }, [loading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    const fn = mode === "login" ? signIn : signUp;
    const { error: err } = await fn(email, password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    if (mode === "signup") {
      setInfo(
        "Conta criada. Se o Supabase exigir confirmação de email, verifique sua caixa de entrada. Depois siga o passo 2 do SUPABASE_SETUP.md para virar admin.",
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#FEF3E8] to-white px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <p className="text-xs font-medium uppercase tracking-wider text-[#D67F43]">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {mode === "login"
            ? "Acesse o painel para editar o site."
            : "Cadastre seu email para depois virar admin."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          {info && (
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{info}</p>
          )}

          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-gradient-to-r from-[#D67F43] to-[#C4682E] text-white hover:opacity-90"
          >
            {busy ? "…" : mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setInfo(null);
          }}
          className="mt-4 w-full text-center text-sm text-gray-500 hover:text-[#D67F43]"
        >
          {mode === "login" ? "Criar conta" : "Já tenho conta — entrar"}
        </button>
      </div>
    </div>
  );
}