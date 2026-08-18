export function initWishesExperience(root) {
  const controller = new AbortController();
  const { signal } = controller;
  const timers = new Set();
  const later = (callback, delay) => {
    const timer = window.setTimeout(() => { timers.delete(timer); callback(); }, delay);
    timers.add(timer);
  };
  const find = selector => root.querySelector(selector);
  const stars = find('#stars');
  const wishPanel = find('#wishPanel');
  const writeStep = find('#wishWriteStep');
  const candleStep = find('#wishCandleStep');
  const sentStep = find('#wishSentStep');
  const input = find('#wishInput');
  const count = find('#wishCount');
  const prepareButton = find('#prepareWishButton');
  const cake = find('#wishCake');
  const flameButton = find('#flameButton');
  const micButton = find('#micButton');
  const tapButton = find('#tapHintButton');
  const status = find('#blowStatus');
  const wishStar = find('#wishStar');
  const memory = find('#wishMemory');
  const viewButton = find('#viewStarButton');
  const homeLink = find('#homeLink');
  let activeWish = '';
  let micStream;
  let micContext;
  let micAnimationId;
  try { activeWish = sessionStorage.getItem('birthdayWish') || ''; } catch {}

  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 280; index += 1) {
    const star = document.createElement('i');
    star.style.setProperty('--x', `${Math.random() * 100}%`);
    star.style.setProperty('--y', `${Math.random() * 100}%`);
    star.style.setProperty('--size', `${1 + Math.random() * 2.2}px`);
    star.style.setProperty('--alpha', `${.38 + Math.random() * .55}`);
    star.style.setProperty('--speed', `${1.5 + Math.random() * 3}s`);
    star.style.setProperty('--delay', `${Math.random() * -4}s`);
    fragment.appendChild(star);
  }
  stars.appendChild(fragment);

  function stopMicrophone() {
    cancelAnimationFrame(micAnimationId);
    if (micStream) micStream.getTracks().forEach(track => track.stop());
    if (micContext && micContext.state !== 'closed') micContext.close();
    micStream = null;
    micContext = null;
    micButton.disabled = false;
    micButton.textContent = '◉ Bật micro & thổi';
  }

  function prepareWish() {
    const value = input.value.trim();
    if (!value) {
      input.setCustomValidity('Hãy viết một điều ước trước khi thắp nến.');
      input.reportValidity();
      input.focus();
      return;
    }
    input.setCustomValidity('');
    activeWish = value;
    try { sessionStorage.setItem('birthdayWish', value); } catch {}
    writeStep.hidden = true;
    candleStep.hidden = false;
    later(() => flameButton.focus(), 60);
  }

  function extinguishWish() {
    if (cake.classList.contains('is-out')) return;
    cake.classList.add('is-out');
    flameButton.disabled = true;
    tapButton.disabled = true;
    micButton.disabled = true;
    status.textContent = 'Ngọn nến đã tắt. Điều ước đang bay lên...';
    stopMicrophone();
    const starX = 22 + Math.random() * 56;
    const starY = 12 + Math.random() * 25;
    const travelX = (starX / 100 - .5) * window.innerWidth;
    const travelY = (starY / 100 - .68) * window.innerHeight;
    const trailAngle = Math.atan2(-travelY, -travelX) * 180 / Math.PI - 90;
    wishStar.style.setProperty('--star-x', `${starX}%`);
    wishStar.style.setProperty('--star-y', `${starY}%`);
    wishStar.style.setProperty('--trail-angle', `${trailAngle}deg`);
    later(() => {
      wishPanel.classList.add('is-fading');
      wishStar.hidden = false;
      wishStar.classList.add('is-flying');
    }, 650);
    later(() => {
      wishStar.classList.remove('is-flying');
      candleStep.hidden = true;
      sentStep.hidden = false;
      wishPanel.classList.remove('is-fading');
      memory.textContent = `“${activeWish}”`;
      viewButton.focus();
    }, 3000);
  }

  async function listenForBlow() {
    if (!navigator.mediaDevices?.getUserMedia) {
      status.textContent = 'Thiết bị không hỗ trợ microphone. Bạn vẫn có thể chạm vào ngọn nến.';
      return;
    }
    micButton.disabled = true;
    micButton.textContent = 'Đang xin quyền micro...';
    status.textContent = 'Hãy cho phép dùng microphone để thổi nến.';
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = micContext.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = .25;
      micContext.createMediaStreamSource(micStream).connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      const baselineValues = [];
      const calibrationEndsAt = performance.now() + 850;
      let baseline = .025;
      let loudFrames = 0;
      micButton.textContent = 'Micro đang nghe...';
      status.textContent = 'Giữ yên một chút để nhận biết âm thanh nền...';
      const measure = now => {
        analyser.getByteTimeDomainData(samples);
        let energy = 0;
        for (const sample of samples) {
          const normalized = (sample - 128) / 128;
          energy += normalized * normalized;
        }
        const rms = Math.sqrt(energy / samples.length);
        if (now < calibrationEndsAt) baselineValues.push(rms);
        else {
          if (baselineValues.length) {
            baseline = baselineValues.reduce((sum, value) => sum + value, 0) / baselineValues.length;
            baselineValues.length = 0;
            status.textContent = 'Micro đã sẵn sàng — hãy thổi đều vào điện thoại.';
          }
          const threshold = Math.max(.075, baseline * 2.7);
          loudFrames = rms > threshold ? loudFrames + 1 : Math.max(0, loudFrames - 2);
          if (loudFrames >= 10) return extinguishWish();
        }
        micAnimationId = requestAnimationFrame(measure);
      };
      micAnimationId = requestAnimationFrame(measure);
    } catch {
      stopMicrophone();
      status.textContent = 'Không thể dùng microphone. Bạn vẫn có thể chạm vào ngọn nến.';
    }
  }

  if (activeWish) { input.value = activeWish; count.textContent = activeWish.length; }
  prepareButton.addEventListener('click', prepareWish, { signal });
  input.addEventListener('input', () => { input.setCustomValidity(''); count.textContent = input.value.length; }, { signal });
  micButton.addEventListener('click', listenForBlow, { signal });
  flameButton.addEventListener('click', extinguishWish, { signal });
  tapButton.addEventListener('click', extinguishWish, { signal });
  wishStar.addEventListener('click', () => { memory.hidden = !memory.hidden; }, { signal });
  viewButton.addEventListener('click', () => { memory.hidden = false; wishStar.focus(); }, { signal });
  homeLink.addEventListener('click', () => { try { sessionStorage.removeItem('birthdayWish'); } catch {} }, { signal });

  return () => {
    controller.abort();
    timers.forEach(timer => clearTimeout(timer));
    stopMicrophone();
  };
}
