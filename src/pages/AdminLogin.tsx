import logo from "@/assets/logo.svg";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/lib/admin-auth";
import { AlertCircle, ArrowLeft, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

export default function AdminLogin() {
  const { isAuthenticated, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/admin", { replace: true });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }
    setSubmitting(true);
    try {
      await signIn(username.trim(), password);
      toast.success("Berhasil masuk sebagai admin.");
      navigate("/admin", { replace: true });
    } catch {
      setError("Username atau password salah.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Kembali ke situs
        </Link>

        <Card className="border-border/70 shadow-lg shadow-primary/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl border border-border/70 bg-card shadow-sm">
              <img src={logo} alt="Logo organisasi" className="size-6" />
            </div>
            <CardTitle className="text-xl">Panel Admin OSIS</CardTitle>
            <CardDescription>
              Masuk untuk mengelola anggota, kegiatan, dan aspirasi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="admin"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={submitting}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Memproses…
                  </>
                ) : (
                  <>
                    <Lock className="size-4" />
                    Masuk
                  </>
                )}
              </Button>
            </form>

            <p className="mt-4 rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
              Kredensial demo: <span className="font-medium">admin</span> /{" "}
              <span className="font-medium">admin123</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
