import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { UserRound } from "lucide-react";
import { useEffect } from "react";

export const NAV = [
  { to: "/", label: "Beranda" },
  { to: "/anggota", label: "Anggota" },
  { to: "/kegiatan", label: "Kegiatan" },
  { to: "/aspirasi", label: "Aspirasi" },
];

export function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "d MMMM yyyy", { locale: localeId });
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Seed placeholder content once so pages are never empty on first load. */
export function useEnsureData() {
  const ensureData = useMutation(api.seed.ensureData);
  useEffect(() => {
    ensureData().catch(() => {
      /* seeding is best-effort */
    });
  }, [ensureData]);
}

export function AvatarPlaceholder({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-accent text-lg font-semibold text-primary",
        className,
      )}
    >
      {initials(name) || <UserRound className="size-6" />}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <span className="inline-flex items-center rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-muted-foreground">
        {eyebrow}
      </span>
      <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-pretty text-muted-foreground">{description}</p>
    </div>
  );
}

export function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mt-10 rounded-xl border border-dashed border-border bg-card/60 p-10 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
      <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
      {label}
    </div>
  );
}
