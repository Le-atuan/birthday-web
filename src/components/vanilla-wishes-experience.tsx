"use client";

import { useEffect, useRef } from "react";
import { initWishesExperience } from "@/components/vanilla-wishes-runtime";

const MARKUP = String.raw`
  <main class="wish-space is-visible wishes-route" id="wishSpace" aria-labelledby="wishTitle">
    <div class="stars" id="stars" aria-hidden="true"></div>
    <div class="wish-panel" id="wishPanel">
      <section class="wish-step" id="wishWriteStep">
        <p class="wish-eyebrow">A wish for the stars</p>
        <h1 id="wishTitle">Bạn đang ước điều gì?</h1>
        <p>Hãy viết điều bạn mong muốn nhất. Điều ước này chỉ ở lại trên thiết bị của bạn.</p>
        <label class="wish-field" for="wishInput"><span>Điều ước của bạn</span><textarea id="wishInput" maxlength="180" rows="4" placeholder="Mình ước rằng..." required></textarea></label>
        <div class="wish-count"><span id="wishCount">0</span>/180</div>
        <button class="wish-primary" id="prepareWishButton" type="button">Thắp nến điều ước <span>→</span></button>
      </section>
      <section class="wish-step" id="wishCandleStep" hidden>
        <p class="wish-eyebrow">Make a wish</p><h1>Ước thật khẽ và thổi nến nhé</h1>
        <div class="wish-cake" id="wishCake" aria-label="Bánh sinh nhật với một cây nến đang cháy">
          <button class="wish-flame" id="flameButton" type="button" aria-label="Chạm để thổi tắt nến"></button><span class="wish-candle"></span><span class="wish-smoke" aria-hidden="true"></span><span class="wish-cake__icing"></span><span class="wish-cake__body"></span><span class="wish-cake__plate"></span>
        </div>
        <p class="blow-status" id="blowStatus" aria-live="polite">Chạm vào ngọn nến hoặc bật micro để thổi.</p>
        <div class="wish-actions"><button class="wish-primary" id="micButton" type="button">◉ Bật micro & thổi</button><button class="wish-secondary" id="tapHintButton" type="button">Chạm để tắt nến</button></div>
      </section>
      <section class="wish-step" id="wishSentStep" hidden>
        <p class="wish-eyebrow">Your star is shining</p><h1>Điều ước đã đến vũ trụ</h1>
        <p>Ngôi sao sáng hơn một chút trên bầu trời này đang giữ điều ước của bạn.</p>
        <button class="wish-secondary" id="viewStarButton" type="button">Xem lại điều ước</button>
        <nav class="wish-result-actions" aria-label="Điều hướng sau khi gửi điều ước"><a class="wish-secondary" id="homeLink" href="/">Về Home</a><a class="wish-primary" href="/?view=card">Quay lại thiệp</a></nav>
      </section>
    </div>
    <button class="wish-star wishes-route__star" id="wishStar" type="button" aria-label="Ngôi sao đang giữ điều ước" hidden><span></span></button>
    <div class="wish-memory" id="wishMemory" role="status" hidden></div>
  </main>`;

export function VanillaWishesExperience() {
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<link rel="stylesheet" href="/birthday-card/style.css" />${MARKUP}`;
    const dispose = initWishesExperience(shadow);
    return () => { dispose(); shadow.innerHTML = ""; };
  }, []);
  return <div ref={hostRef} className="min-h-dvh bg-[#071321]" />;
}
