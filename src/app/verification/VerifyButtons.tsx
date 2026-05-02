"use client";

import { useActionState } from "react";
import { Check, X } from "lucide-react";
import {
  approvePhotoAction,
  rejectPhotoAction,
} from "../../lib/actions";
import type { ActionResult } from "../../lib/types";
import { Button } from "../../components/ui/button";

export default function VerifyButtons({ taskId }: { taskId: string }) {
  const [approveState, approveAction, approvePending] = useActionState<
    ActionResult | null,
    FormData
  >(approvePhotoAction, null);
  const [rejectState, rejectAction, rejectPending] = useActionState<
    ActionResult | null,
    FormData
  >(rejectPhotoAction, null);

  const pending = approvePending || rejectPending;
  const error =
    (approveState && !approveState.ok && approveState.message) ||
    (rejectState && !rejectState.ok && rejectState.message) ||
    null;

  return (
    <div className="flex flex-col gap-3">
      <form action={approveAction}>
        <input type="hidden" name="taskId" value={taskId} />
        <Button
          type="submit"
          disabled={pending}
          className="w-full"
          leftIcon={<Check size={16} className="text-[#fffdf8]" />}
        >
          {approvePending ? "Approving…" : "Approve"}
        </Button>
      </form>
      <form action={rejectAction}>
        <input type="hidden" name="taskId" value={taskId} />
        <Button
          type="submit"
          variant="danger"
          disabled={pending}
          className="w-full"
          leftIcon={<X size={16} className="text-[#e8564a]" />}
        >
          {rejectPending ? "Rejecting…" : "Reject"}
        </Button>
      </form>
      {error ? (
        <p className="text-[13px] text-[#993530]">{error}</p>
      ) : null}
    </div>
  );
}
