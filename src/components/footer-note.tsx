import type { ReactNode } from "react";

export function FooterNote({ children }: { children: ReactNode }) {
  return (
    <p className="text-center text-xs leading-relaxed text-fg-muted">
      {children}
    </p>
  );
}
