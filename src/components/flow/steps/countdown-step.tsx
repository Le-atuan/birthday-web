"use client";

import { GlowOrb } from "@/components/glow-orb";
import { useAppStore } from "@/store/app-store";

// Mock data — replace with the row fetched by /card/[token] once the
// backend and DB (users table) exist.
const MOCK_NAME = "Minh";
const MOCK_DAYS_LEFT = 7;

export function CountdownStep() {
  const next = useAppStore((state) => state.next);

  return (
    <div
      onClick={next}
      className="flex flex-1 flex-col items-center gap-10 pt-16 text-center"
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm text-fg-muted">Còn {MOCK_DAYS_LEFT} ngày nữa</p>
        <h1 className="text-2xl font-semibold">
          sinh nhật của {MOCK_NAME}
        </h1>
      </div>

      {/* Placeholder cake stack — swap for the real layered SVG cake
          asset (7 build-states) later. */}
      <div className="relative flex h-[230px] w-[230px] items-center justify-center">
        <GlowOrb size={230} className="opacity-30" />
        <div className="absolute bottom-6 h-[70px] w-[200px] rounded-2xl bg-night" />
        <div className="absolute bottom-[68px] h-[58px] w-[150px] rounded-2xl bg-night-soft" />
        <GlowOrb size={54} className="absolute bottom-[142px]" />
      </div>

      <div className="w-full">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
          <div className="h-full w-[15%] rounded-full bg-accent" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-fg-muted">
          Mỗi ngày chiếc bánh lại đầy thêm một chút. Nhắc bạn trước 7 ngày,
          1 ngày, và đúng ngày.
        </p>
      </div>
    </div>
  );
}
