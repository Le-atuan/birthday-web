"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./birthday-waiting-page.module.css";

function getRemaining(unlockAt: string) {
  const milliseconds = Math.max(0, new Date(unlockAt).getTime() - Date.now());
  return {
    total: milliseconds,
    days: Math.floor(milliseconds / 86_400_000),
    hours: Math.floor((milliseconds / 3_600_000) % 24),
    minutes: Math.floor((milliseconds / 60_000) % 60),
    seconds: Math.floor((milliseconds / 1_000) % 60),
  };
}

export function BirthdayWaitingPage({
  name,
  unlockAt,
  timezone,
}: {
  name: string;
  unlockAt: string;
  timezone: string;
}) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(() => getRemaining(unlockAt));
  const unlockLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        timeZone: timezone,
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(unlockAt)),
    [timezone, unlockAt],
  );

  useEffect(() => {
    if (remaining.total <= 0) {
      router.refresh();
      return;
    }
    const timer = window.setInterval(() => {
      const next = getRemaining(unlockAt);
      setRemaining(next);
      if (next.total <= 0) {
        window.clearInterval(timer);
        router.refresh();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remaining.total, router, unlockAt]);

  return (
    <main className={styles.page}>
      <div className={styles.stars} aria-hidden="true" />
      <div
        className={`${styles.cloud} ${styles.cloudOne}`}
        aria-hidden="true"
      />
      <div
        className={`${styles.cloud} ${styles.cloudTwo}`}
        aria-hidden="true"
      />
      <section className={styles.card}>
        <div className={styles.seal} aria-hidden="true">
          ✦
        </div>
        <p className={styles.eyebrow}>A special delivery for you</p>
        <h1>Lá thư của {name} đã đến nơi</h1>
        <p className={styles.intro}>
          Món quà bên trong vẫn đang ngủ một chút. Tấm thiệp sẽ tự mở khi ngày
          đặc biệt của bạn bắt đầu.
        </p>
        <div className={styles.countdown} aria-label="Thời gian còn lại">
          <Time value={remaining.days} label="Ngày" />
          <Time value={remaining.hours} label="Giờ" />
          <Time value={remaining.minutes} label="Phút" />
          <Time value={remaining.seconds} label="Giây" />
        </div>
        <p className={styles.unlock}>Mở lúc {unlockLabel}</p>
        <p className={styles.note}>
          Bạn không cần tải lại trang — lá thư sẽ tự mở khi đồng hồ về 0.
        </p>
      </section>
    </main>
  );
}

function Time({ value, label }: { value: number; label: string }) {
  return (
    <span className={styles.time}>
      <strong>{String(value).padStart(2, "0")}</strong>
      <small>{label}</small>
    </span>
  );
}
