"use client";

import { motion } from "motion/react";
import { GlowOrb } from "@/components/glow-orb";
import { PrimaryActionButton } from "@/components/primary-action-button";
import { useAppStore } from "@/store/app-store";

export function WishStep() {
  const wishText = useAppStore((state) => state.wishText);
  const setWish = useAppStore((state) => state.setWish);
  const next = useAppStore((state) => state.next);
  const trimmedWish = wishText.trim();

  function prepareCandle() {
    if (!trimmedWish) return;
    setWish(trimmedWish);
    next();
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-6 pt-16 text-center">
      <motion.div layoutId="wish-orb">
        <GlowOrb size={30} />
      </motion.div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Bạn ước điều gì?</h1>
        <p className="text-sm text-fg-muted">
          Chỉ mình bạn đọc được điều này.
        </p>
      </div>
      <textarea
        value={wishText}
        onChange={(event) => setWish(event.target.value)}
        placeholder="Mình ước rằng…"
        maxLength={180}
        rows={5}
        aria-label="Điều ước của bạn"
        className="w-full resize-none rounded-2xl border border-border bg-bg-elevated p-4 text-left text-base text-fg outline-none placeholder:text-fg-muted/60 focus:border-accent"
      />
      <p className="-mt-4 w-full text-right text-xs text-fg-muted">
        {wishText.length}/180
      </p>
      {!trimmedWish && (
        <p className="-mt-4 text-xs text-fg-muted">
          Hãy viết một điều ước trước khi thắp nến.
        </p>
      )}
      <div className="mt-auto w-full pb-6">
        <PrimaryActionButton onClick={prepareCandle}>
          Thắp nến điều ước
        </PrimaryActionButton>
      </div>
    </div>
  );
}
