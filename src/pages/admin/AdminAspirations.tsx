import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAdminAuth } from "@/lib/admin-auth";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Inbox, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Aspiration = {
  _id: Id<"aspirations">;
  _creationTime: number;
  name: string;
  email: string;
  message: string;
};

export default function AdminAspirations() {
  const { token } = useAdminAuth();
  const aspirations = useQuery(
    api.aspirations.list,
    token ? { token } : "skip",
  );
  const removeAspiration = useMutation(api.aspirations.remove);
  const [toDelete, setToDelete] = useState<Aspiration | null>(null);

  async function handleDelete() {
    if (!token || !toDelete) return;
    try {
      await removeAspiration({ token, id: toDelete._id });
      toast.success("Aspirasi dihapus.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus.");
    } finally {
      setToDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Lihat Aspirasi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aspirasi yang dikirim pengunjung melalui ruang aspirasi.
        </p>
      </header>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-0">
          {aspirations === undefined ? (
            <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Memuat…
            </div>
          ) : aspirations.length === 0 ? (
            <div className="flex flex-col items-center p-10 text-center">
              <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </span>
              <p className="font-medium">Belum ada aspirasi</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Aspirasi baru akan muncul di sini.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Pengirim</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Pesan</TableHead>
                  <TableHead className="hidden md:table-cell">Waktu</TableHead>
                  <TableHead className="pr-6 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aspirations.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="pl-6 font-medium align-top">
                      {item.name}
                    </TableCell>
                    <TableCell className="hidden align-top text-muted-foreground sm:table-cell">
                      {item.email}
                    </TableCell>
                    <TableCell className="max-w-sm whitespace-normal align-top">
                      {item.message}
                    </TableCell>
                    <TableCell className="hidden align-top text-muted-foreground md:table-cell">
                      {format(
                        new Date(item._creationTime),
                        "d MMM yyyy, HH:mm",
                        { locale: localeId },
                      )}
                    </TableCell>
                    <TableCell className="pr-6 text-right align-top">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Hapus aspirasi dari ${item.name}`}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setToDelete(item)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(value) => !value && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus aspirasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Aspirasi dari “{toDelete?.name}” akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
