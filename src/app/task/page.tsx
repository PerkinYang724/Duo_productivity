import Header from "../components/Header";
import { requireAppUser } from "../../lib/dal";
import { getTaskFor } from "../../lib/db";
import { todayDateString } from "../../lib/streakLogic";
import {
  submitTaskAction,
  uploadPhotoAction,
} from "../../lib/actions";

export const dynamic = "force-dynamic";

export default async function TaskPage() {
  const me = await requireAppUser();
  const today = todayDateString();
  const task = await getTaskFor(me.id, today);

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-8">
        <section className="w-full max-w-md">
          <h1 className="text-xl font-semibold mb-1">Today&apos;s task</h1>
          <p className="text-sm text-zinc-500 mb-6">{today}</p>

          {!task ? (
            <form action={submitTaskAction} className="flex flex-col gap-3">
              <label htmlFor="taskText" className="text-sm">
                What&apos;s your one big thing today?
              </label>
              <input
                id="taskText"
                name="taskText"
                maxLength={200}
                required
                placeholder="e.g. Ship the auth flow"
                className="border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-transparent"
              />
              <button
                type="submit"
                className="border border-zinc-300 dark:border-zinc-700 rounded px-4 py-2"
              >
                Submit task
              </button>
            </form>
          ) : (
            <>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded p-4 mb-6">
                <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                  Submitted ✓
                </p>
                <p>{task.taskText}</p>
                <p className="text-xs text-zinc-500 mt-2">
                  Status: {task.status}
                </p>
              </div>

              {task.status === "approved" ? (
                <p className="text-sm text-green-700">
                  Your partner approved your photo. Streak in progress.
                </p>
              ) : (
                <form
                  action={uploadPhotoAction}
                  className="flex flex-col gap-3"
                >
                  <input type="hidden" name="taskId" value={task.id} />
                  <label htmlFor="photo" className="text-sm">
                    Upload completion photo
                  </label>
                  <input
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/*"
                    required
                    className="text-sm"
                  />
                  {task.photoUrl ? (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">
                        Current photo:
                      </p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={task.photoUrl}
                        alt="Completion"
                        className="max-w-full rounded border border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                  ) : null}
                  <button
                    type="submit"
                    className="border border-zinc-300 dark:border-zinc-700 rounded px-4 py-2"
                  >
                    {task.photoUrl ? "Replace photo" : "Upload photo"}
                  </button>
                  {task.status === "rejected" ? (
                    <p className="text-sm text-red-600">
                      Partner rejected the previous photo. Submit a new one.
                    </p>
                  ) : null}
                </form>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}
