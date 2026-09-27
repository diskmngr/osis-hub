import logoDefault from "@/assets/logo.svg";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { ArrowRight, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { NAV, useEnsureData } from "./shared";

export default function PublicLayout() {
  const settings = useQuery(api.siteSettings.get);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEnsureData();

  // Each route is its own page — start at the top on navigation.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const orgName = settings?.orgName ?? "OSIS Nusantara";

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
      isActive
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={`Logo ${orgName}`}
                  className="size-full object-cover"
                />
              ) : (
                <img src={logoDefault} alt="Logo organisasi" className="size-6" />
              )}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">
                {orgName}
              </span>
              <span className="text-xs text-muted-foreground">
                Situs resmi organisasi siswa
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/aspirasi">
                Kirim Aspirasi
                <ArrowRight className="size-4" />
              </Link>
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
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/70 bg-muted/50">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={`Logo ${orgName}`}
                  className="size-9 rounded-lg object-cover"
                />
              ) : (
                <img src={logoDefault} alt="Logo organisasi" className="size-8" />
              )}
              <span className="font-semibold">{orgName}</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              Wadah aspirasi, kreativitas, dan kepemimpinan siswa.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Navigasi</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
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
              © {new Date().getFullYear()} {orgName}. Hak cipta dilindungi.
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
