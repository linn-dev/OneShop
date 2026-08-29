import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 8 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function isAllowedImage(file: File) {
  return Boolean(MIME_TO_EXT[file.type]) && file.size > 0 && file.size <= MAX_BYTES;
}

export async function saveLocalUpload(file: File) {
  if (!MIME_TO_EXT[file.type]) {
    throw new Error("Please upload a JPEG, PNG, WebP, or GIF image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 8MB or smaller.");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = MIME_TO_EXT[file.type];
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return {
    imageUrl: `/uploads/${filename}`,
    absolutePath: path.join(UPLOAD_DIR, filename),
    mimeType: file.type,
    buffer,
  };
}

export function resolvePublicUpload(imageUrl: string) {
  if (!imageUrl.startsWith("/uploads/") || imageUrl.includes("..")) {
    return null;
  }
  const filename = path.basename(imageUrl);
  return path.join(UPLOAD_DIR, filename);
}
