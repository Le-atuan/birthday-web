import { NextResponse, type NextRequest } from "next/server";
import { DateTime } from "luxon";
import { BirthdayDayEmail } from "@/emails/birthday-day";
import { BirthdayTeaserEmail } from "@/emails/birthday-teaser";
import {
  getNextBirthdaySchedule,
  getReminderDeliveryTime,
  normalizeTimezone,
} from "@/lib/birthday-schedule";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getResendClient } from "@/lib/resend";

type ReminderType = "teaser_2d" | "birthday_0d";

type UserRow = {
  id: string;
  name: string;
  dob: string;
  email: string;
  timezone: string | null;
};

type InviteRow = { id: string; token: string };
type ReminderRow = {
  id: string;
  status: "pending" | "scheduled" | "failed";
  created_at: string;
};

function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  return process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:4000";
}

async function ensureInvite(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  userId: string,
  birthdayYear: number,
  unlockAt: string,
): Promise<InviteRow | null> {
  const existing = await supabase
    .from("birthday_invites")
    .select("id, token")
    .eq("user_id", userId)
    .eq("birthday_year", birthdayYear)
    .maybeSingle();
  if (existing.data) return existing.data as InviteRow;
  const created = await supabase
    .from("birthday_invites")
    .insert({
      user_id: userId,
      birthday_year: birthdayYear,
      unlock_at: unlockAt,
    })
    .select("id, token")
    .single();
  if (created.data) return created.data as InviteRow;
  const raced = await supabase
    .from("birthday_invites")
    .select("id, token")
    .eq("user_id", userId)
    .eq("birthday_year", birthdayYear)
    .maybeSingle();
  return (raced.data as InviteRow | null) ?? null;
}

async function claimReminder(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  values: {
    user_id: string;
    invite_id: string;
    birthday_year: number;
    reminder_type: ReminderType;
    scheduled_for: string;
  },
  now: DateTime,
): Promise<ReminderRow | null> {
  const created = await supabase
    .from("birthday_reminders")
    .insert(values)
    .select("id, status, created_at")
    .single();
  if (created.data) return created.data as ReminderRow;
  const existing = await supabase
    .from("birthday_reminders")
    .select("id, status, created_at")
    .eq("user_id", values.user_id)
    .eq("birthday_year", values.birthday_year)
    .eq("reminder_type", values.reminder_type)
    .maybeSingle();
  if (!existing.data || existing.data.status === "scheduled") return null;
  const row = existing.data as ReminderRow;
  if (
    row.status === "pending" &&
    DateTime.fromISO(row.created_at).plus({ minutes: 15 }) > now
  )
    return null;
  return row;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  const resend = getResendClient();
  const { data: users, error } = await supabase
    .from("users")
    .select("id, name, dob, email, timezone");

  if (error || !users) {
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 },
    );
  }

  const now = DateTime.utc();
  const schedulingLimit = now.plus({ days: 30 });
  let scheduledCount = 0;
  let failedCount = 0;

  for (const user of users as UserRow[]) {
    const timezone = normalizeTimezone(user.timezone);
    const schedule = getNextBirthdaySchedule(user.dob, timezone, now);
    if (!schedule) continue;
    const events: Array<{ type: ReminderType; target: DateTime }> = [
      { type: "teaser_2d", target: schedule.teaserAt },
      { type: "birthday_0d", target: schedule.unlockAt },
    ];

    for (const event of events) {
      const deliveryAt = getReminderDeliveryTime(event.target, now);
      if (!deliveryAt || deliveryAt > schedulingLimit) continue;
      const invite = await ensureInvite(
        supabase,
        user.id,
        schedule.birthdayYear,
        schedule.unlockAt.toUTC().toISO()!,
      );
      if (!invite) {
        failedCount += 1;
        continue;
      }
      const reminder = await claimReminder(
        supabase,
        {
          user_id: user.id,
          invite_id: invite.id,
          birthday_year: schedule.birthdayYear,
          reminder_type: event.type,
          scheduled_for: deliveryAt.toISO()!,
        },
        now,
      );
      if (!reminder) continue;

      const inviteUrl = `${getSiteUrl()}/invite/${invite.token}`;
      const isTeaser = event.type === "teaser_2d";
      const { data, error: sendError } = await resend.emails.send(
        {
          from: process.env.RESEND_FROM_EMAIL ?? "",
          to: user.email,
          subject: isTeaser
            ? "Một lá thư đang trên đường đến với bạn ✦"
            : `Chúc mừng sinh nhật, ${user.name}!`,
          react: isTeaser
            ? BirthdayTeaserEmail({ name: user.name, inviteUrl })
            : BirthdayDayEmail({ name: user.name, inviteUrl }),
          scheduledAt: deliveryAt.toISO()!,
        },
        { idempotencyKey: `${event.type}/${user.id}/${schedule.birthdayYear}` },
      );

      if (sendError || !data?.id) {
        failedCount += 1;
        await supabase
          .from("birthday_reminders")
          .update({
            status: "failed",
            last_error: sendError?.message ?? "Unknown Resend error",
            attempt_count: 1,
            updated_at: now.toISO(),
          })
          .eq("id", reminder.id);
        continue;
      }
      await supabase
        .from("birthday_reminders")
        .update({
          status: "scheduled",
          resend_email_id: data.id,
          last_error: null,
          attempt_count: 1,
          updated_at: now.toISO(),
        })
        .eq("id", reminder.id);
      scheduledCount += 1;
    }
  }

  return NextResponse.json({
    success: failedCount === 0,
    scheduledCount,
    failedCount,
  });
}
