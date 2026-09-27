import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useAdminAuth } from "@/lib/admin-auth";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  CalendarDays,
  Inbox,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { Link } from "react-router";

const LINKS = [
  {
    to: "/admin/anggota",
    label: "Kelola Anggota",
    desc: "Tambah, ubah, atau hapus data pengurus OSIS.",
    icon: Users,
  },
  {
    to: "/admin/kegiatan",
    label: "Kelola Kegiatan",
    desc: "Atur agenda dan program kerja organisasi.",
    icon: CalendarDays,
  },
  {
    to: "/admin/aspirasi",
    label: "Lihat Aspirasi",
    desc: "Baca aspirasi yang dikirim pengunjung.",
    icon: Inbox,
  },
  {
    to: "/admin/pengaturan",
    label: "Pengaturan Situs",
    desc: "Ubah logo, nama organisasi, dan teks sambutan.",
    icon: Settings,
  },
];

export default function AdminDashboard() {
  const { token } = useAdminAuth();
  const members = useQuery(api.members.list);
  const activities = useQuery(api.activities.list);
  const aspirations = useQuery(
    api.aspirations.list,
    token ? { token } : "skip",
  );

  const stats = [
    { label: "Anggota", value: members?.length, icon: Users },
    { label: "Kegiatan", value: activities?.length, icon: CalendarDays },
    { label: "Aspirasi", value: aspirations?.length, icon: Inbox },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <LayoutDashboard className="size-4" />
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Selamat datang kembali, Admin
        </h1>
        <p className="mt-2 text-muted-foreground">
          Kelola seluruh konten situs OSIS dari satu tempat. Perubahan langsung
          tampil di halaman publik.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/70 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <stat.icon className="size-5" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold">
                  {stat.value === undefined ? "—" : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="group">
            <Card className="h-full border-border/70 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader>
                <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <link.icon className="size-5" />
                </span>
                <CardTitle className="flex items-center gap-2 text-base">
                  {link.label}
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {link.desc}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
