"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GlowOrb } from "@/components/glow-orb";
import { useAppStore } from "@/store/app-store";

// Placeholder star positions (percent of container) — real version
// renders 200-400 stars on a <canvas>, with device-tilt parallax.
const DECORATIVE_STARS = [
  { x: 10, y: 8 },
  { x: 24, y: 20 },
  { x: 40, y: 6 },
  { x: 58, y: 18 },
  { x: 74, y: 10 },
  { x: 88, y: 22 },
  { x: 15, y: 32 },
  { x: 32, y: 40 },
  { x: 50, y: 30 },
  { x: 66, y: 42 },
  { x: 82, y: 34 },
  { x: 8, y: 52 },
  { x: 26, y: 60 },
  { x: 44, y: 50 },
  { x: 62, y: 58 },
  { x: 80, y: 48 },
  { x: 18, y: 72 },
  { x: 36, y: 80 },
  { x: 70, y: 74 },
  { x: 90, y: 84 },
  { x: 12, y: 92 },
  { x: 55, y: 90 },
  { x: 78, y: 96 },
  { x: 46, y: 68 },
];

const SHOOTING_STARS = [
  { top: 12, left: 78, duration: 3.2, delay: 1.2 },
  { top: 30, left: 92, duration: 4, delay: 5.5 },
];

const RISING_LANTERNS = [
  { left: 18, size: 10, duration: 8, delay: 0 },
  { left: 76, size: 7, duration: 10, delay: 2.5 },
  { left: 32, size: 5, duration: 7, delay: 4.8 },
  { left: 62, size: 8, duration: 9.5, delay: 1.6 },
];

export function SkyStep() {
  const wishText = useAppStore((state) => state.wishText);
  const [showWish, setShowWish] = useState(false);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {DECORATIVE_STARS.map((star, i) => {
        const size = 2 + (i % 3);
        return (
          <span
            key={i}
            aria-hidden="true"
            className="star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: size,
              height: size,
              ["--star-duration" as string]: `${2.2 + (i % 5) * 0.35}s`,
              ["--star-drift-duration" as string]: `${4 + (i % 4)}s`,
              ["--star-delay" as string]: `${(i % 6) * 0.25}s`,
              ["--star-glow" as string]: `${size + 1}px`,
            }}
          />
        );
      })}

      {SHOOTING_STARS.map((shoot, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="shooting-star"
          style={{
            top: `${shoot.top}%`,
            left: `${shoot.left}%`,
            ["--shoot-duration" as string]: `${shoot.duration}s`,
            ["--shoot-delay" as string]: `${shoot.delay}s`,
          }}
        />
      ))}

      {RISING_LANTERNS.map((lantern, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="rising-lantern"
          style={{
            left: `${lantern.left}%`,
            bottom: 0,
            width: lantern.size,
            height: lantern.size * 1.3,
            ["--rise-duration" as string]: `${lantern.duration}s`,
            ["--rise-delay" as string]: `${lantern.delay}s`,
          }}
        />
      ))}

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4">
        <motion.button
          type="button"
          aria-label="Ngôi sao điều ước — chạm để xem lại"
          className="relative grid h-28 w-28 cursor-pointer place-items-center border-0 bg-transparent p-0"
          initial={{ y: 260, scale: 0.14, opacity: 0, rotate: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1, rotate: 360 }}
          transition={{ duration: 2.3, ease: [0.2, 0.76, 0.2, 1] }}
          onClick={() => setShowWish((visible) => !visible)}
        >
          <motion.span
            className="relative z-10 text-5xl text-[#fff8c9]"
            animate={{ scale: [1, 1.2, 1], filter: ["brightness(1)", "brightness(1.45)", "brightness(1)"] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          >
            ✦
          </motion.span>
          <div className="absolute inset-0">
            <GlowOrb size={112} />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                boxShadow:
                  "0 0 28px 10px #ffd37a, 0 0 70px 24px color-mix(in srgb, #72c7f2 55%, transparent)",
              }}
            />
          </div>
        </motion.button>
        <motion.p
          className="text-xs text-fg-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          chạm vào ngôi sao sáng nhất để xem lại điều ước
        </motion.p>
        <AnimatePresence>
          {showWish ? (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              className="mx-4 max-w-sm rounded-2xl border border-[#ffd37a]/25 bg-[#081b2f]/90 px-5 py-4 text-center font-serif text-sm leading-relaxed text-white shadow-2xl backdrop-blur"
            >
              “{wishText}”
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <motion.div
        className="flex flex-col gap-1 pb-10 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
      >
        <h1 className="text-xl font-semibold">
          Điều ước của bạn đã bay lên
        </h1>
        <p className="text-sm text-fg-muted">
          Ngôi sao sáng nhất đang giữ điều ước của riêng bạn.
        </p>
      </motion.div>
    </div>
  );
}
