"use client";

import { AnimatePresence, motion } from "motion/react";
import { MobileShell } from "@/components/mobile-shell";
import { useAppStore } from "@/store/app-store";
import { CandleStep } from "@/components/flow/steps/candle-step";
import { CardStep } from "@/components/flow/steps/card-step";
import { CountdownStep } from "@/components/flow/steps/countdown-step";
import { JourneyStep } from "@/components/flow/steps/journey-step";
import { SkyStep } from "@/components/flow/steps/sky-step";
import { WishStep } from "@/components/flow/steps/wish-step";

const STEP_COMPONENTS = [
  CountdownStep,
  JourneyStep,
  CardStep,
  WishStep,
  CandleStep,
  SkyStep,
] as const;

export function FlowStepper() {
  const step = useAppStore((state) => state.step);
  const StepComponent = STEP_COMPONENTS[step];

  return (
    <MobileShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex flex-1 flex-col"
        >
          <StepComponent />
        </motion.div>
      </AnimatePresence>
    </MobileShell>
  );
}
