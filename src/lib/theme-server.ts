import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase";
import {
  CLOUD_BLUE_THEME,
  parseThemeConfig,
  type ThemeConfig,
} from "@/lib/theme-config";

export async function getActiveTheme(): Promise<ThemeConfig> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("theme_settings")
      .select("active_config")
      .eq("id", "global")
      .single();
    if (error) return CLOUD_BLUE_THEME;
    return parseThemeConfig(data.active_config) ?? CLOUD_BLUE_THEME;
  } catch {
    return CLOUD_BLUE_THEME;
  }
}
