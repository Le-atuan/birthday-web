"use client";

import { motion, type Target, type Transition } from "motion/react";
import { GlowOrb } from "@/components/glow-orb";

const DEFAULT_ANIMATE: Target = {
  scale: [1, 1.04, 1],
  opacity: [0.85, 1, 0.85],
};

const DEFAULT_TRANSITION: Transition = {
  duration: 3,
  repeat: Infinity,
  ease: "easeInOut",
};

export function MotionGlowOrb({
  size,
  className,
  animate = DEFAULT_ANIMATE,
  transition = DEFAULT_TRANSITION,
}: {
  size: number;
  className?: string;
  animate?: Target;
  transition?: Transition;
}) {
  return (
    <motion.div
      animate={animate}
      transition={transition}
      style={{ display: "inline-flex" }}
    >
      <GlowOrb size={size} className={className} />
    </motion.div>
  );
}
