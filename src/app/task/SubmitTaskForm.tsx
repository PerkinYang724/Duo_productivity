"use client";

import { useActionState } from "react";
import { submitTaskAction } from "../../lib/actions";
import type { ActionResult } from "../../lib/types";
import { Button } from "../../components/ui/button";
import { Input, Label } from "../../components/ui/input";

export default function SubmitTaskForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    submitTaskAction,
    null
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="taskText">What&apos;s your one big thing today?</Label>
        <Input
          id="taskText"
          name="taskText"
          maxLength={200}
          required
          placeholder="e.g. Ship the auth flow"
        />
        <p className="text-[11px] font-mono text-[#a0b8a0]">
          One task. Keep it specific. Up to 200 characters.
        </p>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Commit to today"}
      </Button>

      {state && !state.ok ? (
        <p className="text-[13px] text-[#993530]">{state.message}</p>
      ) : null}
    </form>
  );
}
