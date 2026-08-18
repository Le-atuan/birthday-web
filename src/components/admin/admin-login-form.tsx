"use client";

import { useActionState } from "react";
import { loginAdmin, type AdminActionResult } from "@/app/admin/actions";
import styles from "@/components/admin/admin.module.css";

const INITIAL_STATE: AdminActionResult = { success: false, message: "" };

export function AdminLoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(loginAdmin, INITIAL_STATE);
  return (
    <main className={styles.loginPage}>
      <section className={styles.loginCard}>
        <div className={styles.cloudMark} aria-hidden="true">
          ☁
        </div>
        <p className={styles.eyebrow}>Cloud Blue Studio</p>
        <h1>Đăng nhập quản trị</h1>
        <p>Quản lý màu sắc và giao diện thiệp sinh nhật.</p>
        {!configured && (
          <p className={styles.configurationNotice} role="status">
            Thêm <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> vào môi
            trường để kích hoạt đăng nhập quản trị.
          </p>
        )}
        <form action={action} className={styles.loginForm}>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Mật khẩu
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {state.message && (
            <p className={styles.error} role="alert">
              {state.message}
            </p>
          )}
          <button type="submit" disabled={pending || !configured}>
            {pending ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>
      </section>
    </main>
  );
}
