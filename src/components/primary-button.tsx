import Link from "next/link";
import type { ReactNode } from "react";

export function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex h-13.5 w-full items-center justify-center rounded-full bg-accent text-base font-semibold text-accent-ink transition-opacity active:opacity-80"
    >
      {children}
    </Link>
  );
}
