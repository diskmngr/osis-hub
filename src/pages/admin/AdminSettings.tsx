import { ImagePicker } from "@/components/admin/ImagePicker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAdminAuth } from "@/lib/admin-auth";
import { uploadImage } from "@/lib/upload";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminSettings() {
  const { token } = useAdminAuth();
  const settings = useQuery(api.siteSettings.get);
  const updateSettings = useMutation(api.siteSettings.update);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [form, setForm] = useState({ orgName: "", welcomeText: "" });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (settings && !initialized) {
      setForm({ orgName: settings.orgName, welcomeText: settings.welcomeText });
      setInitialized(true);
    }
  }, [settings, initialized]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    if (!form.orgName.trim()) {
      toast.error("Nama organisasi wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      let logoId: Id<"_storage"> | undefined;
      if (logoFile) {
        const url = await generateUploadUrl({ token });
        logoId = (await uploadImage(logoFile, url)) as Id<"_storage">;
      }
      await updateSettings({
        token,
        orgName: form.orgName.trim(),
        welcomeText: form.welcomeText.trim(),
        ...(logoId ? { logoId } : {}),
      });
      setLogoFile(null);
      toast.success("Pengaturan situs disimpan.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan Situs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ubah logo, nama organisasi, dan teks sambutan di halaman depan.
        </p>
      </header>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Identitas & sambutan</CardTitle>
          <CardDescription>
            Perubahan langsung tercermin pada header dan hero halaman publik.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings === undefined ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Memuat…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="org-name">Nama organisasi</Label>
                <Input
                  id="org-name"
                  value={form.orgName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, orgName: e.target.value }))
                  }
                  placeholder="Contoh: OSIS Nusantara"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome-text">Teks sambutan</Label>
                <Textarea
                  id="welcome-text"
                  rows={5}
                  value={form.welcomeText}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, welcomeText: e.target.value }))
                  }
                  placeholder="Tulis sambutan yang tampil di halaman depan."
                />
              </div>

              <ImagePicker
                value={logoFile}
                onChange={setLogoFile}
                currentUrl={settings.logoUrl}
                label="Logo organisasi"
                hint="Jika dikosongkan, logo default akan digunakan."
              />

              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Simpan pengaturan
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
