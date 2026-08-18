import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";

export default async function AdminLoginPage() {
  if (!hasSupabasePublicEnv()) return <AdminLoginForm configured={false} />;
  if (await getAdminUser()) redirect("/admin/theme");
  return <AdminLoginForm configured />;
}
