import "server-only";
import { supabase } from "./supabase";
import type { AppUser, DailyTask, StreakDoc, TaskStatus } from "./types";

const STREAK_ID = "shared";

type UserRow = {
  id: string;
  auth_user_id: string;
  email: string;
  name: string;
  partner_id: string | null;
  created_at: string;
};

function rowToUser(r: UserRow): AppUser {
  return {
    id: r.id,
    authUserId: r.auth_user_id,
    email: r.email,
    name: r.name,
    partnerId: r.partner_id,
    createdAt: new Date(r.created_at).getTime(),
  };
}

type TaskRow = {
  id: string;
  user_id: string;
  task_text: string;
  date: string;
  submitted_at: string;
  status: TaskStatus;
  photo_url: string | null;
};

function rowToTask(r: TaskRow): DailyTask {
  return {
    id: r.id,
    userId: r.user_id,
    taskText: r.task_text,
    date: r.date,
    submittedAt: new Date(r.submitted_at).getTime(),
    status: r.status,
    photoUrl: r.photo_url,
  };
}

type StreakRow = {
  id: string;
  current_streak: number;
  start_date: string | null;
  last_reset_date: string | null;
  last_approved_date: string | null;
  user1_id: string | null;
  user2_id: string | null;
  last_updated: string;
};

function rowToStreak(r: StreakRow): StreakDoc {
  return {
    currentStreak: r.current_streak,
    startDate: r.start_date,
    lastResetDate: r.last_reset_date,
    lastApprovedDate: r.last_approved_date,
    user1Id: r.user1_id,
    user2Id: r.user2_id,
    lastUpdated: new Date(r.last_updated).getTime(),
  };
}

export async function getOrCreateUser(args: {
  authUserId: string;
  email: string;
  name: string;
}): Promise<AppUser> {
  const sb = supabase();
  const { data: existing, error: selErr } = await sb
    .from("app_users")
    .select("*")
    .eq("auth_user_id", args.authUserId)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) return rowToUser(existing as UserRow);

  const { data: created, error: insErr } = await sb
    .from("app_users")
    .insert({ auth_user_id: args.authUserId, email: args.email, name: args.name })
    .select()
    .single();
  if (insErr) throw insErr;

  await autoLinkPartner(created.id as string);

  const { data: refreshed, error: refErr } = await sb
    .from("app_users")
    .select("*")
    .eq("id", created.id)
    .single();
  if (refErr) throw refErr;
  return rowToUser(refreshed as UserRow);
}

async function autoLinkPartner(newUserId: string): Promise<void> {
  const sb = supabase();
  const { data: candidates, error } = await sb
    .from("app_users")
    .select("id")
    .is("partner_id", null)
    .neq("id", newUserId)
    .limit(1);
  if (error) throw error;
  if (!candidates || candidates.length === 0) return;
  const partnerId = candidates[0].id as string;

  const { error: e1 } = await sb
    .from("app_users")
    .update({ partner_id: partnerId })
    .eq("id", newUserId);
  if (e1) throw e1;

  const { error: e2 } = await sb
    .from("app_users")
    .update({ partner_id: newUserId })
    .eq("id", partnerId);
  if (e2) throw e2;

  const { error: e3 } = await sb.from("streak").upsert({
    id: STREAK_ID,
    current_streak: 0,
    start_date: null,
    last_reset_date: null,
    last_approved_date: null,
    user1_id: partnerId,
    user2_id: newUserId,
    last_updated: new Date().toISOString(),
  });
  if (e3) throw e3;
}

export async function updateUserName(userId: string, name: string): Promise<void> {
  const sb = supabase();
  const { error } = await sb
    .from("app_users")
    .update({ name })
    .eq("id", userId);
  if (error) throw error;
}

export async function getUserById(userId: string): Promise<AppUser | null> {
  const sb = supabase();
  const { data, error } = await sb
    .from("app_users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToUser(data as UserRow) : null;
}

export async function getTaskFor(
  userId: string,
  date: string
): Promise<DailyTask | null> {
  const sb = supabase();
  const { data, error } = await sb
    .from("daily_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToTask(data as TaskRow) : null;
}

export async function submitDailyTask(args: {
  userId: string;
  taskText: string;
  date: string;
}): Promise<DailyTask> {
  const sb = supabase();
  const { data, error } = await sb
    .from("daily_tasks")
    .insert({
      user_id: args.userId,
      task_text: args.taskText,
      date: args.date,
    })
    .select()
    .single();
  if (error) {
    if ((error as { code?: string }).code === "23505") {
      throw new Error("Task already submitted for today.");
    }
    throw error;
  }
  return rowToTask(data as TaskRow);
}

export async function setTaskPhoto(
  taskId: string,
  photoUrl: string
): Promise<void> {
  const sb = supabase();
  const { error } = await sb
    .from("daily_tasks")
    .update({ photo_url: photoUrl, status: "pending" })
    .eq("id", taskId);
  if (error) throw error;
}

export async function setTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<void> {
  const sb = supabase();
  const { error } = await sb
    .from("daily_tasks")
    .update({ status })
    .eq("id", taskId);
  if (error) throw error;
}

export async function getTaskById(taskId: string): Promise<DailyTask | null> {
  const sb = supabase();
  const { data, error } = await sb
    .from("daily_tasks")
    .select("*")
    .eq("id", taskId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToTask(data as TaskRow) : null;
}

export async function getStreak(): Promise<StreakDoc> {
  const sb = supabase();
  const { data, error } = await sb
    .from("streak")
    .select("*")
    .eq("id", STREAK_ID)
    .maybeSingle();
  if (error) throw error;
  if (data) return rowToStreak(data as StreakRow);

  const { data: created, error: insErr } = await sb
    .from("streak")
    .insert({ id: STREAK_ID })
    .select()
    .single();
  if (insErr) throw insErr;
  return rowToStreak(created as StreakRow);
}

export async function incrementStreakIfBothApproved(
  date: string
): Promise<StreakDoc> {
  const sb = supabase();
  const streak = await getStreak();
  if (!streak.user1Id || !streak.user2Id) return streak;
  if (streak.lastApprovedDate === date) return streak;

  const { data: tasks, error } = await sb
    .from("daily_tasks")
    .select("*")
    .eq("date", date)
    .in("user_id", [streak.user1Id, streak.user2Id]);
  if (error) throw error;
  const rows = (tasks ?? []) as TaskRow[];
  const a = rows.find((t) => t.user_id === streak.user1Id);
  const b = rows.find((t) => t.user_id === streak.user2Id);
  if (!a || !b) return streak;
  if (a.status !== "approved" || b.status !== "approved") return streak;

  const { data: updated, error: upErr } = await sb
    .from("streak")
    .update({
      current_streak: streak.currentStreak + 1,
      start_date: streak.startDate ?? date,
      last_approved_date: date,
      last_updated: new Date().toISOString(),
    })
    .eq("id", STREAK_ID)
    .select()
    .single();
  if (upErr) throw upErr;
  return rowToStreak(updated as StreakRow);
}

export async function resetStreak(date: string): Promise<StreakDoc> {
  const sb = supabase();
  const { data, error } = await sb
    .from("streak")
    .update({
      current_streak: 0,
      start_date: null,
      last_reset_date: date,
      last_updated: new Date().toISOString(),
    })
    .eq("id", STREAK_ID)
    .select()
    .single();
  if (error) throw error;
  return rowToStreak(data as StreakRow);
}
