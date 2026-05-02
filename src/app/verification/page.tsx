import Header from "../components/Header";
import { requireAppUser } from "../../lib/dal";
import { getTaskFor, getUserById } from "../../lib/db";
import { todayDateString } from "../../lib/streakLogic";
import {
  approvePhotoAction,
  rejectPhotoAction,
} from "../../lib/actions";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const me = await requireAppUser();
  const today = todayDateString();
  const partner = me.partnerId ? await getUserById(me.partnerId) : null;
  const partnerTask = partner ? await getTaskFor(partner.id, today) : null;

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-8">
        <section className="w-full max-w-md">
          <h1 className="text-xl font-semibold mb-1">Verify partner&apos;s photo</h1>
          <p className="text-sm text-zinc-500 mb-6">{today}</p>

          {!partner ? (
            <p className="text-sm text-zinc-500">
              No partner linked yet. Ask one other person to sign up.
            </p>
          ) : !partnerTask ? (
            <p className="text-sm text-zinc-500">
              {partner.name} hasn&apos;t submitted today&apos;s task yet.
            </p>
          ) : !partnerTask.photoUrl ? (
            <p className="text-sm text-zinc-500">
              {partner.name} submitted their task but hasn&apos;t uploaded a
              photo yet.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="border border-zinc-200 dark:border-zinc-800 rounded p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                  {partner.name}&apos;s task
                </p>
                <p>{partnerTask.taskText}</p>
                <p className="text-xs text-zinc-500 mt-2">
                  Status: {partnerTask.status}
                </p>
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={partnerTask.photoUrl}
                alt="Partner completion"
                className="w-full rounded border border-zinc-200 dark:border-zinc-800"
              />

              {partnerTask.status === "approved" ? (
                <p className="text-sm text-green-700">
                  ✓ Approved. Streak update applied.
                </p>
              ) : partnerTask.status === "rejected" ? (
                <p className="text-sm text-red-600">
                  Rejected. Streak reset for today. They can resubmit a new
                  photo.
                </p>
              ) : (
                <div className="flex gap-3">
                  <form action={approvePhotoAction} className="flex-1">
                    <input type="hidden" name="taskId" value={partnerTask.id} />
                    <button
                      type="submit"
                      className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-4 py-2"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={rejectPhotoAction} className="flex-1">
                    <input type="hidden" name="taskId" value={partnerTask.id} />
                    <button
                      type="submit"
                      className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-4 py-2"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
