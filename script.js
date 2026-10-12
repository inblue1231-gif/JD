// 스크롤 위치 → 시각 → 구간·곡을 계산해서 HUD를 갱신한다.
// 화면에 나오는 숫자와 곡명은 전부 data.js의 window.CONCERT에서 읽는다.
(function () {
  const C = window.CONCERT;
  const STAR = "M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z";
  const MAX_SCORE = 5;
  const TITLE_HOLD_MS = 1500; // 구간 제목이 가운데 머무는 시간
  const SONG_SCROLL = 0.4; // 곡 하나가 차지하는 스크롤 길이 (화면 높이의 배수)

  // 인트로: 무대에서 본 객석 사진(venue.jpg) → 내 자리로 줌 → 1인칭 화면으로 전환
  const INTRO_SCROLL = 2; // 인트로가 차지하는 스크롤 길이 (화면 높이의 배수)
  const INTRO_GLIDE_MS = 2600; // → 키로 인트로를 넘길 때 걸리는 시간
  const PHOTO = { w: 4096, h: 2731, x: 1323, y: 1672 }; // 사진 원본 크기와 내 자리 (px)
  const ME_SIZE = 0.03; // 흰 원 지름 = 사진 가로의 3%
  const MAX_ZOOM = 4; // 이보다 크게 확대하면 화질이 깨진다

  const $ = (id) => document.getElementById(id);

  const toMin = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const toClock = (min) => {
    const m = Math.floor(min);
    return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  };
  const approx = (text, isApprox) => (isApprox ? "약 " + text : text);

  // ---------- 데이터 준비 ----------

  const dayStart = toMin(C.meta.dayStart);
  const dayEnd = toMin(C.meta.dayEnd);

  const segments = C.segments.map((seg) => {
    const t0 = toMin(seg.start);
    const t1 = toMin(seg.end);
    return { ...seg, t0, t1, timeline: buildTimeline(seg, t0, t1) };
  });
  const N = segments.length;

  // 구간별 스크롤 길이(화면 높이의 배수). 곡이 많은 구간은 곡 수만큼 길어진다.
  const lengths = segments.map((seg) => Math.max(1, seg.timeline.length * SONG_SCROLL));
  const offsets = [0];
  lengths.forEach((len) => offsets.push(offsets[offsets.length - 1] + len));
  const totalLength = offsets[N];

  // 곡별 시작 시각은 기록이 없다. time이 있는 곡을 기준점으로 고정하고
  // 그 사이의 곡은 순서대로 같은 간격으로 나눈다.
  function buildTimeline(seg, t0, t1) {
    const items = (seg.songs || []).map((s) => (typeof s === "string" ? { title: s } : s));
    if (!items.length) return [];

    const anchors = [];
    if (!items[0].time) anchors.push([0, t0]);
    items.forEach((s, i) => { if (s.time) anchors.push([i, toMin(s.time)]); });
    anchors.push([items.length, t1]);

    const out = [];
    for (let a = 0; a < anchors.length - 1; a++) {
      const [i0, ta] = anchors[a];
      const [i1, tb] = anchors[a + 1];
      for (let i = i0; i < i1; i++) {
        out.push({ ...items[i], at: ta + ((tb - ta) * (i - i0)) / (i1 - i0) });
      }
    }
    return out;
  }

  // ---------- 처음 한 번만 그리는 것 ----------

  $("meta-date").textContent = C.meta.date;
  $("meta-venue").textContent = C.meta.venue;
  $("scroll-space").style.height = (INTRO_SCROLL + totalLength + 1) * 100 + "vh";
  $("intro-title").textContent = [C.meta.artist + " " + C.meta.tour, C.meta.date, C.meta.venue].join(" / ");
  $("intro-seat").textContent = C.meta.seat;

  document.querySelectorAll(".stars").forEach((box) => {
    for (let i = 0; i < MAX_SCORE; i++) {
      box.insertAdjacentHTML("beforeend", `<svg viewBox="0 0 24 24"><path d="${STAR}"/></svg>`);
    }
  });

  for (let i = 0; i < MAX_SCORE; i++) {
    $("rings").insertAdjacentHTML("beforeend", `<div class="ring" style="--i:${i}"></div>`);
  }

  // 진행 바 눈금: 구간 경계를 실제 시간 비율로
  const ratio = (min) => ((min - dayStart) / (dayEnd - dayStart)) * 100;
  segments.forEach((seg, i) => {
    const isApprox = seg.startApprox || (i > 0 && segments[i - 1].endApprox);
    addTick(seg.t0, approx(seg.start, isApprox), i);
  });
  addTick(dayEnd, approx(C.meta.dayEnd, segments[N - 1].endApprox), N);

  function addTick(min, label, i) {
    const cls = ["bar-tick", i % 2 ? "row2" : "", i === 0 ? "first" : "", i === N ? "last" : ""].join(" ");
    $("bar-ticks").insertAdjacentHTML(
      "beforeend",
      `<div class="${cls}" style="left:${ratio(min)}%"><span>${label}</span></div>`
    );
  }

  // ---------- 스크롤 → 현재 상태 ----------

  // 곡이 있는 구간은 곡마다 같은 스크롤 길이를 주고, 그 안에서 시각이 흐른다.
  // 곡이 없는 구간은 시작~끝 시각을 스크롤 비율로 나눈다.
  const scrollMax = () => document.documentElement.scrollHeight - window.innerHeight;

  function readScroll() {
    const max = scrollMax();
    const u = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) * (INTRO_SCROLL + totalLength) : 0;
    const intro = Math.min(u / INTRO_SCROLL, 1); // 인트로 진행도. 1이면 인트로가 끝난 상태
    const p = Math.max(u - INTRO_SCROLL, 0);
    let index = N - 1;
    while (index > 0 && offsets[index] > p) index--;
    const frac = Math.min((p - offsets[index]) / lengths[index], 1);
    const seg = segments[index];

    const n = seg.timeline.length;
    if (!n) return { intro, index, frac, seg, item: null, time: seg.t0 + frac * (seg.t1 - seg.t0) };

    const k = Math.min(Math.floor(frac * n), n - 1);
    const from = seg.timeline[k].at;
    const to = k + 1 < n ? seg.timeline[k + 1].at : seg.t1;
    return { intro, index, frac, seg, item: seg.timeline[k], time: from + (frac * n - k) * (to - from) };
  }

  let now = null;
  let shownSeg = -1;
  let shownSong = null;
  let titleTimer = null;
  let wasIntro = false;

  function update() {
    now = readScroll();
    const inIntro = now.intro < 1;
    renderIntro(now.intro);

    // 인트로 동안에는 구간 제목을 띄우지 않고, 인트로가 끝나는 순간에 띄운다
    if (now.index !== shownSeg) {
      shownSeg = now.index;
      renderSegment(now.seg, !inIntro);
    } else if (wasIntro && !inIntro) {
      showTitle(now.seg);
    }
    wasIntro = inIntro;

    renderSong(now.seg, now.item);
    renderBar(now.seg, now.time);
    swingHand(now.seg);
  }

  function renderSegment(seg, withTitle) {
    renderStars($("score-see"), seg.see);
    renderStars($("score-play"), seg.play);

    const sat = seg.satisfaction;
    $("sat").classList.toggle("is-null", sat === null);
    $("sat-num").textContent = sat === null ? "—" : sat;
    document.querySelectorAll(".ring").forEach((ring, i) => {
      ring.classList.toggle("on", sat !== null && i < sat);
    });

    // 아직 평가 범위 밖(도착·입장)인 구간은 무대를 더 어둡게
    document.documentElement.style.setProperty("--dim", seg.see === null ? 0.75 : 0.35);

    $("todo-crowd-l").textContent = $("todo-crowd-r").textContent = seg.crowd ? "· " + seg.crowd : "";
    $("todo-karaoke").hidden = seg.screen !== "karaoke";

    if (withTitle) showTitle(seg);
    changeHand(seg);
  }

  function renderStars(el, value) {
    el.classList.toggle("is-null", value === null);
    el.querySelectorAll("svg").forEach((star, i) => {
      star.classList.toggle("on", value !== null && i < value);
    });
  }

  // 가운데에 크게 등장 → 잠시 뒤 작아지며 오른쪽 위(곡 알약 아래)로
  function showTitle(seg) {
    const el = $("seg-title");
    $("seg-title-time").textContent = approx(seg.start, seg.startApprox);
    $("seg-title-name").textContent = seg.nameEn;

    el.classList.add("snap");
    el.classList.remove("big");
    void el.offsetWidth;
    el.classList.add("big");
    void el.offsetWidth;
    el.classList.remove("snap");

    clearTimeout(titleTimer);
    titleTimer = setTimeout(() => el.classList.remove("big"), TITLE_HOLD_MS);
  }

  function renderSong(seg, current) {
    const key = seg.id + "/" + (current ? seg.timeline.indexOf(current) : "-");
    if (key === shownSong) return;
    shownSong = key;

    // VCR·MC처럼 type이 있는 항목과 곡이 없는 구간은 곡이 아닌 상태로 표시
    const isSong = current !== null && !current.type;
    $("song").classList.toggle("no-song", !isSong);
    $("song-title").textContent = current ? current.title : seg.name;
    $("song-artist").textContent = "-" + C.meta.artist;
  }

  function renderBar(seg, time) {
    const left = ratio(time) + "%";
    $("bar-fill").style.width = left;
    $("bar-head").style.left = left;
    $("bar-head").textContent = toClock(time) + " " + seg.name;
  }

  // ---------- 인트로 ----------

  const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
  const phase = (q, from, to) => clamp01((q - from) / (to - from)); // q가 from~to를 지나는 동안 0→1
  const ease = (t) => t * t * (3 - 2 * t);

  // q = 인트로 진행도(0~1). 스크롤 위치로만 정해지므로 거꾸로 올리면 그대로 되감긴다.
  //   0    ~ 0.55  원 중심을 화면 가운데로 끌어오며 줌 (1배 → MAX_ZOOM배)
  //   0.55 ~ 0.65  흰 원 안쪽이 1인칭 화면으로 바뀜
  //   0.65 ~ 0.92  원이 커지며 화면 전체가 됨
  //   0.92 ~ 1     HUD 등장
  function renderIntro(q) {
    const stage = $("stage");
    const done = q >= 1;
    stage.classList.toggle("intro-on", !done);
    $("intro").hidden = done;
    $("intro-me").hidden = done;
    if (done) {
      stage.style.clipPath = "";
      return;
    }

    // object-fit: cover와 같은 배치를 직접 계산한다 (잘리는 양까지 알아야 원 위치가 맞는다)
    const W = window.innerWidth;
    const H = window.innerHeight;
    const scale = Math.max(W / PHOTO.w, H / PHOTO.h);
    const photoW = PHOTO.w * scale;
    const photoH = PHOTO.h * scale;
    const left = (W - photoW) / 2;
    const top = (H - photoH) / 2;
    const meX = left + PHOTO.x * scale;
    const meY = top + PHOTO.y * scale;

    const photo = $("intro-photo");
    photo.style.left = left + "px";
    photo.style.top = top + "px";
    photo.style.width = photoW + "px";
    photo.style.height = photoH + "px";

    const zoomed = ease(phase(q, 0, 0.55));
    const zoom = 1 + (MAX_ZOOM - 1) * zoomed;
    const x = meX + (W / 2 - meX) * zoomed; // 지금 화면에서 원의 중심
    const y = meY + (H / 2 - meY) * zoomed;
    $("intro-zoom").style.transform = `translate(${x - meX * zoom}px, ${y - meY * zoom}px) scale(${zoom})`;

    const small = (ME_SIZE * photoW * zoom) / 2;
    const full = Math.hypot(Math.max(x, W - x), Math.max(y, H - y));
    const grow = phase(q, 0.65, 0.92);
    const radius = small + (full - small) * grow * grow;

    const me = $("intro-me");
    me.style.left = x + "px";
    me.style.top = y + "px";
    me.style.width = me.style.height = radius * 2 + "px";
    me.style.setProperty("--fill", 1 - phase(q, 0.55, 0.65));
    me.style.setProperty("--ring", 1 - phase(q, 0.85, 0.92));

    const text = 1 - phase(q, 0, 0.15);
    $("intro-title").style.opacity = text;
    $("intro-me-label").style.opacity = text;

    stage.style.clipPath = q < 0.55 ? "circle(0px)" : `circle(${radius}px at ${x}px ${y}px)`;
    stage.style.setProperty("--hud", phase(q, 0.92, 1));
  }

  // ---------- 내 손 ----------

  // 응원봉: 공식 디자인이 아닌 단순한 막대 + 둥근 머리. 손잡이는 주먹 뒤로 들어간다.
  const LIGHTSTICK =
    '<svg class="hand-stick" viewBox="0 0 200 300" aria-hidden="true">' +
    '<rect class="stick-body" x="85" y="30" width="30" height="110" rx="6"/>' +
    '<circle class="stick-body" cx="100" cy="0" r="48"/>' +
    '<circle class="stick-light" cx="100" cy="0" r="42"/>' +
    '<path class="stick-body" d="M100 -24 L128 -3 H118 V22 H82 V-3 H72 Z"/>' +
    "</svg>";

  // hand 값 → 손에 든 물건. 빈 문자열은 빈 손. 새 물건은 여기에 추가한다.
  const HAND_ITEMS = {
    badge: '<img class="hand-badge" src="assets/badge.png" alt="">',
    phone: "",
    "lightstick-gentle": LIGHTSTICK,
    "lightstick-big": LIGHTSTICK,
    "lightstick-jump": LIGHTSTICK,
  };
  const HAND_SWAP_MS = 400; // 손이 내려가 있는 동안 물건을 바꾼다 (style.css의 전환 시간과 같게)

  let handTimer = null;

  // 손을 내렸다가 새 물건을 들고 다시 올린다. hand가 null이면 내린 채로 둔다.
  function changeHand(seg) {
    const el = $("hand");
    el.classList.add("down");
    clearTimeout(handTimer);
    handTimer = setTimeout(() => {
      el.classList.remove("offering");
      if (!seg.hand) return;

      const item = $("hand-item");
      item.innerHTML = HAND_ITEMS[seg.hand] || "";
      const img = item.querySelector("img");
      // 이미지가 없으면 단순한 원형 뱃지로
      if (img) img.onerror = () => { item.innerHTML = '<span class="hand-badge"></span>'; };

      // 서로를 향하는 구간(나눔)에서는 옆으로 내미는 동작
      el.classList.toggle("offering", seg.crowd === "facing-each-other");
      el.classList.remove("down");
    }, HAND_SWAP_MS);
  }

  // hand 값 → 스크롤할 때 흔드는 정도. angle은 좌우 기울기(도), bounce는 위로 뛰는 높이(rem)
  const HAND_SWING = {
    "lightstick-gentle": { angle: 14, bounce: 0 },
    "lightstick-big": { angle: 22, bounce: 0 },
    "lightstick-jump": { angle: 22, bounce: 2.5 },
  };
  const SWING_SCROLL = 70; // 클수록 같은 스크롤에 천천히 흔들린다 (px)
  const SWING_REST_MS = 250; // 스크롤이 멈춘 뒤 가운데로 돌아오기까지

  let swingTimer = null;

  // 스크롤 위치에 따라 좌우로 기울인다. 스크롤이 멈추면 가운데로 돌아온다.
  function swingHand(seg) {
    const swing = HAND_SWING[seg.hand];
    const wave = swing ? Math.sin(window.scrollY / SWING_SCROLL) : 0;
    setSwing(swing ? wave * swing.angle : 0, swing ? -Math.abs(wave) * swing.bounce : 0);

    clearTimeout(swingTimer);
    swingTimer = setTimeout(() => setSwing(0, 0), SWING_REST_MS);
  }

  function setSwing(angle, bounce) {
    $("hand").style.setProperty("--swing", angle + "deg");
    $("hand").style.setProperty("--bounce", bounce + "rem");
  }

  // ---------- 키보드 ← → : 구간 단위 이동 ----------

  let navTarget = 0;
  let navAt = -Infinity;

  function go(dir) {
    const t = performance.now();
    let target;
    const fromIntro = now.intro < 1;
    if (t - navAt < 700) {
      target = navTarget + dir; // 이동 중에 연달아 누른 경우
    } else if (fromIntro) {
      target = dir > 0 ? 0 : -1;
    } else if (dir > 0) {
      target = now.index + 1;
    } else {
      target = now.frac > 0.02 ? now.index : now.index - 1;
    }
    navTarget = Math.min(Math.max(target, -1), N); // -1 = 인트로 맨 처음
    navAt = t;

    const max = scrollMax();
    const top = navTarget < 0 ? 0 : Math.ceil(((INTRO_SCROLL + offsets[navTarget]) / (INTRO_SCROLL + totalLength)) * max);
    stopGlide();
    // 인트로를 지나는 이동은 줌과 전환이 보이도록 천천히
    if (fromIntro || navTarget < 0) glideTo(Math.min(top, max), INTRO_GLIDE_MS);
    else window.scrollTo({ top: Math.min(top, max), behavior: "smooth" });
  }

  let glideFrame = null;
  const stopGlide = () => cancelAnimationFrame(glideFrame);

  function glideTo(top, ms) {
    const from = window.scrollY;
    const startedAt = performance.now();
    const step = (t) => {
      const k = clamp01((t - startedAt) / ms);
      window.scrollTo({ top: from + (top - from) * ease(k), behavior: "instant" });
      if (k < 1) glideFrame = requestAnimationFrame(step);
    };
    glideFrame = requestAnimationFrame(step);
  }

  // 직접 스크롤하면 자동 이동을 멈춘다
  window.addEventListener("wheel", stopGlide, { passive: true });
  window.addEventListener("touchstart", stopGlide, { passive: true });

  window.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    go(e.key === "ArrowRight" ? 1 : -1);
  });

  // ---------- 진행 바 클릭·드래그 : 그 시각으로 이동 ----------

  // readScroll의 반대 방향: 시각 → 스크롤 위치
  function scrollTopFor(time) {
    let index = N - 1;
    while (index > 0 && segments[index].t0 > time) index--;
    const seg = segments[index];
    const n = seg.timeline.length;

    let frac;
    if (!n) {
      frac = (time - seg.t0) / (seg.t1 - seg.t0);
    } else {
      let k = n - 1;
      while (k > 0 && seg.timeline[k].at > time) k--;
      const from = seg.timeline[k].at;
      const to = k + 1 < n ? seg.timeline[k + 1].at : seg.t1;
      frac = (k + (time - from) / (to - from)) / n;
    }
    frac = Math.min(Math.max(frac, 0), 1);
    return ((INTRO_SCROLL + offsets[index] + frac * lengths[index]) / (INTRO_SCROLL + totalLength)) * scrollMax();
  }

  const bar = $("bar");

  function seekTo(e) {
    const box = bar.getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - box.left) / box.width, 0), 1);
    window.scrollTo({ top: scrollTopFor(dayStart + x * (dayEnd - dayStart)), behavior: "instant" });
  }

  bar.addEventListener("pointerdown", (e) => {
    bar.setPointerCapture(e.pointerId);
    bar.classList.add("dragging");
    seekTo(e);
  });
  bar.addEventListener("pointermove", (e) => {
    if (bar.hasPointerCapture(e.pointerId)) seekTo(e);
  });
  const endDrag = () => bar.classList.remove("dragging");
  bar.addEventListener("pointerup", endDrag);
  bar.addEventListener("pointercancel", endDrag);

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
