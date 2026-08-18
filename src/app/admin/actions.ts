"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAuthServerClient } from "@/lib/supabase/auth-server";
import {
  contrastRatio,
  parseThemeConfig,
  type ThemeConfig,
} from "@/lib/theme-config";

export type AdminActionResult = { success: boolean; message: string };

export async function loginAdmin(
  _previous: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password)
    return { success: false, message: "Nhập đầy đủ email và mật khẩu." };

  const supabase = await createSupabaseAuthServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user)
    return { success: false, message: "Email hoặc mật khẩu không đúng." };

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return {
      success: false,
      message: "Tài khoản này không có quyền quản trị.",
    };
  }
  redirect("/admin/theme");
}

export async function logoutAdmin() {
  const supabase = await createSupabaseAuthServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function saveThemeDraft(
  value: unknown,
): Promise<AdminActionResult> {
  const user = await requireAdmin();
  const theme = validateTheme(value);
  if ("message" in theme) return theme;
  const supabase = await createSupabaseAuthServerClient();
  const { error } = await supabase
    .from("theme_settings")
    .update({
      draft_config: theme,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "global");
  return error
    ? { success: false, message: "Không thể lưu bản nháp. Vui lòng thử lại." }
    : { success: true, message: "Đã lưu bản nháp." };
}

export async function publishTheme(value: unknown): Promise<AdminActionResult> {
  const user = await requireAdmin();
  const theme = validateTheme(value);
  if ("message" in theme) return theme;
  const supabase = await createSupabaseAuthServerClient();
  const { data: current } = await supabase
    .from("theme_settings")
    .select("version")
    .eq("id", "global")
    .single();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("theme_settings")
    .update({
      active_config: theme,
      draft_config: theme,
      version: (current?.version ?? 0) + 1,
      updated_by: user.id,
      updated_at: now,
      published_at: now,
    })
    .eq("id", "global");
  if (error)
    return {
      success: false,
      message: "Không thể áp dụng theme. Vui lòng thử lại.",
    };
  revalidatePath("/", "layout");
  return {
    success: true,
    message: "Theme đã được áp dụng lâu dài cho toàn bộ website.",
  };
}

function validateTheme(value: unknown): ThemeConfig | AdminActionResult {
  const theme = parseThemeConfig(value);
  if (!theme)
    return { success: false, message: "Cấu hình theme không hợp lệ." };
  if (contrastRatio(theme.foreground, theme.surface) < 4.5) {
    return {
      success: false,
      message: "Màu chữ và card chưa đạt độ tương phản 4.5:1.",
    };
  }
  if (contrastRatio(theme.foreground, theme.backgroundStart) < 4.5) {
    return {
      success: false,
      message: "Màu chữ và background chưa đạt độ tương phản 4.5:1.",
    };
  }
  return theme;
}
