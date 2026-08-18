import { DateTime } from "luxon";

export const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";

export type BirthdaySchedule = {
  birthdayYear: number;
  unlockAt: DateTime;
  teaserAt: DateTime;
};

export function normalizeTimezone(value?: string | null): string {
  if (!value) return DEFAULT_TIMEZONE;
  const candidate = value.trim();
  if (!candidate) return DEFAULT_TIMEZONE;

  const date = DateTime.now().setZone(candidate);
  return date.isValid ? candidate : DEFAULT_TIMEZONE;
}

function birthdayForYear(dob: DateTime, year: number, timezone: string) {
  const month = dob.month;
  const day =
    dob.month === 2 && dob.day === 29 && !DateTime.local(year).isInLeapYear
      ? 28
      : dob.day;

  return DateTime.fromObject(
    { year, month, day, hour: 0, minute: 0, second: 0, millisecond: 0 },
    { zone: timezone },
  );
}

export function getNextBirthdaySchedule(
  dobIso: string,
  timezoneValue: string,
  now = DateTime.utc(),
): BirthdaySchedule | null {
  const timezone = normalizeTimezone(timezoneValue);
  const dob = DateTime.fromISO(dobIso, { zone: timezone });
  if (!dob.isValid) return null;

  const localNow = now.setZone(timezone);
  let unlockAt = birthdayForYear(dob, localNow.year, timezone);
  if (unlockAt < localNow.startOf("day")) {
    unlockAt = birthdayForYear(dob, localNow.year + 1, timezone);
  }

  return {
    birthdayYear: unlockAt.year,
    unlockAt,
    teaserAt: unlockAt.minus({ days: 2 }).set({ hour: 7 }),
  };
}

export function getReminderDeliveryTime(
  target: DateTime,
  now = DateTime.utc(),
): DateTime | null {
  const targetUtc = target.toUTC();
  const nowUtc = now.toUTC();
  const latestCatchUp = targetUtc.plus({ hours: 26 });
  if (nowUtc > latestCatchUp) return null;
  return targetUtc <= nowUtc ? nowUtc.plus({ minutes: 1 }) : targetUtc;
}
