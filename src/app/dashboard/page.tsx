import Link from "next/link";
import Header from "../components/Header";
import { requireAppUser } from "../../lib/dal";
import {
  getStreak,
  getTaskFor,
  getUserById,
} from "../../lib/db";
import { todayDateString } from "../../lib/streakLogic";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const me = await requireAppUser();
  const today = todayDateString();
  const streak = await getStreak();
  const myTask = await getTaskFor(me.id, today);
  const partner = me.partnerId ? await getUserById(me.partnerId) : null;
  const partnerTask = partner ? await getTaskFor(partner.id, today) : null;

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-8">
        <section className="w-full max-w-md flex flex-col items-center gap-2 mb-10">
          <p className="text-sm uppercase tracking-wide text-zinc-500">
            Current streak
          </p>
          <p className="text-7xl font-bold tabular-nums">
            {streak.currentStreak}
          </p>
          <p className="text-sm text-zinc-500">
            {streak.lastResetDate
              ? `Broke on ${streak.lastResetDate} — start fresh tomorrow`
              : streak.startDate
              ? `Started ${streak.startDate}`
              : "Start your first day together."}
          </p>
        </section>

        <section className="w-full max-w-md border border-zinc-200 dark:border-zinc-800 rounded p-4 mb-6">
          <h2 className="text-sm uppercase tracking-wide text-zinc-500 mb-3">
            Today ({today})
          </h2>
          <UserRow label="You" name={me.name} task={myTask} />
          {partner ? (
            <UserRow label="Partner" name={partner.name} task={partnerTask} />
          ) : (
            <p className="text-sm text-zinc-500 mt-3">
              Waiting for a partner to sign up. Share the app with one other
              person.
            </p>
          )}
        </section>

        <section className="w-full max-w-md flex flex-col gap-2">
          <Link
            href="/task"
            className="border border-zinc-300 dark:border-zinc-700 rounded px-4 py-3 text-center hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            {myTask
              ? myTask.photoUrl
                ? myTask.status === "approved"
                  ? "Task & photo approved ✓"
                  : "Photo uploaded — waiting for approval"
                : "Upload completion photo"
              : "Submit today's task"}
          </Link>
          <Link
            href="/verification"
            className="border border-zinc-300 dark:border-zinc-700 rounded px-4 py-3 text-center hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            {partnerTask?.photoUrl && partnerTask.status === "pending"
              ? "Verify partner's photo"
              : "Verification (no photo waiting)"}
          </Link>
        </section>
      </main>
    </>
  );
}

function UserRow({
  label,
  name,
  task,
}: {
  label: string;
  name: string;
  task: Awaited<ReturnType<typeof getTaskFor>>;
}) {
  const symbol = !task ? "⏳" : task.status === "approved" ? "✓" : task.status === "rejected" ? "✗" : task.photoUrl ? "📷" : "✓";
  const detail = !task
    ? "no task yet"
    : task.status === "approved"
    ? "approved"
    : task.status === "rejected"
    ? "rejected — resubmit photo"
    : task.photoUrl
    ? "photo pending approval"
    : "task submitted, photo pending";
  return (
    <div className="flex items-center justify-between py-2 border-t first:border-t-0 border-zinc-200 dark:border-zinc-800">
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="font-medium">{name}</p>
        {task ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
            {task.taskText}
          </p>
        ) : null}
      </div>
      <div className="text-right">
        <span className="text-2xl">{symbol}</span>
        <p className="text-xs text-zinc-500">{detail}</p>
      </div>
    </div>
  );
}
