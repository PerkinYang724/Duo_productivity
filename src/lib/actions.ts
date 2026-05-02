"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAppUser } from "./dal";
import { supabaseServer } from "./supabase-server";
import { uploadPhotoBuffer } from "./storage";
import {
  getTaskById,
  setTaskPhoto,
  setTaskStatus,
  submitDailyTask,
  incrementStreakIfBothApproved,
  resetStreak,
  updateUserName,
} from "./db";
import { todayDateString } from "./streakLogic";
import type { ActionResult } from "./types";

export async function signOutAction(): Promise<void> {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/login");
}

export type ProfileFormState = {
  ok: boolean;
  message: string;
  name?: string;
};

export async function updateNameAction(
  _prev: ProfileFormState | null,
  formData: FormData
): Promise<ProfileFormState> {
  try {
    const user = await requireAppUser();
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { ok: false, message: "Name is required." };
    if (name.length > 50)
      return { ok: false, message: "Name is too long (max 50 chars)." };

    await updateUserName(user.id, name);

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/task");
    revalidatePath("/verification");

    return { ok: true, message: "Saved.", name };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Something went wrong.",
    };
  }
}

function fail(err: unknown): ActionResult {
  return {
    ok: false,
    message: err instanceof Error ? err.message : "Something went wrong.",
  };
}

export async function submitTaskAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAppUser();
    const taskText = String(formData.get("taskText") ?? "").trim();
    if (!taskText) return { ok: false, message: "Task text is required." };
    if (taskText.length > 200)
      return { ok: false, message: "Task is too long (max 200 chars)." };

    await submitDailyTask({ userId: user.id, taskText, date: todayDateString() });
    revalidatePath("/dashboard");
    revalidatePath("/task");
    return { ok: true, message: "Task submitted." };
  } catch (err) {
    return fail(err);
  }
}

export async function uploadPhotoAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAppUser();
    const taskId = String(formData.get("taskId") ?? "");
    const file = formData.get("photo");
    if (!taskId) return { ok: false, message: "Missing task id." };
    if (!(file instanceof File) || file.size === 0)
      return { ok: false, message: "Photo file is required." };

    const task = await getTaskById(taskId);
    if (!task) return { ok: false, message: "Task not found." };
    if (task.userId !== user.id) return { ok: false, message: "Not your task." };

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadPhotoBuffer(buffer, taskId, file.type || "image/jpeg");
    await setTaskPhoto(taskId, url);

    revalidatePath("/dashboard");
    revalidatePath("/task");
    revalidatePath("/verification");
    return { ok: true, message: "Photo uploaded." };
  } catch (err) {
    return fail(err);
  }
}

export async function approvePhotoAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAppUser();
    const taskId = String(formData.get("taskId") ?? "");
    if (!taskId) return { ok: false, message: "Missing task id." };

    const task = await getTaskById(taskId);
    if (!task) return { ok: false, message: "Task not found." };
    if (task.userId === user.id)
      return { ok: false, message: "You cannot approve your own task." };
    if (!task.photoUrl)
      return { ok: false, message: "No photo uploaded yet." };

    await setTaskStatus(taskId, "approved");
    await incrementStreakIfBothApproved(task.date);

    revalidatePath("/dashboard");
    revalidatePath("/verification");
    return { ok: true, message: "Approved." };
  } catch (err) {
    return fail(err);
  }
}

export async function rejectPhotoAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAppUser();
    const taskId = String(formData.get("taskId") ?? "");
    if (!taskId) return { ok: false, message: "Missing task id." };

    const task = await getTaskById(taskId);
    if (!task) return { ok: false, message: "Task not found." };
    if (task.userId === user.id)
      return { ok: false, message: "You cannot reject your own task." };

    await setTaskStatus(taskId, "rejected");
    await resetStreak(task.date);

    revalidatePath("/dashboard");
    revalidatePath("/verification");
    return { ok: true, message: "Rejected." };
  } catch (err) {
    return fail(err);
  }
}
