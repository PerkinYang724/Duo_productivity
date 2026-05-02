export type AppUser = {
  id: string;
  authUserId: string;
  email: string;
  name: string;
  partnerId: string | null;
  createdAt: number;
};

export type TaskStatus = "pending" | "approved" | "rejected";

export type DailyTask = {
  id: string;
  userId: string;
  taskText: string;
  date: string;
  submittedAt: number;
  status: TaskStatus;
  photoUrl: string | null;
};

export type StreakDoc = {
  currentStreak: number;
  startDate: string | null;
  lastResetDate: string | null;
  lastApprovedDate: string | null;
  user1Id: string | null;
  user2Id: string | null;
  lastUpdated: number;
};
