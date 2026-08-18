type GlowOrbProps = {
  size: number;
  className?: string;
};

export function GlowOrb({ size, className = "" }: GlowOrbProps) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 35%, transparent) 45%, transparent 75%)",
      }}
    />
  );
}
