// Vanilla DOM runtime. React only mounts and disposes this module.
export function initBirthdayExperience(
  root,
  { onOpenWish, onRegister, initialGuest },
) {
  const abortController = new AbortController();
  const { signal } = abortController;
  const timers = new Set();
  const later = (callback, delay) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
    return timer;
  };

  const envelope = root.querySelector("#envelope");
  const card = root.querySelector("#card");
  const openButton = root.querySelector("#openButton");
  const musicButton = root.querySelector("#musicButton");
  const hint = root.querySelector("#hint");
  const welcome = root.querySelector("#welcome");
  const guestForm = root.querySelector("#guestForm");
  const submitButton = guestForm.querySelector('button[type="submit"]');
  const privacyNote = root.querySelector("#privacyNote");
  const cardScene = root.querySelector("#cardScene");
  const delivery = root.querySelector("#delivery");
  const skipDelivery = root.querySelector("#skipDelivery");
  const deliveryStatus = root.querySelector("#deliveryStatus");
  const fromLabel = root.querySelector("#fromLabel");
  const toLabel = root.querySelector("#toLabel");
  const recipientName = root.querySelector("#recipientName");
  const birthdayLine = root.querySelector("#birthdayLine");
  const openWishButton = root.querySelector("#openWishButton");
  const wishSpace = root.querySelector("#wishSpace");
  const closeWishButton = root.querySelector("#closeWishButton");
  const wishPanel = root.querySelector("#wishPanel");
  const wishWriteStep = root.querySelector("#wishWriteStep");
  const wishCandleStep = root.querySelector("#wishCandleStep");
  const wishSentStep = root.querySelector("#wishSentStep");
  const wishInput = root.querySelector("#wishInput");
  const wishCount = root.querySelector("#wishCount");
  const prepareWishButton = root.querySelector("#prepareWishButton");
  const wishCake = root.querySelector("#wishCake");
  const flameButton = root.querySelector("#flameButton");
  const micButton = root.querySelector("#micButton");
  const tapHintButton = root.querySelector("#tapHintButton");
  const blowStatus = root.querySelector("#blowStatus");
  const wishStar = root.querySelector("#wishStar");
  const wishMemory = root.querySelector("#wishMemory");
  const viewStarButton = root.querySelector("#viewStarButton");
  const canvas = root.querySelector("#confetti");
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let pieces = [];
  let animationId;
  let audioContext;
  let isPlaying = false;
  let tuneTimer;
  let deliveryTimer;
  let statusTimer;
  let micStream;
  let micContext;
  let micAnimationId;
  let resumeMusicAfterMic = false;
  let activeWish = "";
  let previousFocus;
  let isRaining = false;
  let lastRainDrop = 0;
  const colors = ["#12304a", "#267cb3", "#72c7f2", "#ffd37a", "#f8fcff"];
  const defaultFromPlace = "Hà Nội, Việt Nam";
  const defaultToPlace = "Nhật Bản";

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function burst(amount = 150) {
    pieces.push(
      ...Array.from({ length: amount }, () => ({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
        y: window.innerHeight * 0.38,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -10 - 3,
        gravity: 0.16 + Math.random() * 0.08,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.25,
        size: 5 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
      })),
    );
  }

  function addRain() {
    pieces.push({
      x: Math.random() * window.innerWidth,
      y: -15,
      vx: (Math.random() - 0.5) * 1.1,
      vy: 1.1 + Math.random() * 1.7,
      gravity: 0.004,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.06,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1.8,
    });
  }

  function drawConfetti(time = 0) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (isRaining && time - lastRainDrop > 85) {
      addRain();
      if (Math.random() > 0.5) addRain();
      lastRainDrop = time;
    }
    pieces.forEach((piece) => {
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.vy += piece.gravity;
      piece.vx *= 0.995;
      piece.rotation += piece.spin;
      piece.life -= isRaining && piece.gravity < 0.01 ? 0.0008 : 0.006;

      ctx.save();
      ctx.globalAlpha = Math.max(piece.life, 0);
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.fillStyle = piece.color;
      ctx.fillRect(
        -piece.size / 2,
        -piece.size / 4,
        piece.size,
        piece.size / 2,
      );
      ctx.restore();
    });
    pieces = pieces.filter(
      (piece) => piece.life > 0 && piece.y < window.innerHeight + 30,
    );
    animationId = requestAnimationFrame(drawConfetti);
  }

  function openCard() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const unfoldDuration = reduceMotion ? 40 : 1650;
    card.setAttribute("aria-busy", "true");
    envelope.classList.add("open");
    openButton.setAttribute("aria-expanded", "true");
    hint.classList.add("hidden");
    later(() => {
      card.setAttribute("aria-busy", "false");
      card.classList.add("is-unfolded");
      isRaining = true;
      card.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
    }, unfoldDuration);
  }

  function openWishSpace() {
    onOpenWish();
  }

  function closeWishSpace() {
    stopMicrophone(true);
    wishSpace.classList.remove("is-visible");
    wishSpace.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    isRaining = true;
    wishMemory.hidden = true;
    if (previousFocus) previousFocus.focus();
  }

  function prepareWish() {
    const value = wishInput.value.trim();
    if (!value) {
      wishInput.setCustomValidity("Hãy viết một điều ước trước khi thắp nến.");
      wishInput.reportValidity();
      wishInput.focus();
      return;
    }
    wishInput.setCustomValidity("");
    activeWish = value;
    wishWriteStep.hidden = true;
    wishCandleStep.hidden = false;
    blowStatus.textContent = "Chạm vào ngọn nến hoặc bật micro để thổi.";
    later(() => flameButton.focus(), 60);
  }

  function stopMicrophone(shouldResumeMusic = false) {
    cancelAnimationFrame(micAnimationId);
    if (micStream) micStream.getTracks().forEach((track) => track.stop());
    if (micContext && micContext.state !== "closed") micContext.close();
    micStream = null;
    micContext = null;
    micButton.disabled = false;
    micButton.textContent = "◉ Bật micro & thổi";
    if (shouldResumeMusic && resumeMusicAfterMic && !isPlaying) startMusic();
    resumeMusicAfterMic = false;
  }

  async function listenForBlow() {
    if (!navigator.mediaDevices?.getUserMedia) {
      blowStatus.textContent =
        "Thiết bị này không hỗ trợ microphone. Bạn có thể chạm vào ngọn nến.";
      return;
    }

    micButton.disabled = true;
    micButton.textContent = "Đang xin quyền micro...";
    blowStatus.textContent = "Hãy cho phép sử dụng microphone để thổi nến.";
    resumeMusicAfterMic = isPlaying;
    if (isPlaying) stopMusic();

    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      micContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = micContext.createMediaStreamSource(micStream);
      const analyser = micContext.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.25;
      source.connect(analyser);

      const samples = new Uint8Array(analyser.fftSize);
      const baselineValues = [];
      const calibrationEndsAt = performance.now() + 850;
      let baseline = 0.025;
      let loudFrames = 0;

      micButton.textContent = "Micro đang nghe...";
      blowStatus.textContent =
        "Giữ yên một chút để micro nhận biết âm thanh nền...";

      const measure = (now) => {
        analyser.getByteTimeDomainData(samples);
        let energy = 0;
        for (let index = 0; index < samples.length; index += 1) {
          const normalized = (samples[index] - 128) / 128;
          energy += normalized * normalized;
        }
        const rms = Math.sqrt(energy / samples.length);

        if (now < calibrationEndsAt) {
          baselineValues.push(rms);
        } else {
          if (baselineValues.length) {
            baseline =
              baselineValues.reduce((sum, value) => sum + value, 0) /
              baselineValues.length;
            baselineValues.length = 0;
            blowStatus.textContent =
              "Micro đã sẵn sàng — hãy thổi đều vào điện thoại.";
          }
          const threshold = Math.max(0.075, baseline * 2.7);
          loudFrames =
            rms > threshold ? loudFrames + 1 : Math.max(0, loudFrames - 2);
          if (loudFrames >= 10) {
            extinguishWish();
            return;
          }
        }
        micAnimationId = requestAnimationFrame(measure);
      };
      micAnimationId = requestAnimationFrame(measure);
    } catch {
      stopMicrophone(true);
      blowStatus.textContent =
        "Không thể dùng microphone. Bạn vẫn có thể chạm vào ngọn nến để gửi điều ước.";
    }
  }

  function extinguishWish() {
    if (wishCake.classList.contains("is-out")) return;
    wishCake.classList.add("is-out");
    flameButton.disabled = true;
    tapHintButton.disabled = true;
    micButton.disabled = true;
    blowStatus.textContent = "Ngọn nến đã tắt. Điều ước đang bay lên...";
    stopMicrophone(true);

    const starX = 22 + Math.random() * 56;
    const starY = 12 + Math.random() * 25;
    wishStar.style.setProperty("--star-x", `${starX}%`);
    wishStar.style.setProperty("--star-y", `${starY}%`);

    later(() => {
      wishPanel.classList.add("is-fading");
      wishStar.hidden = false;
      wishStar.classList.add("is-flying");
    }, 650);

    later(() => {
      wishStar.classList.remove("is-flying");
      wishCandleStep.hidden = true;
      wishSentStep.hidden = false;
      wishPanel.classList.remove("is-fading");
      wishMemory.textContent = `“${activeWish}”`;
      viewStarButton.focus();
    }, 3000);
  }

  function toggleWishMemory() {
    wishMemory.hidden = !wishMemory.hidden;
  }

  function trapWishFocus(event) {
    if (!wishSpace.classList.contains("is-visible")) return;
    if (event.key === "Escape") {
      closeWishSpace();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [
      ...wishSpace.querySelectorAll(
        "button:not([disabled]):not([hidden]), textarea:not([disabled])",
      ),
    ].filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function formatBirthday(value) {
    const [year, month, day] = value.split("-");
    return `Sinh ngày ${day}.${month}.${year}`;
  }

  function requestDestinationLocation() {
    if (!navigator.geolocation || !window.isSecureContext) {
      privacyNote.textContent =
        "Không thể dùng vị trí trên kết nối này. Hành trình sẽ tiếp tục tới Nhật Bản.";
      return Promise.resolve(null);
    }
    privacyNote.textContent =
      "Hãy cho phép vị trí để cá nhân hoá điểm đến của hành trình.";
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            capturedAt: new Date(position.timestamp).toISOString(),
          }),
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
      );
    });
  }

  function updateDestination(location) {
    if (!location) {
      toLabel.textContent = defaultToPlace;
      privacyNote.textContent =
        "Không sử dụng vị trí. Hành trình sẽ tiếp tục tới Nhật Bản.";
      return;
    }
    const left = 10 + ((location.longitude + 180) / 360) * 80;
    const top = 10 + ((90 - location.latitude) / 180) * 72;
    const destinationMarker = root.querySelector(".place--b");
    destinationMarker.style.right = "auto";
    destinationMarker.style.left = `${Math.max(8, Math.min(88, left))}%`;
    destinationMarker.style.top = `${Math.max(8, Math.min(78, top))}%`;
    toLabel.textContent = "Vị trí hiện tại";
    privacyNote.textContent = "Đã dùng vị trí để cá nhân hoá hành trình.";
  }

  guestForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();
      submitButton.disabled = true;
      submitButton.textContent = "Đang chuẩn bị hành trình...";
      const data = new FormData(guestForm);
      const location = await requestDestinationLocation();
      updateDestination(location);
      const registration = {
        name: String(data.get("fullName") || "").trim(),
        dob: String(data.get("birthDate") || ""),
        email: String(data.get("email") || "").trim(),
        phone: String(data.get("phone") || "").trim(),
        destinationLatitude: location?.latitude ?? null,
        destinationLongitude: location?.longitude ?? null,
        locationAccuracy: location?.accuracy ?? null,
        locationCapturedAt: location?.capturedAt ?? null,
        timezone:
          Intl.DateTimeFormat().resolvedOptions().timeZone ||
          "Asia/Ho_Chi_Minh",
      };
      onRegister(registration).catch(() => {});
      recipientName.textContent = registration.name;
      birthdayLine.textContent = formatBirthday(data.get("birthDate"));
      fromLabel.textContent = defaultFromPlace;
      if (!location) toLabel.textContent = defaultToPlace;
      try {
        sessionStorage.setItem(
          "birthdayGuest",
          JSON.stringify({
            fullName: registration.name,
            birthDate: registration.dob,
            fromPlace: defaultFromPlace,
            toPlace: defaultToPlace,
          }),
        );
      } catch {}
      welcome.classList.add("is-leaving");
      delivery.classList.add("is-visible");
      delivery.setAttribute("aria-hidden", "false");
      startMusic();
      statusTimer = later(() => {
        deliveryStatus.textContent = `Đang đến gần ${defaultToPlace}...`;
      }, 3900);
      deliveryTimer = later(finishDelivery, 6200);
    },
    { signal },
  );

  function finishDelivery() {
    clearTimeout(deliveryTimer);
    clearTimeout(statusTimer);
    delivery.classList.add("is-leaving");
    delivery.setAttribute("aria-hidden", "true");
    cardScene.classList.add("is-visible");
    cardScene.setAttribute("aria-hidden", "false");
    later(() => burst(190), 220);
    later(() => openButton.focus(), 720);
  }

  function scheduleBirthdayTune() {
    if (!isPlaying || !audioContext) return;
    audioContext =
      audioContext || new (window.AudioContext || window.webkitAudioContext)();

    const notes = [
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

    let start = audioContext.currentTime;
    notes.forEach(([frequency, duration]) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + duration);
      start += duration + 0.035;
    });

    tuneTimer = later(
      scheduleBirthdayTune,
      (start - audioContext.currentTime + 0.6) * 1000,
    );
  }

  function startMusic() {
    if (isPlaying) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    isPlaying = true;
    musicButton.classList.remove("is-paused");
    musicButton.querySelector(".mini-disc__status").textContent =
      "Nhạc đang phát";
    musicButton.setAttribute("aria-label", "Tạm dừng nhạc");
    musicButton.setAttribute("aria-pressed", "false");
    scheduleBirthdayTune();
  }

  function stopMusic() {
    isPlaying = false;
    clearTimeout(tuneTimer);
    if (audioContext) audioContext.close();
    audioContext = null;
    musicButton.classList.add("is-paused");
    musicButton.querySelector(".mini-disc__status").textContent =
      "Nhạc đã dừng";
    musicButton.setAttribute("aria-label", "Phát nhạc");
    musicButton.setAttribute("aria-pressed", "true");
  }

  function toggleMusic() {
    if (isPlaying) stopMusic();
    else startMusic();
  }

  openButton.addEventListener("click", openCard, { signal });
  musicButton.addEventListener("click", toggleMusic, { signal });
  skipDelivery.addEventListener("click", finishDelivery, { signal });
  openWishButton.addEventListener("click", openWishSpace, { signal });
  closeWishButton.addEventListener("click", closeWishSpace, { signal });
  prepareWishButton.addEventListener("click", prepareWish, { signal });
  micButton.addEventListener("click", listenForBlow, { signal });
  flameButton.addEventListener("click", extinguishWish, { signal });
  tapHintButton.addEventListener("click", extinguishWish, { signal });
  wishStar.addEventListener("click", toggleWishMemory, { signal });
  viewStarButton.addEventListener(
    "click",
    () => {
      wishMemory.hidden = false;
      wishStar.focus();
    },
    { signal },
  );
  wishInput.addEventListener(
    "input",
    () => {
      wishInput.setCustomValidity("");
      wishCount.textContent = wishInput.value.length;
    },
    { signal },
  );
  document.addEventListener("keydown", trapWishFocus, { signal });
  window.addEventListener("pagehide", () => stopMicrophone(false), { signal });
  window.addEventListener("resize", resizeCanvas, { signal });
  resizeCanvas();
  animationId = requestAnimationFrame(drawConfetti);

  if (initialGuest) {
    recipientName.textContent = initialGuest.fullName;
    birthdayLine.textContent = formatBirthday(initialGuest.birthDate);
    fromLabel.textContent = initialGuest.fromPlace || defaultFromPlace;
    toLabel.textContent = initialGuest.toPlace || defaultToPlace;
    welcome.classList.add("is-leaving");
    delivery.classList.add("is-visible");
    delivery.setAttribute("aria-hidden", "false");
    statusTimer = later(() => {
      deliveryStatus.textContent = `Đang đến gần ${initialGuest.toPlace || defaultToPlace}...`;
    }, 3900);
    deliveryTimer = later(finishDelivery, 6200);
  } else if (
    new URLSearchParams(window.location.search).get("view") === "card"
  ) {
    try {
      const guest = JSON.parse(sessionStorage.getItem("birthdayGuest") || "{}");
      if (guest.fullName) recipientName.textContent = guest.fullName;
      if (guest.birthDate)
        birthdayLine.textContent = formatBirthday(guest.birthDate);
      if (guest.fromPlace) fromLabel.textContent = guest.fromPlace;
      if (guest.toPlace) toLabel.textContent = guest.toPlace;
    } catch {}
    welcome.classList.add("is-leaving");
    delivery.setAttribute("aria-hidden", "true");
    cardScene.classList.add("is-visible");
    cardScene.setAttribute("aria-hidden", "false");
    later(openCard, 120);
  }

  return () => {
    abortController.abort();
    timers.forEach((timer) => clearTimeout(timer));
    cancelAnimationFrame(animationId);
    cancelAnimationFrame(micAnimationId);
    stopMicrophone(false);
    stopMusic();
    document.body.style.overflow = "";
  };
}
