"use client";

import { useState } from "react";
import { Copy, Check, UserPlus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Eyebrow } from "../../components/ui/eyebrow";

export default function InviteLink() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function copyLink() {
    setError(null);
    try {
      const url = `${window.location.origin}/login`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy automatically. Long-press the link below to copy.");
    }
  }

  const url =
    typeof window === "undefined" ? "" : `${window.location.origin}/login`;

  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-dashed border-[#b5d4b5] bg-[#fffdf8] p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4e8d4]">
          <UserPlus size={20} className="text-[#3b6e45]" />
        </span>
        <div>
          <Eyebrow>Bring in a partner</Eyebrow>
          <p className="mt-0.5 text-[14px] leading-[1.6] text-[#5a7a5a]">
            Send this link. The next account created will auto-link with you.
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={copyLink}
        leftIcon={
          copied ? (
            <Check size={16} className="text-[#3b6e45]" />
          ) : (
            <Copy size={16} className="text-[#3b6e45]" />
          )
        }
      >
        {copied ? "Copied" : "Copy invite link"}
      </Button>

      {url ? (
        <a
          href={url}
          className="break-all text-[11px] font-mono text-[#a0b8a0] underline-offset-2 hover:underline"
        >
          {url}
        </a>
      ) : null}
      {error ? (
        <p className="text-[13px] text-[#993530]">{error}</p>
      ) : null}
    </div>
  );
}
