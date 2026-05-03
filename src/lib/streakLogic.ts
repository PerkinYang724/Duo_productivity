const DAY_BOUNDARY_HOUR_PT = 5;
const TIMEZONE = "America/Los_Angeles";

export function todayDateString(now: Date = new Date()): string {
  const shifted = new Date(
    now.getTime() - DAY_BOUNDARY_HOUR_PT * 60 * 60 * 1000
  );
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(shifted);
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  return `${year}-${month}-${day}`;
}
