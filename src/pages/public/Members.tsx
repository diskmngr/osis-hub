import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  AvatarPlaceholder,
  EmptyState,
  LoadingState,
  PageHeader,
} from "./shared";

export default function Members() {
  const settings = useQuery(api.siteSettings.get);
  const members = useQuery(api.members.list);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <PageHeader
        eyebrow="Anggota"
        title={`Kenali pengurus ${settings?.orgName ?? "OSIS"}`}
        description="Orang-orang di balik setiap program kerja organisasi."
      />

      {members === undefined ? (
        <LoadingState label="Memuat anggota…" />
      ) : members.length === 0 ? (
        <EmptyState
          title="Belum ada anggota"
          desc="Admin dapat menambahkan anggota melalui panel admin."
        />
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member, index) => (
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
                    <h3 className="font-semibold leading-tight">{member.name}</h3>
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
    </section>
  );
}
