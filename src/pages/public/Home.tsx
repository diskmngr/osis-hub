import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router";

export default function Home() {
  const settings = useQuery(api.siteSettings.get);
  const members = useQuery(api.members.list);
  const activities = useQuery(api.activities.list);

  const orgName = settings?.orgName ?? "OSIS Nusantara";

  return (
    <section className="relative overflow-hidden">
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
            {orgName}
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            {settings?.welcomeText ??
              "Selamat datang di situs resmi organisasi siswa kami."}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/anggota">
                <Users className="size-4" />
                Lihat Anggota
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/aspirasi">
                <Send className="size-4" />
                Ruang Aspirasi
              </Link>
            </Button>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
              <dt className="text-xs font-medium text-muted-foreground">
                Anggota Pengurus
              </dt>
              <dd className="mt-1 text-2xl font-semibold">
                {members === undefined ? "—" : members.length}
              </dd>
            </div>
            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
              <dt className="text-xs font-medium text-muted-foreground">
                Kegiatan
              </dt>
              <dd className="mt-1 text-2xl font-semibold">
                {activities === undefined ? "—" : activities.length}
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
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Quick links into the other pages */}
      <div className="border-t border-border/70">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-12 sm:grid-cols-3 sm:px-6">
          {[
            {
              to: "/anggota",
              icon: Users,
              title: "Anggota",
              desc: "Kenali pengurus dan struktur organisasi.",
            },
            {
              to: "/kegiatan",
              icon: CalendarDays,
              title: "Kegiatan",
              desc: "Agenda dan program kerja terbaru.",
            },
            {
              to: "/aspirasi",
              icon: Send,
              title: "Aspirasi",
              desc: "Sampaikan ide dan masukanmu.",
            },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-start gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </span>
              <div>
                <p className="flex items-center gap-1 font-semibold">
                  {item.title}
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
