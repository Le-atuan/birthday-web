import Link from "next/link";
import type { ReactNode } from "react";

const shellClassName =
  "flex min-h-dvh w-full flex-col bg-bg px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] text-fg";

export function MobileShell({ children }: { children: ReactNode }) {
  return <main className={shellClassName}>{children}</main>;
}

export function TapShell({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={shellClassName}>
      {children}
    </Link>
  );
}
