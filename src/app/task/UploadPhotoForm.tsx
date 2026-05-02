"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Camera, RefreshCw } from "lucide-react";
import { uploadPhotoAction } from "../../lib/actions";
import type { ActionResult } from "../../lib/types";
import { Button } from "../../components/ui/button";

export default function UploadPhotoForm({
  taskId,
  currentPhotoUrl,
  taskStatus,
}: {
  taskId: string;
  currentPhotoUrl: string | null;
  taskStatus: "pending" | "approved" | "rejected";
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    uploadPhotoAction,
    null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
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

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="taskId" value={taskId} />

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
        disabled={pending}
        leftIcon={
          previewUrl || !currentPhotoUrl ? (
            <Camera size={16} className="text-[#fffdf8]" />
          ) : (
            <RefreshCw size={16} className="text-[#fffdf8]" />
          )
        }
      >
        {pending
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
