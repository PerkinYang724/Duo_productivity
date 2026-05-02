"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "./dal";
import { uploadPhotoBuffer } from "./storage";
import {
  getTaskById,
  setTaskPhoto,
  setTaskStatus,
  submitDailyTask,
  incrementStreakIfBothApproved,
  resetStreak,
} from "./db";
import { todayDateString } from "./streakLogic";

export async function submitTaskAction(formData: FormData): Promise<void> {
  const user = await requireAppUser();
  const taskText = String(formData.get("taskText") ?? "").trim();
  if (!taskText) throw new Error("Task text is required.");
  if (taskText.length > 200) throw new Error("Task is too long (max 200 chars).");

  await submitDailyTask({ userId: user.id, taskText, date: todayDateString() });
  revalidatePath("/dashboard");
  revalidatePath("/task");
}

export async function uploadPhotoAction(formData: FormData): Promise<void> {
  const user = await requireAppUser();
  const taskId = String(formData.get("taskId") ?? "");
  const file = formData.get("photo");
  if (!taskId) throw new Error("Missing task id.");
  if (!(file instanceof File) || file.size === 0) throw new Error("Photo file is required.");

  const task = await getTaskById(taskId);
  if (!task) throw new Error("Task not found.");
  if (task.userId !== user.id) throw new Error("Not your task.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadPhotoBuffer(buffer, taskId, file.type || "image/jpeg");
  await setTaskPhoto(taskId, url);

  revalidatePath("/dashboard");
  revalidatePath("/task");
  revalidatePath("/verification");
}

export async function approvePhotoAction(formData: FormData): Promise<void> {
  const user = await requireAppUser();
  const taskId = String(formData.get("taskId") ?? "");
  if (!taskId) throw new Error("Missing task id.");

  const task = await getTaskById(taskId);
  if (!task) throw new Error("Task not found.");
  if (task.userId === user.id) throw new Error("You cannot approve your own task.");
  if (!task.photoUrl) throw new Error("No photo uploaded yet.");

  await setTaskStatus(taskId, "approved");
  await incrementStreakIfBothApproved(task.date);

  revalidatePath("/dashboard");
  revalidatePath("/verification");
}

export async function rejectPhotoAction(formData: FormData): Promise<void> {
  const user = await requireAppUser();
  const taskId = String(formData.get("taskId") ?? "");
  if (!taskId) throw new Error("Missing task id.");

  const task = await getTaskById(taskId);
  if (!task) throw new Error("Task not found.");
  if (task.userId === user.id) throw new Error("You cannot reject your own task.");

  await setTaskStatus(taskId, "rejected");
  await resetStreak(task.date);

  revalidatePath("/dashboard");
  revalidatePath("/verification");
}
