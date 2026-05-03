"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { Pencil } from "lucide-react";
import { editTaskAction } from "../../lib/actions";
import type { ActionResult, DailyTask } from "../../lib/types";
import { Card } from "../../components/ui/card";
import { Eyebrow } from "../../components/ui/eyebrow";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export default function CommittedTaskCard({ task }: { task: DailyTask }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    editTaskAction,
    null
  );

  useEffect(() => {
    if (state?.ok) setEditing(false);
  }, [state]);

  const canEdit = !task.edited && task.status !== "approved";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const text = String(fd.get("taskText") ?? "").trim();
    if (!text) return;
    fd.set("taskId", task.id);
    fd.set("taskText", text);
    startTransition(() => action(fd));
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Eyebrow>Committed</Eyebrow>
        {task.status === "approved" ? (
          <Badge variant="approved">approved</Badge>
        ) : task.status === "rejected" ? (
          <Badge variant="rejected">rejected</Badge>
        ) : task.photoUrl ? (
          <Badge variant="due-today">awaiting verify</Badge>
        ) : (
          <Badge variant="in-progress">in progress</Badge>
        )}
      </div>

      {editing ? (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Input
            name="taskText"
            defaultValue={task.taskText}
            maxLength={200}
            required
            autoFocus
          />
          <p className="text-[12px] text-[#7a9e7e]">
            You can only edit once today.
          </p>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save edit"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditing(false)}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
          {state && !state.ok ? (
            <p className="text-[13px] text-[#993530]">{state.message}</p>
          ) : null}
        </form>
      ) : (
        <>
          <p className="text-[15px] leading-[1.6] text-[#3b5e3b]">
            {task.taskText}
          </p>
          {canEdit ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="self-start inline-flex items-center gap-1.5 text-[13px] font-medium text-[#3b6e45] hover:text-[#2f5836] transition-colors"
            >
              <Pencil size={14} />
              Edit task (1 left)
            </button>
          ) : task.edited && task.status !== "approved" ? (
            <p className="text-[12px] text-[#a0b8a0]">
              Edit used for today.
            </p>
          ) : null}
        </>
      )}
    </Card>
  );
}
