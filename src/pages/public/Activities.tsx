import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import {
  EmptyState,
  LoadingState,
  PageHeader,
  formatDate,
} from "./shared";

export default function Activities() {
  const activities = useQuery(api.activities.list);

  return (
    <section className="border-t border-border/70 bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <PageHeader
          eyebrow="Kegiatan"
          title="Agenda & program kerja"
          description="Ikuti kegiatan terbaru dan mendatang dari organisasi kami."
        />

        {activities === undefined ? (
          <LoadingState label="Memuat kegiatan…" />
        ) : activities.length === 0 ? (
          <EmptyState
            title="Belum ada kegiatan"
            desc="Admin dapat menambahkan kegiatan melalui panel admin."
          />
        ) : (
          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity, index) => (
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
  );
}
