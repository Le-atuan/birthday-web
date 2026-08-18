import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAuthServerClient } from "@/lib/supabase/auth-server";
import { CLOUD_BLUE_THEME, parseThemeConfig } from "@/lib/theme-config";
import { ThemeEditor } from "@/components/admin/theme-editor";

export default async function AdminThemePage() {
  await requireAdmin();
  const supabase = await createSupabaseAuthServerClient();
  const { data } = await supabase
    .from("theme_settings")
    .select("active_config, draft_config, version, published_at")
    .eq("id", "global")
    .single();

  return (
    <ThemeEditor
      activeTheme={parseThemeConfig(data?.active_config) ?? CLOUD_BLUE_THEME}
      initialDraft={parseThemeConfig(data?.draft_config) ?? CLOUD_BLUE_THEME}
      version={data?.version ?? 1}
      publishedAt={data?.published_at ?? null}
    />
  );
}
