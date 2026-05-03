"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { Camera, RefreshCw } from "lucide-react";
import { uploadPhotoAction } from "../../lib/actions";
import type { ActionResult } from "../../lib/types";
import { Button } from "../../components/ui/button";

const MAX_DIM = 1600;
const JPEG_QUALITY = 0.85;

async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const img = await createImageBitmap(file);
    const ratio = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
    const w = Math.round(img.width * ratio);
    const h = Math.round(img.height * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);
    return await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b ?? file),
        "image/jpeg",
        JPEG_QUALITY
      );
    });
  } catch {
    return file;
  }
}

export default function UploadPhotoForm({
  taskId,
  currentPhotoUrl,
  taskStatus,
}: {
  taskId: string;
  currentPhotoUrl: string | null;
  taskStatus: "pending" | "approved" | "rejected";
}) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(uploadPhotoAction, null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const previewRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  useEffect(() => {
    if (state?.ok) {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
      setPreviewUrl(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [state]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    if (file) {
      const url = URL.createObjectURL(file);
      previewRef.current = url;
      setPreviewUrl(url);
      setFileName(file.name);
    } else {
      setPreviewUrl(null);
      setFileName(null);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setCompressing(true);
    let blob: Blob;
    try {
      blob = await compressImage(file);
    } finally {
      setCompressing(false);
    }

    const fd = new FormData();
    fd.set("taskId", taskId);
    fd.set("photo", blob, "photo.jpg");
    startTransition(() => formAction(fd));
  }

  const busy = pending || compressing;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <input
        ref={fileInputRef}
        id="photo"
        name="photo"
        type="file"
        accept="image/*"
        required
        onChange={onFileChange}
        className="sr-only"
      />

      <label
        htmlFor="photo"
        className="flex flex-col items-center justify-center gap-3 cursor-pointer rounded-[14px] border border-dashed border-[#b5d4b5] bg-[#fffdf8] px-6 py-10 hover:border-[#5a9e6a] hover:bg-[#f0f4ee]/40 transition-colors"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d4e8d4]">
          <Camera size={20} className="text-[#3b6e45]" />
        </span>
        <span className="text-[15px] font-medium text-[#3b5e3b] text-center">
          {fileName ?? "Tap to choose a photo"}
        </span>
        <span className="text-[12px] text-[#7a9e7e]">
          {fileName ? "Tap to choose a different photo" : "PNG, JPG, HEIC"}
        </span>
      </label>

      {previewUrl ? (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#7a9e7e]">
            Preview · not yet uploaded
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Selected"
            className="w-full rounded-[10px] border border-[#b5d4b5]"
          />
        </div>
      ) : currentPhotoUrl ? (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#7a9e7e]">
            Current photo
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentPhotoUrl}
            alt="Completion"
            className="w-full rounded-[10px] border border-[#c8ddc8]"
          />
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={busy}
        leftIcon={
          previewUrl || !currentPhotoUrl ? (
            <Camera size={16} className="text-[#fffdf8]" />
          ) : (
            <RefreshCw size={16} className="text-[#fffdf8]" />
          )
        }
      >
        {compressing
          ? "Preparing photo…"
          : pending
          ? "Uploading…"
          : previewUrl
          ? "Upload photo"
          : currentPhotoUrl
          ? "Replace photo"
          : "Upload photo"}
      </Button>

      {taskStatus === "rejected" && (!state || state.ok) ? (
        <p className="text-[13px] text-[#993530]">
          Partner rejected the previous photo. Submit a new one.
        </p>
      ) : null}
      {state && !state.ok ? (
        <p className="text-[13px] text-[#993530]">{state.message}</p>
      ) : null}
    </form>
  );
}
