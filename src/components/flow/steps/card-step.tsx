"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/app-store";
import styles from "@/components/birthday-card.module.css";

type ConfettiPiece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  rotation: number;
  spin: number;
  size: number;
  color: string;
  life: number;
};
const COLORS = ["#4F8FCB", "#A7D8F5", "#DCEFFC", "#D59A24", "#FFFFFF"];
const TUNE: ReadonlyArray<readonly [number, number]> = [
  [261.63, 0.2],
  [261.63, 0.1],
  [293.66, 0.35],
  [261.63, 0.35],
  [349.23, 0.35],
  [329.63, 0.7],
  [261.63, 0.2],
  [261.63, 0.1],
  [293.66, 0.35],
  [261.63, 0.35],
  [392, 0.35],
  [349.23, 0.7],
  [261.63, 0.2],
  [261.63, 0.1],
  [523.25, 0.35],
  [440, 0.35],
  [349.23, 0.35],
  [329.63, 0.35],
  [293.66, 0.7],
  [466.16, 0.2],
  [466.16, 0.1],
  [440, 0.35],
  [349.23, 0.35],
  [392, 0.35],
  [349.23, 0.8],
];

export function CardStep() {
  const next = useAppStore((state) => state.next);
  const name = useAppStore((state) => state.name);
  const dob = useAppStore((state) => state.dob);
  const [isOpen, setIsOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesRef = useRef<ConfettiPiece[]>([]);
  const rainingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const tuneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recipientName = name.trim() || "một người thật đặc biệt";
  const birthdayLine = formatBirthday(dob);

  const stopMusic = useCallback(() => {
    if (tuneTimerRef.current) clearTimeout(tuneTimerRef.current);
    tuneTimerRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    setIsMusicPlaying(false);
  }, []);

  const scheduleTune = useCallback(() => {
    const context = audioContextRef.current ?? new AudioContext();
    audioContextRef.current = context;
    setIsMusicPlaying(true);
    let start = context.currentTime;
    for (const [frequency, duration] of TUNE) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.09, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration);
      start += duration + 0.035;
    }
    tuneTimerRef.current = setTimeout(
      () => {
        void context.close();
        audioContextRef.current = null;
        tuneTimerRef.current = null;
        setIsMusicPlaying(false);
      },
      (start - context.currentTime + 0.2) * 1000,
    );
  }, []);

  useEffect(() => stopMusic, [stopMusic]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let frame = 0;
    let lastRainDrop = 0;
    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = window.innerWidth * ratio;
      canvas!.height = window.innerHeight * ratio;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    function draw(time: number) {
      context!.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (rainingRef.current && time - lastRainDrop > 90) {
        piecesRef.current.push(
          createPiece(Math.random() * window.innerWidth, -15, true),
        );
        if (Math.random() > 0.55)
          piecesRef.current.push(
            createPiece(Math.random() * window.innerWidth, -15, true),
          );
        lastRainDrop = time;
      }
      for (const piece of piecesRef.current) {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.vy += piece.gravity;
        piece.vx *= 0.995;
        piece.rotation += piece.spin;
        piece.life -= piece.gravity < 0.01 ? 0.0008 : 0.006;
        context!.save();
        context!.globalAlpha = Math.max(piece.life, 0);
        context!.translate(piece.x, piece.y);
        context!.rotate(piece.rotation);
        context!.fillStyle = piece.color;
        context!.fillRect(
          -piece.size / 2,
          -piece.size / 4,
          piece.size,
          piece.size / 2,
        );
        context!.restore();
      }
      piecesRef.current = piecesRef.current.filter(
        (piece) => piece.life > 0 && piece.y < window.innerHeight + 30,
      );
      frame = requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, []);

  function openCard() {
    if (isOpen) return;
    setIsOpen(true);
    rainingRef.current = !matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    piecesRef.current.push(
      ...Array.from({ length: rainingRef.current ? 190 : 40 }, () =>
        createPiece(
          window.innerWidth / 2 + (Math.random() - 0.5) * 120,
          window.innerHeight * 0.38,
          false,
        ),
      ),
    );
    scheduleTune();
  }

  function continueJourney() {
    rainingRef.current = false;
    stopMusic();
    next();
  }

  return (
    <section className={styles.cardScene} aria-labelledby="card-heading">
      <canvas ref={canvasRef} className={styles.confetti} aria-hidden="true" />
      <p className={styles.sceneEyebrow}>Một món quà nhỏ dành cho bạn</p>
      <div
        className={`${styles.envelope} ${isOpen ? styles.envelopeOpen : ""}`}
      >
        <div className={styles.envelopeBack} aria-hidden="true" />
        <div className={styles.envelopeFlap} aria-hidden="true" />
        <article className={styles.card} aria-hidden={!isOpen}>
          <span
            className={`${styles.cardDecor} ${styles.cardDecorOne}`}
            aria-hidden="true"
          >
            ✦
          </span>
          <span
            className={`${styles.cardDecor} ${styles.cardDecorTwo}`}
            aria-hidden="true"
          >
            ✿
          </span>
          <p className={styles.cardKicker}>
            Gửi đến <span>{recipientName}</span>
          </p>
          <h1 id="card-heading" className={styles.cardTitle}>
            Happy
            <br />
            <span>Birthday!</span>
          </h1>
          <button
            className={`${styles.musicButton} ${isMusicPlaying ? "" : styles.musicPaused}`}
            type="button"
            onClick={isMusicPlaying ? stopMusic : scheduleTune}
            aria-pressed={!isMusicPlaying}
            aria-label={
              isMusicPlaying ? "Tạm dừng nhạc" : "Phát nhạc sinh nhật"
            }
            tabIndex={isOpen ? 0 : -1}
          >
            <span className={styles.musicIcon}>♪</span>
            <span className={styles.musicStatus}>
              {isMusicPlaying ? "Nhạc đang phát" : "Nhạc đã dừng"}
            </span>
          </button>
          <p className={styles.cardMessage}>
            Chúc bạn tuổi mới luôn rực rỡ, bình an, gặp thật nhiều may mắn và
            mỗi ngày đều có một lý do để mỉm cười. 🎂
          </p>
          {birthdayLine && (
            <p className={styles.birthdayLine}>{birthdayLine}</p>
          )}
          <p className={styles.signature}>
            Thương mến, từ một người luôn quý bạn ♡
          </p>
        </article>
        <div className={styles.envelopeFront} aria-hidden="true" />
        <button
          className={styles.seal}
          type="button"
          onClick={openCard}
          aria-expanded={isOpen}
          aria-controls="card-heading"
        >
          <span>♡</span>
          <small>{isOpen ? "Đã mở" : "Mở thiệp"}</small>
        </button>
      </div>
      <p className={`${styles.cardHint} ${isOpen ? styles.hintHidden : ""}`}>
        Chạm vào con dấu để mở điều bất ngờ
      </p>
      {isOpen && (
        <button
          className={styles.continueButton}
          type="button"
          onClick={continueJourney}
        >
          ✦ Viết một điều ước <span aria-hidden="true">→</span>
        </button>
      )}
    </section>
  );
}

function createPiece(x: number, y: number, rain: boolean): ConfettiPiece {
  return {
    x,
    y,
    vx: rain ? (Math.random() - 0.5) * 1.1 : (Math.random() - 0.5) * 12,
    vy: rain ? 1.1 + Math.random() * 1.7 : Math.random() * -10 - 3,
    gravity: rain ? 0.004 : 0.16 + Math.random() * 0.08,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * (rain ? 0.06 : 0.25),
    size: 4 + Math.random() * 7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    life: rain ? 1.8 : 1,
  };
}

function formatBirthday(value: string) {
  const [year, month, day] = value.split("-");
  return year && month && day ? `Sinh ngày ${day}.${month}.${year}` : "";
}
