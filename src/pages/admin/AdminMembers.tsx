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
import { Loader2, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Member = {
  _id: Id<"members">;
  name: string;
  position: string;
  description: string;
  order: number;
  photoUrl: string | null;
};

const EMPTY = { name: "", position: "", description: "" };

export default function AdminMembers() {
  const { token } = useAdminAuth();
  const members = useQuery(api.members.list);
  const createMember = useMutation(api.members.create);
  const updateMember = useMutation(api.members.update);
  const removeMember = useMutation(api.members.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Member | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setPhotoFile(null);
    setOpen(true);
  }

  function openEdit(member: Member) {
    setEditing(member);
    setForm({
      name: member.name,
      position: member.position,
      description: member.description,
    });
    setPhotoFile(null);
    setOpen(true);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    if (!form.name.trim() || !form.position.trim()) {
      toast.error("Nama dan jabatan wajib diisi.");
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
        name: form.name.trim(),
        position: form.position.trim(),
        description: form.description.trim(),
        ...(photoId ? { photoId } : {}),
      };
      if (editing) {
        await updateMember({ token, id: editing._id, ...payload });
        toast.success("Data anggota diperbarui.");
      } else {
        await createMember({ token, ...payload });
        toast.success("Anggota baru ditambahkan.");
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
      await removeMember({ token, id: toDelete._id });
      toast.success("Anggota dihapus.");
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
          <h1 className="text-2xl font-bold tracking-tight">Kelola Anggota</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Data ini tampil pada bagian Anggota di halaman publik.
          </p>
        </div>
        <Button onClick={openCreate} className="self-start">
          <Plus className="size-4" />
          Tambah anggota
        </Button>
      </header>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-0">
          {members === undefined ? (
            <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Memuat…
            </div>
          ) : members.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">Belum ada anggota</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Klik “Tambah anggota” untuk membuat data pertama.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 pl-6">Foto</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jabatan</TableHead>
                  <TableHead className="hidden md:table-cell">Deskripsi</TableHead>
                  <TableHead className="pr-6 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell className="pl-6">
                      <div className="size-10 overflow-hidden rounded-lg border border-border/70 bg-muted">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={`Foto ${member.name}`}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <UserRound className="size-4" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.position}</TableCell>
                    <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                      {member.description}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Ubah ${member.name}`}
                          onClick={() => openEdit(member)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Hapus ${member.name}`}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setToDelete(member)}
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
              {editing ? "Ubah anggota" : "Tambah anggota"}
            </DialogTitle>
            <DialogDescription>
              Lengkapi data anggota. Perubahan langsung tampil di halaman publik.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member-name">Nama</Label>
              <Input
                id="member-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nama lengkap"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-position">Jabatan</Label>
              <Input
                id="member-position"
                value={form.position}
                onChange={(e) =>
                  setForm((f) => ({ ...f, position: e.target.value }))
                }
                placeholder="Contoh: Ketua OSIS"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-description">Deskripsi</Label>
              <Textarea
                id="member-description"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Deskripsi singkat tugas atau peran."
              />
            </div>
            <ImagePicker
              value={photoFile}
              onChange={setPhotoFile}
              currentUrl={editing?.photoUrl}
              label="Foto anggota"
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
            <AlertDialogTitle>Hapus anggota?</AlertDialogTitle>
            <AlertDialogDescription>
              Data “{toDelete?.name}” akan dihapus permanen dan hilang dari
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
