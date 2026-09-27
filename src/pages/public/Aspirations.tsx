import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "./shared";

export default function Aspirations() {
  const submitAspiration = useMutation(api.aspirations.submit);

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Nama wajib diisi.";
    if (!form.email.trim()) next.email = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Format email tidak valid.";
    if (!form.message.trim()) next.message = "Pesan wajib diisi.";
    return next;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setSent(false);
    try {
      await submitAspiration({
        name: form.name,
        email: form.email,
        message: form.message,
      });
      setForm({ name: "", email: "", message: "" });
      setSent(true);
      toast.success("Aspirasi berhasil dikirim. Terima kasih!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengirim aspirasi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-start">
      <div>
        <PageHeader
          eyebrow="Ruang Aspirasi"
          title="Sampaikan aspirasimu"
          description="Punya ide, kritik, atau saran untuk sekolah? Tulis di sini. Aspirasi akan langsung diterima oleh pengurus OSIS."
        />
        <ul className="mt-8 space-y-4 text-sm">
          {[
            "Identitas pengirim hanya dilihat oleh pengurus.",
            "Aspirasi tersimpan aman dan ditindaklanjuti berkala.",
            "Gunakan bahasa yang sopan dan jelas.",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <Card className="border-border/70 shadow-md">
        <CardContent className="p-6">
          {sent && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <p>
                Terima kasih! Aspirasi kamu sudah terkirim dan akan ditinjau oleh
                pengurus.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="asp-name">Nama</Label>
              <Input
                id="asp-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Nama lengkap"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "asp-name-error" : undefined}
              />
              {errors.name && (
                <p id="asp-name-error" className="text-sm text-destructive">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="asp-email">Email</Label>
              <Input
                id="asp-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="nama@sekolah.sch.id"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "asp-email-error" : undefined}
              />
              {errors.email && (
                <p id="asp-email-error" className="text-sm text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="asp-message">Pesan</Label>
              <Textarea
                id="asp-message"
                rows={5}
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder="Tulis aspirasimu di sini…"
                aria-invalid={!!errors.message}
                aria-describedby={
                  errors.message ? "asp-message-error" : undefined
                }
              />
              {errors.message && (
                <p id="asp-message-error" className="text-sm text-destructive">
                  {errors.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Mengirim…
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Kirim aspirasi
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
