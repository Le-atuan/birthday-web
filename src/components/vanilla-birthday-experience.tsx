"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { submitRegistration } from "@/app/(flow)/register/actions";
import { useAppStore } from "@/store/app-store";
import { initBirthdayExperience } from "@/components/vanilla-birthday-runtime";

const MARKUP = String.raw`
  <div class="birthday-root">
  <canvas id="confetti" aria-hidden="true"></canvas>
  
      <section class="welcome" id="welcome">
        <div class="welcome__card">
          <p class="welcome__eyebrow">A little surprise for you</p>
          <h1 class="welcome__title">Trước khi mở quà...</h1>
          <p class="welcome__intro">Hãy để lại một chút thông tin để tấm thiệp biết người đặc biệt hôm nay là ai nhé.</p>
  
          <form class="guest-form" id="guestForm">
            <label class="field field--wide">
              <span>Họ và tên</span>
              <input id="fullName" name="fullName" type="text" autocomplete="name" placeholder="Nguyễn Minh Anh" value="Nguyễn Minh Anh" required />
            </label>
            <label class="field">
              <span>Ngày sinh</span>
              <input id="birthDate" name="birthDate" type="date" autocomplete="bday" value="1995-08-18" required />
            </label>
            <label class="field">
              <span>Số điện thoại</span>
              <input id="phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="09xx xxx xxx" value="0901234567" pattern="[0-9+ ()-]{8,16}" required />
            </label>
            <label class="field field--wide">
              <span>Email</span>
              <input id="email" name="email" type="email" autocomplete="email" placeholder="ban@email.com" value="minhanh@example.com" required />
            </label>
            <button class="enter-button" type="submit">Bước vào điều bất ngờ <span>→</span></button>
          </form>
          <p class="privacy-note" id="privacyNote" aria-live="polite">Khi tiếp tục, bạn có thể cho phép vị trí để cá nhân hoá hành trình. Nếu từ chối, thiệp vẫn hoạt động bình thường.</p>
        </div>
      </section>
  
      <section class="delivery" id="delivery" aria-hidden="true">
        <div class="delivery__content">
          <p class="delivery__eyebrow">Special delivery</p>
          <h2>Một lá thư đang vượt nửa vòng trái đất...</h2>
  
          <div class="flight" aria-label="Lá thư đang được gửi từ điểm A đến điểm B">
            <div class="globe">
              <div class="globe__world">
                <span class="land land--one"></span>
                <span class="land land--two"></span>
                <span class="land land--three"></span>
                <span class="latitude latitude--one"></span>
                <span class="latitude latitude--two"></span>
              </div>
              <svg class="route" viewBox="0 0 258 258" aria-hidden="true">
                <path id="flightPath" pathLength="1"></path>
              </svg>
              <div class="place place--a"><i><b>A</b></i><span id="fromLabel">Hà Nội, Việt Nam</span></div>
              <div class="place place--b"><i><b>B</b></i><span id="toLabel">Nhật Bản</span></div>
              <div class="flying-letter" aria-hidden="true"><span>♥</span></div>
            </div>
          </div>
  
          <div class="delivery__progress"><span></span></div>
          <p class="delivery__status" id="deliveryStatus" aria-live="polite">Đang rời điểm A...</p>
          <button class="skip-button" id="skipDelivery" type="button">Bỏ qua hành trình</button>
        </div>
      </section>
  
      <main class="scene" id="cardScene" aria-hidden="true">
        <div class="eyebrow">Một món quà nhỏ dành cho bạn</div>
  
        <section class="envelope" id="envelope" aria-label="Thiệp chúc mừng sinh nhật">
          <div class="envelope__back"></div>
          <div class="envelope__flap" aria-hidden="true"></div>
  
          <article class="card" id="card" aria-busy="false">
            <button class="mini-disc" id="musicButton" type="button" aria-pressed="false" aria-label="Tạm dừng nhạc">
              <span class="mini-disc__label">♪</span>
              <span class="mini-disc__status">Nhạc đang phát</span>
            </button>

            <section class="letter-panel letter-panel--top">
              <div class="card__decor card__decor--one">✦</div>
              <p class="card__kicker">Gửi đến <span id="recipientName">một người thật đặc biệt</span></p>
              <h1>Happy<br /><span>Birthday!</span></h1>
              <p class="birthday-line" id="birthdayLine"></p>
            </section>

            <section class="letter-panel letter-panel--middle">
              <div class="letter-divider" aria-hidden="true"><span>✦</span></div>
              <p class="message">
                Chúc bạn tuổi mới luôn rực rỡ và bình an. Mong những điều bạn
                đang ấp ủ sẽ từng chút một trở thành hiện thực.
              </p>
              <p class="message message--second">
                Chúc mỗi ngày phía trước đều mang đến một niềm vui nhỏ, một
                cuộc gặp gỡ đáng nhớ và thật nhiều lý do để mỉm cười.
              </p>
            </section>

            <section class="letter-panel letter-panel--bottom">
              <div class="card__decor card__decor--two" aria-hidden="true">
                <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" focusable="false">
                  <defs>
                    <path id="petalStd" d="M0,0 C-7,-3.4 -9.6,-9.6 -4.8,-13.2 C-2.4,-14.8 0,-13.6 0,-11.4 C0,-13.6 2.4,-14.8 4.8,-13.2 C9.6,-9.6 7,-3.4 0,0 Z" />
                    <path id="cloverStd" d="M0,0 C-5.6,-2.9 -6.6,-8.5 -2.9,-10.4 C-1.4,-11.3 0,-9.9 0,-8 C0,-9.9 1.4,-11.3 2.9,-10.4 C6.6,-8.5 5.6,-2.9 0,0 Z" />
                    <linearGradient id="petalGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                      <stop offset="0%" stop-color="#fff6ec" />
                      <stop offset="45%" stop-color="#f3bfc9" />
                      <stop offset="100%" stop-color="#d98aa0" />
                    </linearGradient>
                    <linearGradient id="cloverGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                      <stop offset="0%" stop-color="#bcd39a" />
                      <stop offset="55%" stop-color="#7fa86f" />
                      <stop offset="100%" stop-color="#547553" />
                    </linearGradient>
                    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stop-color="#ffe9c7" stop-opacity="0.55" />
                      <stop offset="100%" stop-color="#ffe9c7" stop-opacity="0" />
                    </radialGradient>
                  </defs>

                  <path d="M32 52 C26 38 28 24 36 13" fill="none" stroke="var(--berry)" stroke-width="2" stroke-linecap="round" />
                  <path d="M32 52 C24 49 15 47 10 45" fill="none" stroke="var(--berry)" stroke-width="1.6" stroke-linecap="round" />

                  <circle cx="36" cy="12" r="11" fill="url(#glowGrad)" />

                  <use href="#petalStd" transform="translate(36,12) rotate(0)" fill="url(#petalGrad)" />
                  <use href="#petalStd" transform="translate(36,12) rotate(72)" fill="url(#petalGrad)" />
                  <use href="#petalStd" transform="translate(36,12) rotate(144)" fill="url(#petalGrad)" />
                  <use href="#petalStd" transform="translate(36,12) rotate(216)" fill="url(#petalGrad)" />
                  <use href="#petalStd" transform="translate(36,12) rotate(288)" fill="url(#petalGrad)" />
                  <circle cx="36" cy="12" r="1.6" fill="#b9506f" />
                  <circle cx="39" cy="10" r="0.9" fill="var(--peach)" />
                  <circle cx="39.2" cy="14" r="0.9" fill="var(--peach)" />
                  <circle cx="36.4" cy="15.6" r="0.9" fill="var(--peach)" />
                  <circle cx="33.2" cy="13" r="0.9" fill="var(--peach)" />
                  <circle cx="33.8" cy="9.4" r="0.9" fill="#fff6ec" />

                  <use href="#petalStd" transform="translate(24,30) rotate(-24) scale(0.42)" fill="url(#petalGrad)" opacity="0.65" />
                  <use href="#petalStd" transform="translate(17,20) rotate(18) scale(0.3)" fill="url(#petalGrad)" opacity="0.55" />

                  <path d="M45,3 L46.1,5.9 L49,7 L46.1,8.1 L45,11 L43.9,8.1 L41,7 L43.9,5.9 Z" fill="var(--peach)" opacity="0.9" />

                  <use href="#cloverStd" transform="translate(10,44) rotate(0)" fill="url(#cloverGrad)" />
                  <use href="#cloverStd" transform="translate(10,44) rotate(90)" fill="url(#cloverGrad)" />
                  <use href="#cloverStd" transform="translate(10,44) rotate(180)" fill="url(#cloverGrad)" />
                  <use href="#cloverStd" transform="translate(10,44) rotate(270)" fill="url(#cloverGrad)" />
                  <path d="M10,44 L10,38.6 M10,44 L10,49.4 M10,44 L4.6,44 M10,44 L15.4,44" stroke="var(--peach)" stroke-width="0.5" opacity="0.7" />
                  <circle cx="10" cy="44" r="1.1" fill="#3f5c3d" />
                </svg>
              </div>
              <p class="closing-note">Mong tuổi mới sẽ dịu dàng với bạn như một ngày trời trong.</p>
              <div class="letter-closing">
                <p class="best-wishes">Best wishes,</p>
                <p class="signature">Tuấn</p>
              </div>
            </section>
          </article>
  
          <div class="envelope__front"></div>
          <button class="seal" id="openButton" type="button" aria-expanded="false" aria-controls="card">
            <span>♡</span>
            <small>Mở thiệp</small>
          </button>
        </section>

        <div class="wish-launch">
          <button class="wish-button" id="openWishButton" type="button"><span aria-hidden="true">✦</span> Viết một điều ước</button>
        </div>
  
        <p class="hint" id="hint">Chạm vào con dấu để mở điều bất ngờ</p>
      </main>
  
      <section class="wish-space" id="wishSpace" aria-hidden="true" aria-labelledby="wishTitle">
        <div class="stars" id="stars" aria-hidden="true"></div>
        <button class="wish-close" id="closeWishButton" type="button" aria-label="Đóng màn điều ước">×</button>
  
        <div class="wish-panel" id="wishPanel">
          <div class="wish-step wish-step--write" id="wishWriteStep">
            <p class="wish-eyebrow">A wish for the stars</p>
            <h2 id="wishTitle">Bạn đang ước điều gì?</h2>
            <p>Hãy viết điều bạn mong muốn nhất. Điều ước này chỉ ở lại trong khoảnh khắc của riêng bạn.</p>
            <label class="wish-field" for="wishInput">
              <span>Điều ước của bạn</span>
              <textarea id="wishInput" maxlength="180" rows="4" placeholder="Mình ước rằng..." required></textarea>
            </label>
            <div class="wish-count"><span id="wishCount">0</span>/180</div>
            <button class="wish-primary" id="prepareWishButton" type="button">Thắp nến điều ước <span>→</span></button>
          </div>
  
          <div class="wish-step wish-step--candle" id="wishCandleStep" hidden>
            <p class="wish-eyebrow">Make a wish</p>
            <h2>Ước thật khẽ và thổi nến nhé</h2>
            <div class="wish-cake" id="wishCake" aria-label="Bánh sinh nhật với một cây nến đang cháy">
              <button class="wish-flame" id="flameButton" type="button" aria-label="Chạm để thổi tắt nến"></button>
              <span class="wish-candle"></span>
              <span class="wish-smoke" aria-hidden="true"></span>
              <span class="wish-cake__icing"></span>
              <span class="wish-cake__body"></span>
              <span class="wish-cake__plate"></span>
            </div>
            <p class="blow-status" id="blowStatus" aria-live="polite">Chạm vào ngọn nến hoặc bật micro để thổi.</p>
            <div class="wish-actions">
              <button class="wish-primary" id="micButton" type="button">◉ Bật micro & thổi</button>
              <button class="wish-secondary" id="tapHintButton" type="button">Chạm để tắt nến</button>
            </div>
          </div>
  
          <div class="wish-step wish-step--sent" id="wishSentStep" hidden>
            <p class="wish-eyebrow">Your star is shining</p>
            <h2>Điều ước đã đến vũ trụ ✦</h2>
            <p>Ngôi sao sáng nhất trên bầu trời này đang giữ điều ước của bạn.</p>
            <button class="wish-secondary" id="viewStarButton" type="button">Chạm vào ngôi sao để xem lại</button>
          </div>
        </div>
  
        <button class="wish-star" id="wishStar" type="button" aria-label="Ngôi sao điều ước" hidden><span>✦</span></button>
        <div class="wish-memory" id="wishMemory" role="status" hidden></div>
      </section>
  </div>
`;

type InitialGuest = {
  fullName: string;
  birthDate: string;
  fromPlace?: string;
  toPlace?: string;
};

export function VanillaBirthdayExperience({
  initialGuest,
}: {
  initialGuest?: InitialGuest;
} = {}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const setUser = useAppStore((state) => state.setUser);
  const router = useRouter();
  const isBypassGuestFormEnabled =
    process.env.NEXT_PUBLIC_BYPASS_GUEST_FORM === "true";

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <link rel="stylesheet" href="/birthday-card/style.css" />
      ${MARKUP}
    `;

    const dispose = initBirthdayExperience(shadow, {
      onOpenWish: () => router.push("/wishes"),
      onRegister: async (values) => {
        setUser(values);
        return submitRegistration(values);
      },
      initialGuest,
      isBypassGuestFormEnabled,
    });

    return () => {
      dispose();
      shadow.innerHTML = "";
    };
  }, [initialGuest, isBypassGuestFormEnabled, router, setUser]);

  return <div ref={hostRef} className="min-h-dvh" />;
}
