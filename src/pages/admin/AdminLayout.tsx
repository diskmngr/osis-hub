import logo from "@/assets/logo.svg";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Navigate, Outlet, useNavigate } from "react-router";
import { toast } from "sonner";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/anggota", label: "Kelola Anggota", icon: Users, end: false },
  { to: "/admin/kegiatan", label: "Kelola Kegiatan", icon: CalendarDays, end: false },
  { to: "/admin/aspirasi", label: "Lihat Aspirasi", icon: Inbox, end: false },
  { to: "/admin/pengaturan", label: "Pengaturan Situs", icon: Settings, end: false },
];

export default function AdminLayout() {
  const { isLoading, isAuthenticated, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/40">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  async function handleSignOut() {
    await signOut();
    toast.success("Kamu telah keluar.");
    navigate("/admin/login", { replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-2 p-4">
      <Link
        to="/admin"
        className="flex items-center gap-3 rounded-lg px-2 py-2"
        onClick={() => setNavOpen(false)}
      >
        <span className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-card shadow-sm">
          <img src={logo} alt="Logo organisasi" className="size-5" />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold">Panel Admin</span>
          <span className="block text-xs text-muted-foreground">Kelola OSIS</span>
        </span>
      </Link>

      <nav className="mt-2 flex flex-1 flex-col gap-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setNavOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-2 flex flex-col gap-1 border-t border-border/70 pt-3">
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ExternalLink className="size-4" />
          Lihat situs publik
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/40 text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border/70 bg-background lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            className="absolute inset-0 cursor-default bg-black/40"
            onClick={() => setNavOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-border/70 bg-background shadow-xl">
            <button
              type="button"
              aria-label="Tutup menu"
              className="absolute right-3 top-4 rounded-md p-1 text-muted-foreground hover:bg-accent"
              onClick={() => setNavOpen(false)}
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur sm:px-6 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            aria-label="Buka menu"
            onClick={() => setNavOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <span className="text-sm font-semibold">Panel Admin</span>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
