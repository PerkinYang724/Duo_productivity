"use client";

import { useActionState } from "react";
import { updateNameAction, type ProfileFormState } from "../../lib/actions";

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
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="email" className="text-sm">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        value={email}
        disabled
        className="border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-500"
      />

      <label htmlFor="name" className="text-sm mt-2">
        Display name
      </label>
      <input
        key={currentName}
        id="name"
        name="name"
        type="text"
        required
        maxLength={50}
        defaultValue={currentName}
        className="border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-transparent"
      />

      <button
        type="submit"
        disabled={pending}
        className="border border-zinc-300 dark:border-zinc-700 rounded px-4 py-2 mt-2 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>

      {state ? (
        <p
          className={
            state.ok ? "text-sm text-green-700" : "text-sm text-red-600"
          }
        >
          {state.ok ? "Saved ✓ — your partner will see this on their next refresh." : state.message}
        </p>
      ) : null}
    </form>
  );
}
