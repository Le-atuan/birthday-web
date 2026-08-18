"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { GlowOrb } from "@/components/glow-orb";
import { PrimaryActionButton } from "@/components/primary-action-button";
import { useAppStore } from "@/store/app-store";

const CALIBRATION_DURATION_MS = 850;
const EXTINGUISH_ADVANCE_DELAY_MS = 1400;
const MIN_BLOW_THRESHOLD = 0.075;
const REQUIRED_LOUD_FRAMES = 10;

const SMOKE_WISPS = [
  { left: -6, size: 8, delay: 0 },
  { left: 4, size: 6, delay: 0.15 },
  { left: -2, size: 5, delay: 0.3 },
];

export function CandleStep() {
  const next = useAppStore((state) => state.next);
  const [isLit, setIsLit] = useState(true);
  const [volume, setVolume] = useState(0);
  const [micStatus, setMicStatus] = useState<"idle" | "requesting" | "listening" | "blocked">("idle");
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const stopListening = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    setVolume(0);
  }, []);

  useEffect(() => stopListening, [stopListening]);

  useEffect(() => {
    if (!isLit) {
      const timeout = setTimeout(next, EXTINGUISH_ADVANCE_DELAY_MS);
      return () => clearTimeout(timeout);
    }
  }, [isLit, next]);

  function handleBlow() {
    stopListening();
    setIsLit(false);
  }

  async function listenForBlow() {
    if (micStatus === "requesting" || micStatus === "listening") return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus("blocked");
      return;
    }

    setMicStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.25;
      source.connect(analyser);

      const samples = new Uint8Array(analyser.fftSize);
      const baselineValues: number[] = [];
      const calibrationEndsAt = performance.now() + CALIBRATION_DURATION_MS;
      let baseline = 0.025;
      let loudFrames = 0;
      setMicStatus("listening");

      function tick(now: number) {
        analyser.getByteTimeDomainData(samples);
        let energy = 0;
        for (const sample of samples) {
          const normalized = (sample - 128) / 128;
          energy += normalized * normalized;
        }
        const rms = Math.sqrt(energy / samples.length);
        setVolume(Math.min(rms / 0.18, 1));

        if (now < calibrationEndsAt) {
          baselineValues.push(rms);
        } else {
          if (baselineValues.length) {
            baseline =
              baselineValues.reduce((sum, value) => sum + value, 0) /
              baselineValues.length;
            baselineValues.length = 0;
          }
          const threshold = Math.max(MIN_BLOW_THRESHOLD, baseline * 2.7);
          loudFrames = rms > threshold ? loudFrames + 1 : Math.max(0, loudFrames - 2);
          if (loudFrames >= REQUIRED_LOUD_FRAMES) {
            handleBlow();
            return;
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      }
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      stopListening();
      setMicStatus("blocked");
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-8 pt-16 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Ước thật khẽ và thổi nến</h1>
        <p className="text-sm text-fg-muted">Bật micro hoặc chạm trực tiếp vào ngọn lửa</p>
      </div>

      <div className="relative flex h-60 w-60 items-center justify-center">
        <GlowOrb size={240} className="opacity-25" />

        <div
          className="absolute bottom-8 h-20 w-52.5 rounded-2xl"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--color-night) 130%, white 6%) 0%, var(--color-night) 60%)",
            boxShadow: "0 12px 26px -10px rgba(0,0,0,0.55)",
          }}
        >
          <div className="absolute inset-x-3 top-1.5 h-1 rounded-full bg-white/10" />
        </div>
        <div
          className="absolute bottom-26 h-16 w-39.5 rounded-2xl"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--color-night-soft) 140%, white 8%) 0%, var(--color-night-soft) 65%)",
            boxShadow: "0 8px 18px -8px rgba(0,0,0,0.5)",
          }}
        >
          <div className="absolute inset-x-3 top-1.5 h-1 rounded-full bg-white/10" />
        </div>

        <div
          className="absolute bottom-42 h-4.5 w-1.25 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 60%, var(--color-night-soft)) 100%)",
          }}
        />

        {isLit ? (
          <button
            type="button"
            aria-label="Chạm để thổi tắt nến"
            onClick={handleBlow}
            className="absolute bottom-46.5 cursor-pointer border-0 bg-transparent p-0"
          >
            <div className="relative flex items-center justify-center">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute rounded-full"
                style={{
                  width: 90,
                  height: 90,
                  left: "50%",
                  bottom: 0,
                  transform: "translateX(-50%)",
                  background:
                    "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 55%, transparent) 0%, transparent 70%)",
                }}
              />
              <div
                aria-hidden="true"
                className="flame-outer absolute bottom-0 left-1/2 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]"
                style={{
                  width: 30,
                  height: 46,
                  background:
                    "linear-gradient(180deg, var(--color-accent) 0%, #ff9d4d 55%, #ff6b3d 100%)",
                }}
              />
              <div
                aria-hidden="true"
                className="flame-core absolute bottom-0 left-1/2 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]"
                style={{
                  width: 12,
                  height: 22,
                  background:
                    "linear-gradient(180deg, #fff7e0 0%, var(--color-accent) 100%)",
                }}
              />
            </div>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute bottom-46.5"
          >
            <div className="relative">
              {SMOKE_WISPS.map((wisp, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="smoke-wisp"
                  style={{
                    left: `calc(50% + ${wisp.left}px)`,
                    bottom: 4,
                    width: wisp.size,
                    height: wisp.size,
                    animationDelay: `${wisp.delay}s`,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="w-full">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${Math.min(volume * 100, 100)}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-fg-muted">
          {micStatus === "requesting" && "Đang xin quyền microphone…"}
          {micStatus === "listening" && "Micro đang nghe — hãy thổi đều vào điện thoại"}
          {micStatus === "blocked" && "Không thể dùng micro; hãy chạm vào ngọn nến"}
          {micStatus === "idle" && "Micro chỉ bật khi bạn cho phép"}
        </p>
      </div>

      <div className="mt-auto w-full pb-6">
        <PrimaryActionButton onClick={listenForBlow}>
          {micStatus === "listening" ? "Micro đang nghe…" : "Bật micro & thổi"}
        </PrimaryActionButton>
        <button
          type="button"
          onClick={handleBlow}
          className="mt-3 w-full text-sm text-fg-muted underline decoration-border underline-offset-4"
        >
          Chạm để tắt nến
        </button>
      </div>
    </div>
  );
}
