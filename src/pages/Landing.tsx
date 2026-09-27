import logoDefault from "@/assets/logo.svg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Menu,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

const NAV = [
  { href: "#beranda", label: "Beranda" },
  { href: "#anggota", label: "Anggota" },
  { href: "#kegiatan", label: "Kegiatan" },
  { href: "#aspirasi", label: "Aspirasi" },
];

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "d MMMM yyyy", { locale: localeId });
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function AvatarPlaceholder({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-accent text-lg font-semibold text-primary ${className}`}
    >
      {initials(name) || <UserRound className="size-6" />}
    </div>
  );
}

export default function Landing() {
  const settings = useQuery(api.siteSettings.get);
  const members = useQuery(api.members.list);
  const activities = useQuery(api.activities.list);
  const ensureData = useMutation(api.seed.ensureData);
  const submitAspiration = useMutation(api.aspirations.submit);

  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // Seed placeholder content once so the page is never empty on first load.
  useEffect(() => {
    ensureData().catch(() => {
      /* seeding is best-effort */
    });
  }, [ensureData]);

  const memberList = useMemo(() => members ?? [], [members]);
  const activityList = useMemo(() => activities ?? [], [activities]);

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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#beranda" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={`Logo ${settings.orgName ?? "organisasi"}`}
                  className="size-full object-cover"
                />
              ) : (
                <img
                  src={logoDefault}
                  alt="Logo organisasi"
                  className="size-6"
                />
              )}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">
                {settings?.orgName ?? "OSIS Nusantara"}
              </span>
              <span className="text-xs text-muted-foreground">
                Situs resmi organisasi siswa
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <a href="#aspirasi">
                Kirim Aspirasi
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-border/70 bg-background md:hidden">
            <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-2 sm:px-6">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main>
        {/* Hero */}
        <section
          id="beranda"
          className="relative scroll-mt-20 overflow-hidden"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-primary/10 via-primary/[0.03] to-transparent"
          />
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="secondary"
                className="mb-5 gap-1.5 rounded-full border border-border/70 px-3 py-1 text-xs font-medium"
              >
                <Sparkles className="size-3.5 text-primary" />
                Organisasi Siswa Intra Sekolah
              </Badge>
              <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                {settings?.orgName ?? "OSIS Nusantara"}
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                {settings?.welcomeText ??
                  "Selamat datang di situs resmi organisasi siswa kami."}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <a href="#anggota">
                    <Users className="size-4" />
                    Lihat Anggota
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#aspirasi">
                    <Send className="size-4" />
                    Ruang Aspirasi
                  </a>
                </Button>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Anggota Pengurus
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold">
                    {members === undefined ? "—" : memberList.length}
                  </dd>
                </div>
                <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Kegiatan
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold">
                    {activities === undefined ? "—" : activityList.length}
                  </dd>
                </div>
              </dl>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-lg shadow-primary/5">
                <div className="flex items-center gap-3 border-b border-border/70 pb-4">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Suara Siswa, Aksi Nyata</p>
                    <p className="text-xs text-muted-foreground">
                      Tiga pilar kerja OSIS
                    </p>
                  </div>
                </div>
                <ul className="mt-4 space-y-4">
                  {[
                    {
                      title: "Kepemimpinan",
                      desc: "Membentuk pengurus yang bertanggung jawab dan komunikatif.",
                    },
                    {
                      title: "Kegiatan",
                      desc: "Merancang acara yang seru, inklusif, dan bermanfaat.",
                    },
                    {
                      title: "Aspirasi",
                      desc: "Menyalurkan ide siswa kepada pihak sekolah.",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Members */}
        <section id="anggota" className="scroll-mt-20 border-t border-border/70">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
            <div className="max-w-2xl">
              <Badge variant="outline" className="rounded-full">
                Anggota
              </Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Kenali pengurus {settings?.orgName ?? "OSIS"}
              </h2>
              <p className="mt-3 text-muted-foreground">
                Orang-orang di balik setiap program kerja organisasi.
              </p>
            </div>

            {members === undefined ? (
              <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Memuat anggota…
              </div>
            ) : memberList.length === 0 ? (
              <EmptyState
                title="Belum ada anggota"
                desc="Admin dapat menambahkan anggota melalui panel admin."
              />
            ) : (
              <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {memberList.map((member, index) => (
                  <motion.li
                    key={member._id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: (index % 3) * 0.06 }}
                  >
                    <Card className="group h-full overflow-hidden border-border/70 shadow-sm transition-shadow hover:shadow-md">
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={`Foto ${member.name}`}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <AvatarPlaceholder
                            name={member.name}
                            className="size-full text-2xl"
                          />
                        )}
                      </div>
                      <CardContent className="space-y-2 p-5">
                        <div>
                          <h3 className="font-semibold leading-tight">
                            {member.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="mt-2 rounded-full text-xs font-medium"
                          >
                            {member.position}
                          </Badge>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {member.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Activities */}
        <section
          id="kegiatan"
          className="scroll-mt-20 border-t border-border/70 bg-muted/40"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
            <div className="max-w-2xl">
              <Badge variant="outline" className="rounded-full">
                Kegiatan
              </Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Agenda & program kerja
              </h2>
              <p className="mt-3 text-muted-foreground">
                Ikuti kegiatan terbaru dan mendatang dari organisasi kami.
              </p>
            </div>

            {activities === undefined ? (
              <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Memuat kegiatan…
              </div>
            ) : activityList.length === 0 ? (
              <EmptyState
                title="Belum ada kegiatan"
                desc="Admin dapat menambahkan kegiatan melalui panel admin."
              />
            ) : (
              <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activityList.map((activity, index) => (
                  <motion.li
                    key={activity._id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: (index % 3) * 0.06 }}
                  >
                    <Card className="group flex h-full flex-col overflow-hidden border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md">
                      <div className="aspect-video w-full overflow-hidden">
                        {activity.photoUrl ? (
                          <img
                            src={activity.photoUrl}
                            alt={`Foto kegiatan ${activity.title}`}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div
                            aria-hidden
                            className="flex size-full items-center justify-center bg-gradient-to-br from-accent via-primary/10 to-primary/20 text-primary"
                          >
                            <CalendarDays className="size-8" />
                          </div>
                        )}
                      </div>
                      <CardContent className="flex flex-1 flex-col gap-3 p-5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                          <CalendarDays className="size-3.5" />
                          {formatDate(activity.date)}
                        </span>
                        <h3 className="font-semibold leading-tight">
                          {activity.title}
                        </h3>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {activity.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Aspiration */}
        <section
          id="aspirasi"
          className="scroll-mt-20 border-t border-border/70"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-start">
            <div>
              <Badge variant="outline" className="rounded-full">
                Ruang Aspirasi
              </Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Sampaikan aspirasimu
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                Punya ide, kritik, atau saran untuk sekolah? Tulis di sini.
                Aspirasi akan langsung diterima oleh pengurus OSIS.
              </p>
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
                      Terima kasih! Aspirasi kamu sudah terkirim dan akan
                      ditinjau oleh pengurus.
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
                      aria-describedby={
                        errors.email ? "asp-email-error" : undefined
                      }
                    />
                    {errors.email && (
                      <p
                        id="asp-email-error"
                        className="text-sm text-destructive"
                      >
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
                      <p
                        id="asp-message-error"
                        className="text-sm text-destructive"
                      >
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
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
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/70 bg-muted/50">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={`Logo ${settings.orgName ?? "organisasi"}`}
                  className="size-9 rounded-lg object-cover"
                />
              ) : (
                <img src={logoDefault} alt="Logo organisasi" className="size-8" />
              )}
              <span className="font-semibold">
                {settings?.orgName ?? "OSIS Nusantara"}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              Wadah aspirasi, kreativitas, dan kepemimpinan siswa.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Navigasi</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Kontak</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                Jl. Pendidikan No. 1, Kota Pelajar
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-primary" />
                osis@sekolah.sch.id
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-primary" />
                (021) 1234 5678
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/70">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
            <p>
              © {new Date().getFullYear()} {settings?.orgName ?? "OSIS"}. Hak
              cipta dilindungi.
            </p>
            <Link
              to="/admin/login"
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Login pengurus
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mt-10 rounded-xl border border-dashed border-border bg-card/60 p-10 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
