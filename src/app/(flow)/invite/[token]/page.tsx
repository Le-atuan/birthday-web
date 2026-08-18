import { notFound } from "next/navigation";
import { BirthdayWaitingPage } from "@/components/birthday-waiting-page";
import { VanillaBirthdayExperience } from "@/components/vanilla-birthday-experience";
import { normalizeTimezone } from "@/lib/birthday-schedule";
import { createSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type InviteRow = { user_id: string; unlock_at: string };
type UserRow = {
  name: string;
  dob: string;
  timezone: string | null;
  destination_latitude: number | null;
  destination_longitude: number | null;
};

function isInviteLocked(unlockAt: string) {
  return Date.now() < new Date(unlockAt).getTime();
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createSupabaseServerClient();
  const inviteResult = await supabase
    .from("birthday_invites")
    .select("user_id, unlock_at")
    .eq("token", token)
    .maybeSingle();
  if (!inviteResult.data) notFound();
  const invite = inviteResult.data as InviteRow;
  const userResult = await supabase
    .from("users")
    .select("name, dob, timezone, destination_latitude, destination_longitude")
    .eq("id", invite.user_id)
    .maybeSingle();
  if (!userResult.data) notFound();
  const user = userResult.data as UserRow;
  const timezone = normalizeTimezone(user.timezone);

  if (isInviteLocked(invite.unlock_at)) {
    return (
      <BirthdayWaitingPage
        name={user.name}
        unlockAt={invite.unlock_at}
        timezone={timezone}
      />
    );
  }

  return (
    <VanillaBirthdayExperience
      initialGuest={{
        fullName: user.name,
        birthDate: user.dob,
        fromPlace: "Hà Nội, Việt Nam",
        toPlace:
          user.destination_latitude !== null &&
          user.destination_longitude !== null
            ? "Nơi bạn đang ở"
            : "Nhật Bản",
      }}
    />
  );
}
