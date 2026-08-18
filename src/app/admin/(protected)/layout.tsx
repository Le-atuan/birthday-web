import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { logoutAdmin } from "@/app/admin/actions";
import styles from "@/components/admin/admin.module.css";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();
  return (
    <div className={styles.adminShell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}>Cloud Blue</p>
          <h1>Theme Studio</h1>
        </div>
        <nav aria-label="Quản trị">
          <a href="/admin/theme" aria-current="page">
            Theme
          </a>
        </nav>
        <div className={styles.account}>
          <span>{user.email}</span>
          <form action={logoutAdmin}>
            <button type="submit">Đăng xuất</button>
          </form>
        </div>
      </aside>
      <main className={styles.adminMain}>{children}</main>
    </div>
  );
}
