import "server-only";
import { supabase } from "./supabase";

const BUCKET = "completion-photos";

export async function uploadPhotoBuffer(
  buffer: Buffer,
  taskId: string,
  contentType = "image/jpeg"
): Promise<string> {
  const sb = supabase();
  const ext = contentType.split("/")[1] ?? "jpg";
  const path = `${taskId}/${Date.now()}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw error;
  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
