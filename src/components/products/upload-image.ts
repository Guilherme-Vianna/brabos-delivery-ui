import { requestImageUploadAction } from "@/lib/products/actions";
import { MAX_UPLOAD_BYTES, resizeImage, uploadWithProgress } from "@/lib/products/image";

export async function uploadImage(
  kind: "product" | "logo",
  file: File,
  onProgress: (fraction: number) => void,
): Promise<{ key: string; url: string }> {
  const blob = await resizeImage(file).catch(() => file);
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error("A foto passou de 5 MB mesmo depois de reduzida.");
  const upload = await requestImageUploadAction(kind, blob.type || "image/webp", blob.size);
  if (!upload.ok) throw new Error(upload.error);
  await uploadWithProgress(upload.data.upload_url, upload.data.method, upload.data.headers, blob, onProgress);
  return { key: upload.data.key, url: URL.createObjectURL(blob) };
}

export function uploadErrorMessage(caught: unknown): string {
  return caught instanceof Error && caught.message.length > 20 ? caught.message : "Não foi possível enviar a foto. Tente de novo.";
}
