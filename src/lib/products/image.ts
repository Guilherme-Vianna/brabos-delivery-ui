export const MAX_IMAGE_SIDE = 1600;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function fitWithin(width: number, height: number, max = MAX_IMAGE_SIDE) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export async function resizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const size = fitWithin(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, size.width, size.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode failed"))), "image/webp", 0.85),
  );
}

export function uploadWithProgress(
  url: string,
  method: string,
  headers: Record<string, string>,
  body: Blob,
  onProgress: (ratio: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(method, url);
    for (const [name, value] of Object.entries(headers)) request.setRequestHeader(name, value);
    request.upload.onprogress = (event) => event.lengthComputable && onProgress(event.loaded / event.total);
    request.onload = () => (request.status < 300 ? resolve() : reject(new Error(`upload failed ${request.status}`)));
    request.onerror = () => reject(new Error("network"));
    request.send(body);
  });
}
