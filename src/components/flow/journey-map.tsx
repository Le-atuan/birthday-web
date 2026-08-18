"use client";

import type { CSSProperties } from "react";
import { motion } from "motion/react";

type JourneyStyle = CSSProperties & {
  "--destination-x": string;
  "--destination-y": string;
};

export function JourneyMap({ lat, lng }: { lat: number; lng: number }) {
  const normalizedLongitude = ((lng + 180) % 360 + 360) % 360;
  const destinationX = 58 + (normalizedLongitude / 360) * 20;
  const destinationY = 28 + ((90 - Math.max(-90, Math.min(90, lat))) / 180) * 18;
  const journeyStyle: JourneyStyle = {
    "--destination-x": `${destinationX}%`,
    "--destination-y": `${destinationY}%`,
  };

  return (
    <div
      className="journey-globe-wrap"
      role="img"
      aria-label={`Lá thư bay từ điểm A đến điểm B tại ${lat.toFixed(2)}°, ${lng.toFixed(2)}°`}
      style={journeyStyle}
    >
      <div className="journey-globe">
        <motion.div
          className="journey-globe-world"
          initial={{ rotate: 0, scale: 1 }}
          animate={{ rotate: [0, 0, -28], scale: [1, 1, 1.04] }}
          transition={{ duration: 5.8, times: [0, 0.64, 1], ease: "easeInOut" }}
          aria-hidden="true"
        >
          <span className="journey-land journey-land-one" />
          <span className="journey-land journey-land-two" />
          <span className="journey-land journey-land-three" />
          <span className="journey-latitude journey-latitude-one" />
          <span className="journey-latitude journey-latitude-two" />
        </motion.div>
        <span className="journey-route" aria-hidden="true" />
        <span className="journey-place journey-place-a">
          <b><i>A</i></b>
          <small>Việt Nam</small>
        </span>
        <span className="journey-place journey-place-b">
          <b><i>B</i></b>
          <small>Điểm đến</small>
        </span>
        <motion.span
          className="journey-letter"
          aria-hidden="true"
          initial={{ left: "20%", top: "70%", scale: 0.82, rotate: -12 }}
          animate={{
            left: ["20%", "36%", "55%", `${destinationX}%`],
            top: ["70%", "35%", "22%", `${destinationY}%`],
            scale: [0.82, 1.06, 1, 0.72],
            rotate: [-12, 8, -4, 2],
            opacity: [1, 1, 1, 0.28],
          }}
          transition={{ duration: 5.8, times: [0, 0.34, 0.7, 1], ease: "easeInOut" }}
        >
          <i>♥</i>
        </motion.span>
      </div>
    </div>
  );
}
