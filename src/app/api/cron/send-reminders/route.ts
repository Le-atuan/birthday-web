import { NextResponse, type NextRequest } from "next/server";
import { DateTime } from "luxon";
import { BirthdayReminderEmail } from "@/emails/birthday-reminder";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getResendClient } from "@/lib/resend";

const TIMEZONE = "Asia/Ho_Chi_Minh";
const REMINDER_DAYS = [7, 1, 0] as const;
type ReminderDay = (typeof REMINDER_DAYS)[number];

const REMINDER_COLUMN: Record<ReminderDay, string> = {
  7: "reminder_7d_sent_at",
  1: "reminder_1d_sent_at",
  0: "reminder_0d_sent_at",
};

type UserRow = {
  id: string;
  name: string;
  dob: string;
  email: string;
  reminder_7d_sent_at: string | null;
  reminder_1d_sent_at: string | null;
  reminder_0d_sent_at: string | null;
};

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  const resend = getResendClient();
  const { data: users, error } = await supabase
    .from("users")
    .select(
      "id, name, dob, email, reminder_7d_sent_at, reminder_1d_sent_at, reminder_0d_sent_at"
    );

  if (error || !users) {
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 }
    );
  }

  const today = DateTime.now().setZone(TIMEZONE).startOf("day");
  let sentCount = 0;

  for (const user of users as UserRow[]) {
    const dob = DateTime.fromISO(user.dob, { zone: TIMEZONE });
    if (!dob.isValid) continue;

    let nextBirthday = dob.set({ year: today.year }).startOf("day");
    if (nextBirthday < today) {
      nextBirthday = nextBirthday.set({ year: today.year + 1 });
    }

    const daysUntil = Math.round(nextBirthday.diff(today, "days").days);
    const matchedDay = REMINDER_DAYS.find((day) => day === daysUntil);
    if (matchedDay === undefined) continue;

    const column = REMINDER_COLUMN[matchedDay];
    if (user[column as keyof UserRow]) continue;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "",
      to: user.email,
      subject:
        matchedDay === 0
          ? "Chúc mừng sinh nhật!"
          : `Còn ${matchedDay} ngày nữa là sinh nhật của bạn`,
      react: BirthdayReminderEmail({ name: user.name, daysLeft: matchedDay }),
    });

    await supabase
      .from("users")
      .update({ [column]: DateTime.now().toISO() })
      .eq("id", user.id);

    sentCount += 1;
  }

  return NextResponse.json({ success: true, sentCount });
}
