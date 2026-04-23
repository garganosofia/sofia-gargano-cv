(() => {
  "use strict";

  const STORAGE_KEY = "trainerTimer.config.v2";

  const I18N = {
    es: {
      langCode: "es-ES",
      skip: "Ir al contenido",
      home: "Inicio",
      back: "Volver al sitio principal",
      appTitle: "Cronómetro de entrenador",
      fullscreen: "Pantalla completa",
      start: "Iniciar",
      pause: "Pausar",
      resume: "Reanudar",
      reset: "Reiniciar",
      "settings.title": "Configuración",
      "settings.alerts": "Avisos",
      "field.work": "Trabajo (serie)",
      "field.rest": "Descanso",
      "field.alert": "Aviso (alarma antes de terminar)",
      "field.alertHelp": "0 = sin aviso. Suena un pitido medio y la voz dice \"Aviso\" antes de cambiar de fase.",
      "field.rounds": "Series",
      "field.prep": "Preparación inicial",
      "field.prepHelp": "En los últimos 3 segundos, la voz dice \"tres, dos, uno\".",
      "unit.sec": "seg",
      "toggle.voice": "Voz",
      "toggle.beep": "Pitido",
      "toggle.vibrate": "Vibrar",
      "toggle.wake": "Pantalla activa",
      "voice.label": "Voz del narrador",
      "voice.test": "Probar voz",
      "voice.help": "Se elige automáticamente la mejor voz disponible para el idioma. Podés cambiarla acá.",
      "voice.auto": "Automática (mejor disponible)",
      "presets.title": "Presets rápidos",
      "preset.strength": "Fuerza 60/30 ×6",
      footer: "Cronómetro 100% en el navegador · sin registro · Sofía Gárgano",
      "phase.idle": "Listo",
      "phase.prep": "Preparación",
      "phase.work": "Trabajo",
      "phase.rest": "Descanso",
      "phase.done": "Fin",
      "round.idle": (rounds) => `Serie 0 / ${rounds}`,
      "round.prep": (total) => `Preparación · próxima serie 1 / ${total}`,
      "round.active": (current, total) => `Serie ${current} / ${total}`,
      "round.done": (total) => `Completado · ${total} series`,
      "hint.idle": "Configurá los tiempos y tocá Iniciar.",
      "hint.running": "En curso.",
      "hint.paused": "Pausado.",
      "hint.done": "Buen trabajo. Presioná Reiniciar para volver a configurar.",
      "voice.starting": "Empezando",
      "voice.three": "tres",
      "voice.two": "dos",
      "voice.one": "uno",
      "voice.work": (round) => `Trabajo, serie ${round}`,
      "voice.rest": "Descanso",
      "voice.alert": "Aviso",
      "voice.done": "Entrenamiento finalizado",
      "voice.test.sample": "Trabajo, serie tres. Descanso. Aviso.",
      "preset.tabata": "Tabata 20/10 ×8",
      "preset.hiit": "HIIT 40/20 ×10",
      "preset.emom": "EMOM 30/30 ×12"
    },
    en: {
      langCode: "en-US",
      skip: "Skip to content",
      home: "Home",
      back: "Back to main site",
      appTitle: "Coach interval timer",
      fullscreen: "Fullscreen",
      start: "Start",
      pause: "Pause",
      resume: "Resume",
      reset: "Reset",
      "settings.title": "Settings",
      "settings.alerts": "Cues",
      "field.work": "Work (set)",
      "field.rest": "Rest",
      "field.alert": "Alert (warning before phase end)",
      "field.alertHelp": "0 = no warning. A mid-pitch beep plays and the voice says \"Alert\" before the phase changes.",
      "field.rounds": "Sets",
      "field.prep": "Initial prep",
      "field.prepHelp": "In the last 3 seconds the voice counts \"three, two, one\".",
      "unit.sec": "sec",
      "toggle.voice": "Voice",
      "toggle.beep": "Beep",
      "toggle.vibrate": "Vibrate",
      "toggle.wake": "Keep screen on",
      "voice.label": "Narrator voice",
      "voice.test": "Test voice",
      "voice.help": "The best available voice for the language is picked automatically. You can change it here.",
      "voice.auto": "Automatic (best available)",
      "presets.title": "Quick presets",
      "preset.strength": "Strength 60/30 ×6",
      footer: "100% in-browser · no sign-up · Sofía Gárgano",
      "phase.idle": "Ready",
      "phase.prep": "Get ready",
      "phase.work": "Work",
      "phase.rest": "Rest",
      "phase.done": "Done",
      "round.idle": (rounds) => `Set 0 / ${rounds}`,
      "round.prep": (total) => `Get ready · next set 1 / ${total}`,
      "round.active": (current, total) => `Set ${current} / ${total}`,
      "round.done": (total) => `Completed · ${total} sets`,
      "hint.idle": "Set the times and tap Start.",
      "hint.running": "Running.",
      "hint.paused": "Paused.",
      "hint.done": "Great job. Press Reset to configure again.",
      "voice.starting": "Starting in",
      "voice.three": "three",
      "voice.two": "two",
      "voice.one": "one",
      "voice.work": (round) => `Work, set ${round}`,
      "voice.rest": "Rest",
      "voice.alert": "Alert",
      "voice.done": "Workout complete",
      "voice.test.sample": "Work, set three. Rest. Alert.",
      "preset.tabata": "Tabata 20/10 ×8",
      "preset.hiit": "HIIT 40/20 ×10",
      "preset.emom": "EMOM 30/30 ×12"
    }
  };

  const PHASE_KEYS = {
    IDLE: "idle",
    PREP: "prep",
    WORK: "work",
    REST: "rest",
    DONE: "done"
  };

  const PHASE_BODY = {
    idle: "",
    prep: "prep",
    work: "work",
    rest: "rest",
    done: "done"
  };

  const els = {
    body: document.body,
    html: document.documentElement,
    phase: document.getElementById("phaseLabel"),
    round: document.getElementById("roundLabel"),
    clock: document.getElementById("clock"),
    bar: document.getElementById("barFill"),
    timerCard: document.querySelector(".timer"),
    hint: document.getElementById("hintLabel"),
    startBtn: document.getElementById("startBtn"),
    startBtnText: document.getElementById("startBtnText"),
    resetBtn: document.getElementById("resetBtn"),
    fullscreenBtn: document.getElementById("fullscreenBtn"),
    work: document.getElementById("workTime"),
    rest: document.getElementById("restTime"),
    alert: document.getElementById("alertTime"),
    rounds: document.getElementById("rounds"),
    prep: document.getElementById("prepTime"),
    voiceOn: document.getElementById("voiceOn"),
    beepOn: document.getElementById("beepOn"),
    vibrateOn: document.getElementById("vibrateOn"),
    wakeOn: document.getElementById("wakeOn"),
    voiceSelect: document.getElementById("voiceSelect"),
    testVoiceBtn: document.getElementById("testVoiceBtn"),
    langButtons: document.querySelectorAll("[data-lang]")
  };

  const state = {
    lang: detectInitialLang(),
    isRunning: false,
    isPaused: false,
    phase: PHASE_KEYS.IDLE,
    currentRound: 0,
    totalRounds: 0,
    phaseStart: 0,
    phaseDuration: 0,
    pausedRemaining: 0,
    rafId: null,
    alertFiredFor: null,
    countdownFiredFor: null,
    wakeLock: null,
    voiceURI: null,
    availableVoices: []
  };

  let audioCtx = null;
  let audioUnlocked = false;
  let silentLoop = null;

  function detectInitialLang() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved.lang === "es" || saved.lang === "en") return saved.lang;
    } catch (_) { /* noop */ }
    const nav = (navigator.language || "es").toLowerCase();
    return nav.startsWith("en") ? "en" : "es";
  }

  function t(key, ...args) {
    const dict = I18N[state.lang] || I18N.es;
    const value = dict[key];
    if (typeof value === "function") return value(...args);
    if (value === undefined) return key;
    return value;
  }

  const ensureAudio = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) {
      try { audioCtx = new AC(); } catch (_) { return null; }
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => { /* noop */ });
    }
    return audioCtx;
  };

  function unlockAudio() {
    const ctx = ensureAudio();
    if (!ctx) return;

    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (_) { /* noop */ }

    if ("speechSynthesis" in window && !audioUnlocked) {
      try {
        const u = new SpeechSynthesisUtterance(" ");
        u.volume = 0;
        u.rate = 1;
        window.speechSynthesis.speak(u);
      } catch (_) { /* noop */ }
    }

    if (!silentLoop) {
      try {
        silentLoop = new Audio("data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/NCxKYAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxPEAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/zQsT/AAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
        silentLoop.loop = true;
        silentLoop.preload = "auto";
        silentLoop.setAttribute("playsinline", "");
        silentLoop.muted = false;
        silentLoop.volume = 0.001;
        silentLoop.play().catch(() => { /* noop */ });
      } catch (_) { /* noop */ }
    }

    audioUnlocked = true;
  }

  ["pointerdown", "touchstart", "mousedown", "keydown"].forEach((ev) => {
    document.addEventListener(ev, unlockAudio, { capture: true, passive: true });
  });

  const playBeep = ({ frequency, duration, type = "sine", volume = 0.6 }) => {
    if (!els.beepOn.checked) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => { /* noop */ });
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.setValueAtTime(volume, now + duration - 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  };

  const beepFor = (kind) => {
    if (kind === "work")  playBeep({ frequency: 880,  duration: 1.2, type: "sine",     volume: 0.7 });
    if (kind === "rest")  playBeep({ frequency: 392,  duration: 1.4, type: "triangle", volume: 0.65 });
    if (kind === "prep")  playBeep({ frequency: 660,  duration: 0.4, type: "sine",     volume: 0.5 });
    if (kind === "alert") playBeep({ frequency: 1200, duration: 0.6, type: "square",   volume: 0.55 });
    if (kind === "tick")  playBeep({ frequency: 1500, duration: 0.18, type: "sine",    volume: 0.45 });
    if (kind === "done") {
      playBeep({ frequency: 523, duration: 0.3, type: "sine", volume: 0.6 });
      setTimeout(() => playBeep({ frequency: 659, duration: 0.3, type: "sine", volume: 0.6 }), 320);
      setTimeout(() => playBeep({ frequency: 784, duration: 0.9, type: "sine", volume: 0.7 }), 640);
    }
  };

  const VOICE_PREFERENCE = {
    es: [
      "Google español de Estados Unidos",
      "Google español",
      "Microsoft Sabina",
      "Microsoft Helena",
      "Microsoft Laura",
      "Microsoft Pablo",
      "Mónica",
      "Monica",
      "Paulina",
      "Jorge"
    ],
    en: [
      "Google US English",
      "Google UK English Female",
      "Microsoft Aria",
      "Microsoft Jenny",
      "Microsoft Guy",
      "Microsoft Zira",
      "Samantha",
      "Karen",
      "Daniel",
      "Moira"
    ]
  };

  function loadVoices() {
    if (!("speechSynthesis" in window)) return [];
    return window.speechSynthesis.getVoices() || [];
  }

  function pickBestVoice(lang) {
    const voices = state.availableVoices;
    if (!voices.length) return null;
    const prefix = lang === "en" ? "en" : "es";
    const candidates = voices.filter(v => (v.lang || "").toLowerCase().startsWith(prefix));
    const pool = candidates.length ? candidates : voices;

    const preferred = VOICE_PREFERENCE[lang] || [];
    for (const name of preferred) {
      const match = pool.find(v => (v.name || "").toLowerCase().includes(name.toLowerCase()));
      if (match) return match;
    }

    const cloud = pool.find(v => v.localService === false);
    if (cloud) return cloud;

    const female = pool.find(v => /female|mujer|woman|aria|jenny|samantha|monica|m\u00f3nica|paulina|sabina|helena|laura|karen|moira/i.test(v.name || ""));
    if (female) return female;

    return pool[0];
  }

  function refreshVoiceSelect() {
    if (!els.voiceSelect) return;
    state.availableVoices = loadVoices();
    const previous = state.voiceURI || els.voiceSelect.value;
    els.voiceSelect.innerHTML = "";

    const auto = document.createElement("option");
    auto.value = "";
    auto.textContent = t("voice.auto");
    els.voiceSelect.appendChild(auto);

    const groups = { es: [], en: [], other: [] };
    state.availableVoices.forEach(v => {
      const lang = (v.lang || "").toLowerCase();
      if (lang.startsWith("es")) groups.es.push(v);
      else if (lang.startsWith("en")) groups.en.push(v);
      else groups.other.push(v);
    });

    function appendGroup(label, list) {
      if (!list.length) return;
      const og = document.createElement("optgroup");
      og.label = label;
      list.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.voiceURI;
        opt.textContent = `${v.name} — ${v.lang}${v.localService ? "" : " ☁"}`;
        og.appendChild(opt);
      });
      els.voiceSelect.appendChild(og);
    }

    appendGroup("Español", groups.es);
    appendGroup("English", groups.en);
    if (groups.other.length) appendGroup("Otros / Other", groups.other);

    if (previous && state.availableVoices.some(v => v.voiceURI === previous)) {
      els.voiceSelect.value = previous;
    } else {
      els.voiceSelect.value = "";
    }
  }

  function getActiveVoice() {
    if (state.voiceURI) {
      const found = state.availableVoices.find(v => v.voiceURI === state.voiceURI);
      if (found) return found;
    }
    return pickBestVoice(state.lang);
  }

  const speak = (text, opts = {}) => {
    if (!els.voiceOn.checked) return;
    if (!("speechSynthesis" in window)) return;
    try {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      if (!opts.queue) window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const voice = getActiveVoice();
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        utter.lang = I18N[state.lang].langCode;
      }
      utter.rate = opts.rate || 1;
      utter.pitch = opts.pitch || 1;
      utter.volume = opts.volume !== undefined ? opts.volume : 1;
      window.speechSynthesis.speak(utter);
    } catch (_) { /* noop */ }
  };

  const vibrate = (pattern) => {
    if (!els.vibrateOn.checked) return;
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const requestWakeLock = async () => {
    if (!els.wakeOn.checked) return;
    if (!("wakeLock" in navigator)) return;
    try {
      state.wakeLock = await navigator.wakeLock.request("screen");
      state.wakeLock.addEventListener("release", () => { state.wakeLock = null; });
    } catch (_) { /* noop */ }
  };

  const releaseWakeLock = async () => {
    try { if (state.wakeLock) await state.wakeLock.release(); } catch (_) { /* noop */ }
    state.wakeLock = null;
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && state.isRunning && !state.isPaused) {
      requestWakeLock();
    }
  });

  const formatTime = (seconds) => {
    const total = Math.max(0, Math.ceil(seconds));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const readConfig = () => {
    const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
    return {
      work:   clamp(parseInt(els.work.value, 10) || 0, 1, 3600),
      rest:   clamp(parseInt(els.rest.value, 10) || 0, 0, 3600),
      alert:  clamp(parseInt(els.alert.value, 10) || 0, 0, 60),
      rounds: clamp(parseInt(els.rounds.value, 10) || 0, 1, 99),
      prep:   clamp(parseInt(els.prep.value, 10) || 0, 0, 60)
    };
  };

  const persistConfig = () => {
    const cfg = readConfig();
    cfg.voiceOn = els.voiceOn.checked;
    cfg.beepOn = els.beepOn.checked;
    cfg.vibrateOn = els.vibrateOn.checked;
    cfg.wakeOn = els.wakeOn.checked;
    cfg.lang = state.lang;
    cfg.voiceURI = state.voiceURI || "";
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch (_) { /* noop */ }
  };

  const loadConfig = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const cfg = JSON.parse(raw);
      if (cfg.work)   els.work.value = cfg.work;
      if (cfg.rest !== undefined)  els.rest.value = cfg.rest;
      if (cfg.alert !== undefined) els.alert.value = cfg.alert;
      if (cfg.rounds) els.rounds.value = cfg.rounds;
      if (cfg.prep !== undefined) els.prep.value = cfg.prep;
      if (typeof cfg.voiceOn === "boolean") els.voiceOn.checked = cfg.voiceOn;
      if (typeof cfg.beepOn === "boolean") els.beepOn.checked = cfg.beepOn;
      if (typeof cfg.vibrateOn === "boolean") els.vibrateOn.checked = cfg.vibrateOn;
      if (typeof cfg.wakeOn === "boolean") els.wakeOn.checked = cfg.wakeOn;
      if (typeof cfg.voiceURI === "string") state.voiceURI = cfg.voiceURI;
    } catch (_) { /* noop */ }
  };

  function applyTranslations() {
    els.html.lang = state.lang;
    document.title = t("appTitle") + " · " + (state.lang === "es" ? "Series, descanso y aviso" : "Work, rest and cues");

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const value = t(key);
      if (typeof value === "string") el.textContent = value;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(el => {
      const key = el.getAttribute("data-i18n-aria");
      const value = t(key);
      if (typeof value === "string") el.setAttribute("aria-label", value);
    });
    document.querySelectorAll("[data-i18n-preset='strength']").forEach(el => {
      el.textContent = t("preset.strength");
    });

    els.langButtons.forEach(btn => {
      const isActive = btn.dataset.lang === state.lang;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    if (state.phase === PHASE_KEYS.IDLE) {
      els.phase.textContent = t("phase.idle");
      els.hint.textContent = t("hint.idle");
      els.startBtnText.textContent = t("start");
    } else if (state.phase === PHASE_KEYS.DONE) {
      els.phase.textContent = t("phase.done");
      els.hint.textContent = t("hint.done");
      els.startBtnText.textContent = t("start");
    } else {
      els.phase.textContent = t(`phase.${state.phase}`);
      if (state.isPaused) {
        els.hint.textContent = t("hint.paused");
        els.startBtnText.textContent = t("resume");
      } else {
        els.hint.textContent = t("hint.running");
        els.startBtnText.textContent = t("pause");
      }
    }

    updateRoundLabel();
    refreshVoiceSelect();
  }

  const setPhase = (phaseKey, duration) => {
    state.phase = phaseKey;
    state.phaseStart = performance.now();
    state.phaseDuration = duration;
    state.alertFiredFor = null;
    state.countdownFiredFor = null;
    els.body.dataset.phase = PHASE_BODY[phaseKey] || "";
    els.phase.textContent = t(`phase.${phaseKey}`);
    els.timerCard.classList.add("is-pulse");
    setTimeout(() => els.timerCard.classList.remove("is-pulse"), 600);
  };

  const updateRoundLabel = () => {
    const cfg = readConfig();
    if (state.phase === PHASE_KEYS.IDLE) {
      els.round.textContent = t("round.idle", cfg.rounds);
    } else if (state.phase === PHASE_KEYS.DONE) {
      els.round.textContent = t("round.done", state.totalRounds);
    } else if (state.phase === PHASE_KEYS.PREP) {
      els.round.textContent = t("round.prep", state.totalRounds);
    } else {
      els.round.textContent = t("round.active", state.currentRound, state.totalRounds);
    }
  };

  const announceWork = () => {
    speak(t("voice.work", state.currentRound), { rate: 1.02 });
    vibrate([200, 80, 200]);
    beepFor("work");
  };

  const announceRest = () => {
    speak(t("voice.rest"), { rate: 1, pitch: 0.95 });
    vibrate([400]);
    beepFor("rest");
  };

  const announcePrep = () => {
    speak(t("voice.starting"), { rate: 1.02 });
    vibrate(120);
    beepFor("prep");
  };

  const announceDone = () => {
    speak(t("voice.done"), { rate: 1, pitch: 1.05 });
    vibrate([300, 120, 300, 120, 600]);
    beepFor("done");
  };

  const playCountdown = (n) => {
    let word = "";
    if (n === 3) word = t("voice.three");
    if (n === 2) word = t("voice.two");
    if (n === 1) word = t("voice.one");
    if (word) speak(word, { rate: 1.05 });
    beepFor("tick");
  };

  const tick = () => {
    if (!state.isRunning || state.isPaused) return;

    const now = performance.now();
    const elapsed = (now - state.phaseStart) / 1000;
    const remaining = state.phaseDuration - elapsed;
    const progress = Math.min(100, (elapsed / state.phaseDuration) * 100);

    els.clock.textContent = formatTime(remaining);
    els.bar.style.width = `${progress}%`;

    const cfg = readConfig();
    const wholeRemaining = Math.ceil(remaining);

    if (cfg.alert > 0
        && wholeRemaining === cfg.alert
        && state.alertFiredFor !== cfg.alert
        && (state.phase === PHASE_KEYS.WORK || state.phase === PHASE_KEYS.REST)) {
      state.alertFiredFor = cfg.alert;
      speak(t("voice.alert"), { rate: 1.05, pitch: 1.1 });
      beepFor("alert");
      vibrate([100, 60, 100]);
      els.timerCard.classList.add("is-flash");
      setTimeout(() => els.timerCard.classList.remove("is-flash"), 600);
    }

    if (state.phase !== PHASE_KEYS.DONE
        && wholeRemaining > 0
        && wholeRemaining <= 3
        && state.countdownFiredFor !== wholeRemaining) {
      state.countdownFiredFor = wholeRemaining;
      playCountdown(wholeRemaining);
    }

    if (remaining <= 0) {
      advancePhase();
    } else {
      state.rafId = requestAnimationFrame(tick);
    }
  };

  const advancePhase = () => {
    const cfg = readConfig();

    if (state.phase === PHASE_KEYS.PREP) {
      state.currentRound = 1;
      setPhase(PHASE_KEYS.WORK, cfg.work);
      updateRoundLabel();
      announceWork();
    } else if (state.phase === PHASE_KEYS.WORK) {
      if (state.currentRound >= state.totalRounds) {
        finish();
        return;
      }
      if (cfg.rest > 0) {
        setPhase(PHASE_KEYS.REST, cfg.rest);
        announceRest();
      } else {
        state.currentRound += 1;
        setPhase(PHASE_KEYS.WORK, cfg.work);
        updateRoundLabel();
        announceWork();
      }
    } else if (state.phase === PHASE_KEYS.REST) {
      state.currentRound += 1;
      setPhase(PHASE_KEYS.WORK, cfg.work);
      updateRoundLabel();
      announceWork();
    }

    if (state.phase !== PHASE_KEYS.DONE) {
      state.rafId = requestAnimationFrame(tick);
    }
  };

  const finish = () => {
    state.isRunning = false;
    state.isPaused = false;
    cancelAnimationFrame(state.rafId);
    setPhase(PHASE_KEYS.DONE, 0);
    els.clock.textContent = "00:00";
    els.bar.style.width = "100%";
    els.body.classList.remove("is-running");
    els.startBtnText.textContent = t("start");
    els.startBtn.dataset.state = "";
    els.hint.textContent = t("hint.done");
    updateRoundLabel();
    announceDone();
    releaseWakeLock();
  };

  const start = async () => {
    unlockAudio();
    persistConfig();

    if (state.isRunning && !state.isPaused) {
      state.isPaused = true;
      state.pausedRemaining = state.phaseDuration - ((performance.now() - state.phaseStart) / 1000);
      cancelAnimationFrame(state.rafId);
      els.startBtnText.textContent = t("resume");
      els.startBtn.dataset.state = "";
      els.hint.textContent = t("hint.paused");
      releaseWakeLock();
      return;
    }

    if (state.isRunning && state.isPaused) {
      state.isPaused = false;
      state.phaseDuration = state.pausedRemaining;
      state.phaseStart = performance.now();
      els.startBtnText.textContent = t("pause");
      els.startBtn.dataset.state = "running";
      els.hint.textContent = t("hint.running");
      requestWakeLock();
      state.rafId = requestAnimationFrame(tick);
      return;
    }

    const cfg = readConfig();
    state.totalRounds = cfg.rounds;
    state.currentRound = 0;
    state.isRunning = true;
    state.isPaused = false;
    els.body.classList.add("is-running");
    els.startBtnText.textContent = t("pause");
    els.startBtn.dataset.state = "running";
    els.hint.textContent = t("hint.running");
    requestWakeLock();

    if (cfg.prep > 0) {
      setPhase(PHASE_KEYS.PREP, cfg.prep);
      updateRoundLabel();
      announcePrep();
    } else {
      state.currentRound = 1;
      setPhase(PHASE_KEYS.WORK, cfg.work);
      updateRoundLabel();
      announceWork();
    }
    state.rafId = requestAnimationFrame(tick);
  };

  const reset = () => {
    cancelAnimationFrame(state.rafId);
    state.isRunning = false;
    state.isPaused = false;
    state.currentRound = 0;
    state.phase = PHASE_KEYS.IDLE;
    state.alertFiredFor = null;
    state.countdownFiredFor = null;
    els.body.classList.remove("is-running");
    els.body.dataset.phase = "";
    els.phase.textContent = t("phase.idle");
    els.clock.textContent = "00:00";
    els.bar.style.width = "0%";
    els.startBtnText.textContent = t("start");
    els.startBtn.dataset.state = "";
    els.hint.textContent = t("hint.idle");
    updateRoundLabel();
    releaseWakeLock();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  els.startBtn.addEventListener("click", start);
  els.resetBtn.addEventListener("click", reset);

  function applyStep(targetId, step) {
    const input = document.getElementById(targetId);
    if (!input) return false;
    const min = parseInt(input.min, 10);
    const max = parseInt(input.max, 10);
    const current = parseInt(input.value, 10) || 0;
    let next = current + step;
    if (!Number.isNaN(min)) next = Math.max(min, next);
    if (!Number.isNaN(max)) next = Math.min(max, next);
    if (next === current) return false;
    input.value = next;
    updateRoundLabel();
    persistConfig();
    return true;
  }

  function bindStepperButton(btn) {
    const targetId = btn.dataset.target;
    const step = parseInt(btn.dataset.step, 10) || 1;
    let holdTimeoutId = null;
    let holdIntervalId = null;
    let holdTickMs = 220;
    let didHold = false;

    const tick = () => {
      const changed = applyStep(targetId, step);
      if (changed && navigator.vibrate && els.vibrateOn.checked) navigator.vibrate(10);
      if (!changed) stopHold();
    };

    const accelerate = () => {
      if (holdTickMs > 70) {
        clearInterval(holdIntervalId);
        holdTickMs = Math.max(70, holdTickMs - 30);
        holdIntervalId = setInterval(() => {
          tick();
          accelerate();
        }, holdTickMs);
      }
    };

    const startHold = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      didHold = false;
      btn.dataset.pressed = "true";
      holdTimeoutId = setTimeout(() => {
        didHold = true;
        tick();
        holdIntervalId = setInterval(() => {
          tick();
          accelerate();
        }, holdTickMs);
      }, 380);
    };

    const stopHold = () => {
      btn.removeAttribute("data-pressed");
      if (holdTimeoutId) { clearTimeout(holdTimeoutId); holdTimeoutId = null; }
      if (holdIntervalId) { clearInterval(holdIntervalId); holdIntervalId = null; }
      holdTickMs = 220;
    };

    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      btn.setPointerCapture?.(e.pointerId);
      startHold(e);
    });
    btn.addEventListener("pointerup", () => {
      const wasHold = didHold;
      stopHold();
      if (!wasHold) {
        if (applyStep(targetId, step) && navigator.vibrate && els.vibrateOn.checked) {
          navigator.vibrate(8);
        }
      }
    });
    btn.addEventListener("pointercancel", stopHold);
    btn.addEventListener("pointerleave", stopHold);
    btn.addEventListener("contextmenu", (e) => e.preventDefault());

    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        applyStep(targetId, step);
      }
    });
  }

  document.querySelectorAll(".stepper__btn").forEach(bindStepperButton);

  document.querySelectorAll(".preset").forEach(btn => {
    btn.addEventListener("click", () => {
      els.work.value = btn.dataset.work;
      els.rest.value = btn.dataset.rest;
      els.rounds.value = btn.dataset.rounds;
      updateRoundLabel();
      persistConfig();
    });
  });

  [els.work, els.rest, els.alert, els.rounds, els.prep].forEach(input => {
    input.addEventListener("change", () => {
      updateRoundLabel();
      persistConfig();
    });
  });

  [els.voiceOn, els.beepOn, els.vibrateOn, els.wakeOn].forEach(input => {
    input.addEventListener("change", persistConfig);
  });

  els.langButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      if (lang !== "es" && lang !== "en") return;
      state.lang = lang;
      state.voiceURI = null;
      applyTranslations();
      persistConfig();
    });
  });

  els.voiceSelect.addEventListener("change", () => {
    state.voiceURI = els.voiceSelect.value || null;
    persistConfig();
  });

  els.testVoiceBtn.addEventListener("click", () => {
    unlockAudio();
    beepFor("work");
    speak(t("voice.test.sample"), { rate: 1 });
  });

  els.fullscreenBtn.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) { /* noop */ }
  });

  document.addEventListener("keydown", (e) => {
    if (e.target instanceof HTMLInputElement) return;
    if (e.code === "Space") { e.preventDefault(); start(); }
    if (e.key === "r" || e.key === "R") reset();
  });

  if ("speechSynthesis" in window) {
    refreshVoiceSelect();
    window.speechSynthesis.addEventListener?.("voiceschanged", () => {
      refreshVoiceSelect();
    });
  }

  loadConfig();
  applyTranslations();
})();
