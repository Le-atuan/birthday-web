"use client";

import { useEffect, useState } from "react";
import { JourneyMap } from "@/components/flow/journey-map";
import { useAppStore } from "@/store/app-store";

const JOURNEY_DURATION_MS = 6200;
const APPROACH_DELAY_MS = 3900;

export function JourneyStep() {
  const next = useAppStore((state) => state.next);
  const lat = useAppStore((state) => state.lat);
  const lng = useAppStore((state) => state.lng);
  const [isApproaching, setIsApproaching] = useState(false);

  const coordsLabel =
    lat !== undefined && lng !== undefined
      ? `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`
      : "đang định vị…";

  useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    const approachTimer = window.setTimeout(
      () => setIsApproaching(true),
      APPROACH_DELAY_MS,
    );
    const finishTimer = window.setTimeout(next, JOURNEY_DURATION_MS);
    return () => {
      window.clearTimeout(approachTimer);
      window.clearTimeout(finishTimer);
    };
  }, [lat, lng, next]);

  return (
    <div className="flex flex-1 flex-col gap-6 pt-10">
      <div className="flex flex-col gap-1 text-center">
        <p className="text-sm text-fg-muted">
          {isApproaching ? "Lá thư sắp đến điểm B" : "Một tấm thiệp đang trên đường"}
        </p>
        <h1 className="text-2xl font-semibold">
          {isApproaching ? "Đang xoay về phía bạn…" : "Vượt nửa vòng trái đất…"}
        </h1>
      </div>

      <div className="flex flex-1 items-center justify-center">
        {lat !== undefined && lng !== undefined ? (
          <JourneyMap lat={lat} lng={lng} />
        ) : (
          <p className="px-8 text-center text-sm text-fg-muted">
            [ SVG bản đồ Việt Nam — dạng vector đơn giản ]
          </p>
        )}
      </div>

      <div className="pb-6 text-center">
        <p className="text-xs leading-relaxed text-fg-muted">Điểm đến · {coordsLabel}</p>
        <button
          type="button"
          onClick={next}
          className="mt-4 border-b border-border pb-1 text-xs text-fg-muted transition-colors hover:text-fg"
        >
          Bỏ qua hành trình
        </button>
      </div>
    </div>
  );
}
