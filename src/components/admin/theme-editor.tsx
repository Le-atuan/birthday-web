"use client";

import { useMemo, useState, useTransition } from "react";
import {
  publishTheme,
  saveThemeDraft,
  type AdminActionResult,
} from "@/app/admin/actions";
import {
  CLOUD_BLUE_THEME,
  contrastRatio,
  themeToStyle,
  type ThemeConfig,
} from "@/lib/theme-config";
import styles from "@/components/admin/admin.module.css";

const COLOR_FIELDS: Array<{ key: keyof ThemeConfig; label: string }> = [
  { key: "primary", label: "Màu chính" },
  { key: "secondary", label: "Màu phụ" },
  { key: "accent", label: "Màu điểm nhấn" },
  { key: "backgroundStart", label: "Nền bắt đầu" },
  { key: "backgroundEnd", label: "Nền kết thúc" },
  { key: "surface", label: "Card / surface" },
  { key: "foreground", label: "Chữ chính" },
  { key: "mutedForeground", label: "Chữ phụ" },
  { key: "border", label: "Đường viền" },
  { key: "danger", label: "Lỗi / cảnh báo" },
];

export function ThemeEditor({
  initialDraft,
  activeTheme,
  version,
  publishedAt,
}: {
  initialDraft: ThemeConfig;
  activeTheme: ThemeConfig;
  version: number;
  publishedAt: string | null;
}) {
  const [theme, setTheme] = useState(initialDraft);
  const [notice, setNotice] = useState<AdminActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const contrast = useMemo(
    () => contrastRatio(theme.foreground, theme.surface),
    [theme],
  );
  const changed = JSON.stringify(theme) !== JSON.stringify(activeTheme);

  function update<K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) {
    setTheme((current) => ({ ...current, [key]: value }));
    setNotice(null);
  }

  function run(action: (value: unknown) => Promise<AdminActionResult>) {
    startTransition(async () => setNotice(await action(theme)));
  }

  return (
    <div className={styles.editorPage}>
      <header className={styles.editorHeader}>
        <div>
          <p className={styles.eyebrow}>Giao diện toàn website</p>
          <h2>Cloud Blue Theme</h2>
          <p>
            Version {version} ·{" "}
            {publishedAt
              ? `Áp dụng ${new Intl.DateTimeFormat("vi-VN").format(new Date(publishedAt))}`
              : "Chưa áp dụng"}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => setTheme(CLOUD_BLUE_THEME)}
            disabled={pending}
          >
            Khôi phục Cloud Blue
          </button>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => run(saveThemeDraft)}
            disabled={pending}
          >
            Lưu bản nháp
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => run(publishTheme)}
            disabled={pending || !changed || contrast < 4.5}
          >
            {pending ? "Đang lưu…" : "Áp dụng theme"}
          </button>
        </div>
      </header>

      {notice && (
        <p
          className={notice.success ? styles.success : styles.error}
          role="status"
        >
          {notice.message}
        </p>
      )}
      <div className={styles.editorGrid}>
        <section className={styles.controls} aria-label="Cấu hình theme">
          <div className={styles.panel}>
            <h3>Màu sắc</h3>
            <div className={styles.colorGrid}>
              {COLOR_FIELDS.map(({ key, label }) => (
                <label className={styles.colorField} key={key}>
                  <span>{label}</span>
                  <div>
                    <input
                      type="color"
                      value={String(theme[key])}
                      onChange={(event) =>
                        update(key, event.target.value as never)
                      }
                    />
                    <code>{String(theme[key])}</code>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.panel}>
            <h3>Background và chiều sâu</h3>
            <RangeField
              label="Hướng gradient"
              value={theme.gradientDirection}
              min={0}
              max={360}
              suffix="°"
              onChange={(value) => update("gradientDirection", value)}
            />
            <RangeField
              label="Bo góc"
              value={theme.radius}
              min={8}
              max={40}
              suffix="px"
              onChange={(value) => update("radius", value)}
            />
            <RangeField
              label="Độ mạnh shadow"
              value={theme.shadowStrength}
              min={0}
              max={50}
              suffix="%"
              onChange={(value) => update("shadowStrength", value)}
            />
            <RangeField
              label="Độ mạnh glow"
              value={theme.glowStrength}
              min={0}
              max={60}
              suffix="%"
              onChange={(value) => update("glowStrength", value)}
            />
            <label className={styles.selectField}>
              <span>Chuyển động</span>
              <select
                value={theme.motion}
                onChange={(event) =>
                  update("motion", event.target.value as ThemeConfig["motion"])
                }
              >
                <option value="off">Tắt</option>
                <option value="subtle">Nhẹ</option>
                <option value="standard">Tiêu chuẩn</option>
              </select>
            </label>
          </div>
          <div
            className={
              contrast >= 4.5 ? styles.contrastPass : styles.contrastFail
            }
          >
            <span>Độ tương phản chữ / card</span>
            <strong>{contrast.toFixed(2)}:1</strong>
            <small>
              {contrast >= 4.5 ? "Đạt WCAG AA" : "Cần đạt tối thiểu 4.5:1"}
            </small>
          </div>
        </section>

        <section className={styles.previewPanel} aria-label="Xem trước theme">
          <div className={styles.previewLabel}>
            <span>Preview mobile</span>
            <span>{changed ? "Bản nháp" : "Đang áp dụng"}</span>
          </div>
          <div className={styles.phonePreview} style={themeToStyle(theme)}>
            <div className={styles.previewClouds} aria-hidden="true" />
            <p className={styles.previewEyebrow}>A little surprise for you</p>
            <div className={styles.previewCard}>
              <span className={styles.previewAccent}>
                Gửi đến một người đặc biệt
              </span>
              <h3>Happy Birthday!</h3>
              <p>
                Chúc bạn tuổi mới luôn rực rỡ, bình an và mỗi ngày đều có một lý
                do để mỉm cười.
              </p>
              <button type="button">Mở điều bất ngờ</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className={styles.rangeField}>
      <span>
        {label}
        <strong>
          {value}
          {suffix}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
