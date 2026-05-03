import Link from "next/link";
import { CircleCheck, Camera, Clock, CircleX, ChevronRight } from "lucide-react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import RealtimeRefresher from "../components/RealtimeRefresher";
import { requireAppUser } from "../../lib/dal";
import {
  getStreak,
  getTaskFor,
  getUserById,
} from "../../lib/db";
import { todayDateString } from "../../lib/streakLogic";
import { Card } from "../../components/ui/card";
import { Eyebrow } from "../../components/ui/eyebrow";
import { Badge } from "../../components/ui/badge";
import InviteLink from "./InviteLink";
import type { DailyTask } from "../../lib/types";

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
      <RealtimeRefresher />
      <main className="flex flex-1 flex-col items-center px-4 py-6 pb-24">
        <section className="w-full max-w-[720px] flex flex-col gap-6">
          <StreakHero streak={streak} />

          <div className="flex flex-col gap-3">
            <Eyebrow>Today · {today}</Eyebrow>
            <Card className="flex flex-col gap-3 p-0">
              <UserRow label="You" name={me.name} task={myTask} />
              {partner ? (
                <>
                  <div className="h-px bg-[#d4e8d4] mx-4" />
                  <UserRow
                    label="Partner"
                    name={partner.name}
                    task={partnerTask}
                  />
                </>
              ) : null}
            </Card>
            {!partner ? <InviteLink /> : null}
          </div>

          <NextActions
            myTask={myTask}
            partnerTask={partnerTask}
            hasPartner={!!partner}
          />
        </section>
      </main>
      <BottomNav />
    </>
  );
}

function StreakHero({
  streak,
}: {
  streak: Awaited<ReturnType<typeof getStreak>>;
}) {
  const subtitle = streak.lastResetDate
    ? `Last broke on ${streak.lastResetDate}. Start fresh today.`
    : streak.startDate
    ? `Going strong since ${streak.startDate}.`
    : "Start your first day together.";

  return (
    <Card className="flex flex-col items-center gap-2 py-8">
      <Eyebrow>Shared streak</Eyebrow>
      <p className="text-[64px] font-medium leading-none text-[#c4a96a] tabular-nums">
        {streak.currentStreak}
      </p>
      <p className="text-[14px] text-[#5a7a5a]">
        {streak.currentStreak === 1 ? "day" : "days"}
      </p>
      <p className="mt-2 max-w-[320px] text-center text-[13px] text-[#7a9e7e]">
        {subtitle}
      </p>
    </Card>
  );
}

function UserRow({
  label,
  name,
  task,
}: {
  label: string;
  name: string;
  task: DailyTask | null;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center">
        <StatusIcon task={task} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Eyebrow>{label}</Eyebrow>
          <StatusBadge task={task} />
        </div>
        <p className="mt-0.5 text-[15px] font-medium text-[#3b5e3b]">{name}</p>
        {task ? (
          <p className="mt-1 text-[13px] text-[#5a7a5a] leading-[1.6]">
            {task.taskText}
          </p>
        ) : (
          <p className="mt-1 text-[13px] text-[#a0b8a0]">No task yet today.</p>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ task }: { task: DailyTask | null }) {
  if (!task) return <Clock size={20} className="text-[#a0b8a0]" />;
  if (task.status === "approved")
    return <CircleCheck size={20} className="text-[#5a9e6a]" />;
  if (task.status === "rejected")
    return <CircleX size={20} className="text-[#e8564a]" />;
  if (task.photoUrl) return <Camera size={20} className="text-[#c4a96a]" />;
  return <Clock size={20} className="text-[#7a9e7e]" />;
}

function StatusBadge({ task }: { task: DailyTask | null }) {
  if (!task) return null;
  if (task.status === "approved")
    return <Badge variant="approved">approved</Badge>;
  if (task.status === "rejected")
    return <Badge variant="rejected">rejected</Badge>;
  if (task.photoUrl) return <Badge variant="due-today">awaiting verify</Badge>;
  return <Badge variant="in-progress">in progress</Badge>;
}

function NextActions({
  myTask,
  partnerTask,
  hasPartner,
}: {
  myTask: DailyTask | null;
  partnerTask: DailyTask | null;
  hasPartner: boolean;
}) {
  const showVerify =
    hasPartner &&
    !!partnerTask?.photoUrl &&
    partnerTask.status === "pending";
  const myActionHref = "/task";
  const myActionLabel = !myTask
    ? "Submit today's task"
    : myTask.status === "approved"
    ? "Today's task approved"
    : myTask.photoUrl
    ? "Photo waiting on partner"
    : "Upload completion photo";

  return (
    <div className="flex flex-col gap-3">
      <Eyebrow>What now</Eyebrow>
      <ActionRow href={myActionHref} label={myActionLabel} />
      {showVerify ? (
        <ActionRow
          href="/verification"
          label="Verify your partner's photo"
          accent
        />
      ) : null}
    </div>
  );
}

function ActionRow({
  href,
  label,
  accent,
}: {
  href: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-[14px] border border-[#c8ddc8] bg-[#fffdf8] px-4 py-4 hover:bg-[#f0f4ee] active:scale-[0.99] transition-colors"
    >
      <span
        className={
          accent
            ? "text-[15px] font-medium text-[#3b6e45]"
            : "text-[15px] font-medium text-[#3b5e3b]"
        }
      >
        {label}
      </span>
      <ChevronRight
        size={20}
        className="text-[#7a9e7e] group-hover:text-[#3b6e45] transition-colors"
      />
    </Link>
  );
}
