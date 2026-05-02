import { CircleCheck } from "lucide-react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import RealtimeRefresher from "../components/RealtimeRefresher";
import { requireAppUser } from "../../lib/dal";
import { getTaskFor } from "../../lib/db";
import { todayDateString } from "../../lib/streakLogic";
import { Card } from "../../components/ui/card";
import { Eyebrow } from "../../components/ui/eyebrow";
import { Badge } from "../../components/ui/badge";
import SubmitTaskForm from "./SubmitTaskForm";
import UploadPhotoForm from "./UploadPhotoForm";

export const dynamic = "force-dynamic";

export default async function TaskPage() {
  const me = await requireAppUser();
  const today = todayDateString();
  const task = await getTaskFor(me.id, today);

  return (
    <>
      <Header />
      <RealtimeRefresher />
      <main className="flex flex-1 flex-col items-center px-4 py-6 pb-24">
        <section className="w-full max-w-[720px] flex flex-col gap-6">
          <div>
            <Eyebrow>Today · {today}</Eyebrow>
            <h1 className="mt-1 text-[28px] font-medium text-[#3b6e45]">
              {task ? "Your task" : "Pick today's task"}
            </h1>
          </div>

          {!task ? (
            <Card className="p-6">
              <SubmitTaskForm />
            </Card>
          ) : (
            <>
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
                <p className="text-[15px] leading-[1.6] text-[#3b5e3b]">
                  {task.taskText}
                </p>
              </Card>

              {task.status === "approved" ? (
                <Card className="flex items-start gap-3">
                  <CircleCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-[#5a9e6a]"
                  />
                  <div>
                    <p className="text-[15px] font-medium text-[#3b6e45]">
                      Approved by your partner.
                    </p>
                    <p className="mt-1 text-[13px] text-[#5a7a5a]">
                      Streak in progress. Come back tomorrow.
                    </p>
                  </div>
                </Card>
              ) : (
                <Card className="p-5">
                  <UploadPhotoForm
                    taskId={task.id}
                    currentPhotoUrl={task.photoUrl}
                    taskStatus={task.status}
                  />
                </Card>
              )}
            </>
          )}
        </section>
      </main>
      <BottomNav />
    </>
  );
}
