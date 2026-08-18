"use client";

import type { ReactNode } from "react";

export function PrimaryActionButton({
  onClick,
  children,
  type = "button",
}: {
  onClick?: () => void;
  children: ReactNode;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="flex h-[54px] w-full items-center justify-center rounded-full bg-accent text-base font-semibold text-accent-ink transition-opacity active:opacity-80"
    >
      {children}
    </button>
  );
}
