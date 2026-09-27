import { ImagePicker } from "@/components/admin/ImagePicker";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAdminAuth } from "@/lib/admin-auth";
import { uploadImage } from "@/lib/upload";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarDays, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Activity = {
  _id: Id<"activities">;
  title: string;
  description: string;
  date: string;
  photoUrl: string | null;
};

const EMPTY = { title: "", description: "", date: "" };

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "d MMM yyyy", { locale: localeId });
}

export default function AdminActivities() {
  const { token } = useAdminAuth();
  const activities = useQuery(api.activities.list);
  const createActivity = useMutation(api.activities.create);
  const updateActivity = useMutation(api.activities.update);
  const removeActivity = useMutation(api.activities.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Activity | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setPhotoFile(null);
    setOpen(true);
  }

  function openEdit(activity: Activity) {
    setEditing(activity);
    setForm({
      title: activity.title,
      description: activity.description,
      date: activity.date,
    });
    setPhotoFile(null);
    setOpen(true);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    if (!form.title.trim() || !form.date) {
      toast.error("Judul dan tanggal wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      let photoId: Id<"_storage"> | undefined;
      if (photoFile) {
        const url = await generateUploadUrl({ token });
        photoId = (await uploadImage(photoFile, url)) as Id<"_storage">;
      }
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        ...(photoId ? { photoId } : {}),
      };
      if (editing) {
        await updateActivity({ token, id: editing._id, ...payload });
        toast.success("Kegiatan diperbarui.");
      } else {
        await createActivity({ token, ...payload });
        toast.success("Kegiatan baru ditambahkan.");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!token || !toDelete) return;
    try {
      await removeActivity({ token, id: toDelete._id });
      toast.success("Kegiatan dihapus.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus.");
    } finally {
      setToDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Kegiatan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Data ini tampil pada bagian Kegiatan di halaman publik.
          </p>
        </div>
        <Button onClick={openCreate} className="self-start">
          <Plus className="size-4" />
          Tambah kegiatan
        </Button>
      </header>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-0">
          {activities === undefined ? (
            <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Memuat…
            </div>
          ) : activities.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">Belum ada kegiatan</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Klik “Tambah kegiatan” untuk membuat data pertama.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 pl-6">Foto</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="hidden md:table-cell">Deskripsi</TableHead>
                  <TableHead className="pr-6 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity._id}>
                    <TableCell className="pl-6">
                      <div className="size-10 overflow-hidden rounded-lg border border-border/70 bg-muted">
                        {activity.photoUrl ? (
                          <img
                            src={activity.photoUrl}
                            alt={`Foto ${activity.title}`}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <CalendarDays className="size-4" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {activity.title}
                    </TableCell>
                    <TableCell>{formatDate(activity.date)}</TableCell>
                    <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                      {activity.description}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Ubah ${activity.title}`}
                          onClick={() => openEdit(activity)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Hapus ${activity.title}`}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setToDelete(activity)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Ubah kegiatan" : "Tambah kegiatan"}
            </DialogTitle>
            <DialogDescription>
              Lengkapi data kegiatan. Perubahan langsung tampil di halaman publik.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activity-title">Judul</Label>
              <Input
                id="activity-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Nama kegiatan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-date">Tanggal</Label>
              <Input
                id="activity-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-description">Deskripsi</Label>
              <Textarea
                id="activity-description"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Deskripsi singkat kegiatan."
              />
            </div>
            <ImagePicker
              value={photoFile}
              onChange={setPhotoFile}
              currentUrl={editing?.photoUrl}
              label="Foto kegiatan"
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(value) => !value && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kegiatan?</AlertDialogTitle>
            <AlertDialogDescription>
              Kegiatan “{toDelete?.title}” akan dihapus permanen dan hilang dari
              halaman publik.
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
