/** Uploads an image to a Convex storage URL and returns the new storage id. */
export async function uploadImage(
  file: File,
  uploadUrl: string,
): Promise<string> {
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!response.ok) throw new Error("Upload gambar gagal.");
  const { storageId } = (await response.json()) as { storageId: string };
  return storageId;
}
