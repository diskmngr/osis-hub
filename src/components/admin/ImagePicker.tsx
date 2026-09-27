import { Label } from "@/components/ui/label";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

/**
 * File input with a live preview. Shows the existing image when no new file
 * has been chosen, and lets the admin clear the pending selection.
 */
export function ImagePicker({
  value,
  onChange,
  currentUrl,
  label = "Foto",
  hint = "PNG atau JPG, maksimal beberapa MB.",
}: {
  value: File | null;
  onChange: (file: File | null) => void;
  currentUrl?: string | null;
  label?: string;
  hint?: string;
}) {
  const inputId = useId();
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const shown = preview ?? currentUrl ?? null;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="flex items-center gap-4">
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted">
          {shown ? (
            <img
              src={shown}
              alt="Pratinjau gambar"
              className="size-full object-cover"
            />
          ) : (
            <ImagePlus className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <X className="size-3" />
              Batalkan pilihan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
