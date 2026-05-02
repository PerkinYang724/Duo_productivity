import { Eye, CircleCheck, CircleX, Clock } from "lucide-react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import RealtimeRefresher from "../components/RealtimeRefresher";
import { requireAppUser } from "../../lib/dal";
import { getTaskFor, getUserById } from "../../lib/db";
import { todayDateString } from "../../lib/streakLogic";
import { Card } from "../../components/ui/card";
import { Eyebrow } from "../../components/ui/eyebrow";
import { Badge } from "../../components/ui/badge";
import VerifyButtons from "./VerifyButtons";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const me = await requireAppUser();
  const today = todayDateString();
  const partner = me.partnerId ? await getUserById(me.partnerId) : null;
  const partnerTask = partner ? await getTaskFor(partner.id, today) : null;

  return (
    <>
      <Header />
      <RealtimeRefresher />
      <main className="flex flex-1 flex-col items-center px-4 py-6 pb-24">
        <section className="w-full max-w-[720px] flex flex-col gap-6">
          <div>
            <Eyebrow>Today · {today}</Eyebrow>
            <h1 className="mt-1 text-[28px] font-medium text-[#3b6e45]">
              Verify
            </h1>
          </div>

          {!partner ? (
            <EmptyState
              icon={<Eye size={20} className="text-[#7a9e7e]" />}
              title="No partner yet"
              body="Once a partner signs up, you'll verify each other's daily completion photos here."
            />
          ) : !partnerTask ? (
            <EmptyState
              icon={<Clock size={20} className="text-[#7a9e7e]" />}
              title={`Waiting on ${partner.name}`}
              body="They haven't committed to a task today yet."
            />
          ) : !partnerTask.photoUrl ? (
            <EmptyState
              icon={<Clock size={20} className="text-[#7a9e7e]" />}
              title={`${partner.name} is working on it`}
              body="They committed to a task but haven't uploaded a completion photo yet."
            />
          ) : (
            <>
              <Card className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <Eyebrow>{partner.name}&apos;s task</Eyebrow>
                  {partnerTask.status === "approved" ? (
                    <Badge variant="approved">approved</Badge>
                  ) : partnerTask.status === "rejected" ? (
                    <Badge variant="rejected">rejected</Badge>
                  ) : (
                    <Badge variant="due-today">awaiting verify</Badge>
                  )}
                </div>
                <p className="text-[15px] leading-[1.6] text-[#3b5e3b]">
                  {partnerTask.taskText}
                </p>
              </Card>

              <Card className="overflow-hidden p-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={partnerTask.photoUrl}
                  alt="Partner completion"
                  className="w-full"
                />
              </Card>

              {partnerTask.status === "approved" ? (
                <Card className="flex items-start gap-3">
                  <CircleCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-[#5a9e6a]"
                  />
                  <div>
                    <p className="text-[15px] font-medium text-[#3b6e45]">
                      Approved.
                    </p>
                    <p className="mt-1 text-[13px] text-[#5a7a5a]">
                      Streak update applied.
                    </p>
                  </div>
                </Card>
              ) : partnerTask.status === "rejected" ? (
                <Card className="flex items-start gap-3">
                  <CircleX
                    size={20}
                    className="mt-0.5 shrink-0 text-[#e8564a]"
                  />
                  <div>
                    <p className="text-[15px] font-medium text-[#993530]">
                      Rejected.
                    </p>
                    <p className="mt-1 text-[13px] text-[#5a7a5a]">
                      Streak reset for today. They can resubmit a new photo.
                    </p>
                  </div>
                </Card>
              ) : (
                <VerifyButtons taskId={partnerTask.id} />
              )}
            </>
          )}
        </section>
      </main>
      <BottomNav />
    </>
  );
}

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d4e8d4]">
        {icon}
      </span>
      <p className="text-[15px] font-medium text-[#3b5e3b]">{title}</p>
      <p className="max-w-[320px] text-[13px] leading-[1.6] text-[#7a9e7e]">
        {body}
      </p>
    </Card>
  );
}
