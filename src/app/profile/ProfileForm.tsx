"use client";

import { useActionState } from "react";
import { updateNameAction, type ProfileFormState } from "../../lib/actions";
import { Button } from "../../components/ui/button";
import { Input, Label } from "../../components/ui/input";

export default function ProfileForm({
  email,
  initialName,
}: {
  email: string;
  initialName: string;
}) {
  const [state, action, pending] = useActionState<ProfileFormState | null, FormData>(
    updateNameAction,
    null
  );
  const currentName = state?.ok && state.name ? state.name : initialName;

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          disabled
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Display name</Label>
        <Input
          key={currentName}
          id="name"
          name="name"
          type="text"
          required
          maxLength={50}
          defaultValue={currentName}
          placeholder="What should your partner see?"
        />
        <p className="text-[11px] font-mono text-[#a0b8a0]">Up to 50 characters.</p>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>

      {state ? (
        state.ok ? (
          <p className="text-[13px] text-[#3b6e45]">
            Saved. Your partner will see this on their next refresh.
          </p>
        ) : (
          <p className="text-[13px] text-[#993530]">{state.message}</p>
        )
      ) : null}
    </form>
  );
}
