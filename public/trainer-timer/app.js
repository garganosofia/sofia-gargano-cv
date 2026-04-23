(() => {
  "use strict";

  const STORAGE_KEY = "trainerTimer.config.v1";

  const PHASES = {
    IDLE:  { id: "idle",  label: "Listo",        color: "" },
    PREP:  { id: "prep",  label: "Preparación",  color: "prep" },
    WORK:  { id: "work",  label: "Trabajo",      color: "work" },
    REST:  { id: "rest",  label: "Descanso",     color: "rest" },
    DONE:  { id: "done",  label: "Fin",          color: "done" }
  };

  const els = {
    body: document.body,
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
    wakeOn: document.getElementById("wakeOn")
  };

  const state = {
    isRunning: false,
    isPaused: false,
    phase: PHASES.IDLE,
    currentRound: 0,
    totalRounds: 0,
    phaseStart: 0,
    phaseDuration: 0,
    pausedRemaining: 0,
    rafId: null,
    alertFiredFor: null,
    wakeLock: null
  };

  let audioCtx = null;

  const ensureAudio = () => {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  };

  const playBeep = ({ frequency, duration, type = "sine", volume = 0.6 }) => {
    if (!els.beepOn.checked) return;
    const ctx = ensureAudio();
    if (!ctx) return;

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

  const beepFor = (phaseId) => {
    if (phaseId === "work")  playBeep({ frequency: 880, duration: 1.2, type: "sine",     volume: 0.7 });
    if (phaseId === "rest")  playBeep({ frequency: 392, duration: 1.4, type: "triangle", volume: 0.65 });
    if (phaseId === "prep")  playBeep({ frequency: 660, duration: 0.4, type: "sine",     volume: 0.5 });
    if (phaseId === "alert") playBeep({ frequency: 1200, duration: 0.6, type: "square",  volume: 0.55 });
    if (phaseId === "tick")  playBeep({ frequency: 1500, duration: 0.18, type: "sine",   volume: 0.45 });
    if (phaseId === "done") {
      playBeep({ frequency: 523, duration: 0.3, type: "sine", volume: 0.6 });
      setTimeout(() => playBeep({ frequency: 659, duration: 0.3, type: "sine", volume: 0.6 }), 320);
      setTimeout(() => playBeep({ frequency: 784, duration: 0.9, type: "sine", volume: 0.7 }), 640);
    }
  };

  const speak = (text) => {
    if (!els.voiceOn.checked) return;
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "es-ES";
      utter.rate = 1.05;
      utter.pitch = 1;
      utter.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const spanish = voices.find(v => v.lang && v.lang.toLowerCase().startsWith("es"));
      if (spanish) utter.voice = spanish;
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
    } catch (_) { /* noop */ }
  };

  const setPhase = (phase, duration) => {
    state.phase = phase;
    state.phaseStart = performance.now();
    state.phaseDuration = duration;
    state.alertFiredFor = null;
    els.body.dataset.phase = phase.color || "";
    els.phase.textContent = phase.label;
    els.timerCard.classList.add("is-pulse");
    setTimeout(() => els.timerCard.classList.remove("is-pulse"), 600);
  };

  const updateRoundLabel = () => {
    if (state.phase === PHASES.IDLE) {
      els.round.textContent = `Serie 0 / ${readConfig().rounds}`;
    } else if (state.phase === PHASES.DONE) {
      els.round.textContent = `Completado · ${state.totalRounds} series`;
    } else if (state.phase === PHASES.PREP) {
      els.round.textContent = `Preparación · próxima serie 1 / ${state.totalRounds}`;
    } else {
      els.round.textContent = `Serie ${state.currentRound} / ${state.totalRounds}`;
    }
  };

  const announcePhase = (phase, opts = {}) => {
    const cfg = readConfig();
    if (phase === PHASES.PREP) {
      speak("Preparados");
      vibrate(120);
      beepFor("prep");
    }
    if (phase === PHASES.WORK) {
      speak(`Trabajo, serie ${state.currentRound}`);
      vibrate([200, 80, 200]);
      beepFor("work");
    }
    if (phase === PHASES.REST) {
      speak("Descanso");
      vibrate([400]);
      beepFor("rest");
    }
    if (phase === PHASES.DONE) {
      speak("Entrenamiento finalizado");
      vibrate([300, 120, 300, 120, 600]);
      beepFor("done");
    }
    void cfg;
    void opts;
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

    if (cfg.alert > 0 && wholeRemaining === cfg.alert && state.alertFiredFor !== cfg.alert
        && (state.phase === PHASES.WORK || state.phase === PHASES.REST)) {
      state.alertFiredFor = cfg.alert;
      speak("Aviso");
      beepFor("alert");
      vibrate([100, 60, 100]);
      els.timerCard.classList.add("is-flash");
      setTimeout(() => els.timerCard.classList.remove("is-flash"), 600);
    }

    if (state.phase !== PHASES.DONE && wholeRemaining > 0 && wholeRemaining <= 3
        && state.alertFiredFor !== `tick-${wholeRemaining}`) {
      state.alertFiredFor = `tick-${wholeRemaining}`;
      beepFor("tick");
    }

    if (remaining <= 0) {
      advancePhase();
    } else {
      state.rafId = requestAnimationFrame(tick);
    }
  };

  const advancePhase = () => {
    const cfg = readConfig();

    if (state.phase === PHASES.PREP) {
      state.currentRound = 1;
      setPhase(PHASES.WORK, cfg.work);
      updateRoundLabel();
      announcePhase(PHASES.WORK);
    } else if (state.phase === PHASES.WORK) {
      if (state.currentRound >= state.totalRounds) {
        finish();
        return;
      }
      if (cfg.rest > 0) {
        setPhase(PHASES.REST, cfg.rest);
        announcePhase(PHASES.REST);
      } else {
        state.currentRound += 1;
        setPhase(PHASES.WORK, cfg.work);
        updateRoundLabel();
        announcePhase(PHASES.WORK);
      }
    } else if (state.phase === PHASES.REST) {
      state.currentRound += 1;
      setPhase(PHASES.WORK, cfg.work);
      updateRoundLabel();
      announcePhase(PHASES.WORK);
    }

    if (state.phase !== PHASES.DONE) {
      state.rafId = requestAnimationFrame(tick);
    }
  };

  const finish = () => {
    state.isRunning = false;
    state.isPaused = false;
    cancelAnimationFrame(state.rafId);
    setPhase(PHASES.DONE, 0);
    els.clock.textContent = "00:00";
    els.bar.style.width = "100%";
    els.body.classList.remove("is-running");
    els.startBtnText.textContent = "Iniciar";
    els.startBtn.dataset.state = "";
    els.hint.textContent = "Buen trabajo. Presioná Reiniciar para volver a configurar.";
    updateRoundLabel();
    announcePhase(PHASES.DONE);
    releaseWakeLock();
  };

  const start = async () => {
    ensureAudio();
    persistConfig();

    if (state.isRunning && !state.isPaused) {
      state.isPaused = true;
      state.pausedRemaining = state.phaseDuration - ((performance.now() - state.phaseStart) / 1000);
      cancelAnimationFrame(state.rafId);
      els.startBtnText.textContent = "Reanudar";
      els.startBtn.dataset.state = "";
      els.hint.textContent = "Pausado.";
      releaseWakeLock();
      return;
    }

    if (state.isRunning && state.isPaused) {
      state.isPaused = false;
      state.phaseDuration = state.pausedRemaining;
      state.phaseStart = performance.now();
      els.startBtnText.textContent = "Pausar";
      els.startBtn.dataset.state = "running";
      els.hint.textContent = "En curso.";
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
    els.startBtnText.textContent = "Pausar";
    els.startBtn.dataset.state = "running";
    els.hint.textContent = "En curso.";
    requestWakeLock();

    if (cfg.prep > 0) {
      setPhase(PHASES.PREP, cfg.prep);
      updateRoundLabel();
      announcePhase(PHASES.PREP);
    } else {
      state.currentRound = 1;
      setPhase(PHASES.WORK, cfg.work);
      updateRoundLabel();
      announcePhase(PHASES.WORK);
    }
    state.rafId = requestAnimationFrame(tick);
  };

  const reset = () => {
    cancelAnimationFrame(state.rafId);
    state.isRunning = false;
    state.isPaused = false;
    state.currentRound = 0;
    state.phase = PHASES.IDLE;
    state.alertFiredFor = null;
    els.body.classList.remove("is-running");
    els.body.dataset.phase = "";
    els.phase.textContent = PHASES.IDLE.label;
    els.clock.textContent = "00:00";
    els.bar.style.width = "0%";
    els.startBtnText.textContent = "Iniciar";
    els.startBtn.dataset.state = "";
    els.hint.textContent = "Configurá los tiempos y tocá Iniciar.";
    updateRoundLabel();
    releaseWakeLock();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  els.startBtn.addEventListener("click", start);
  els.resetBtn.addEventListener("click", reset);

  document.querySelectorAll(".step").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const step = parseInt(btn.dataset.step, 10) || 1;
      const input = document.getElementById(targetId);
      if (!input) return;
      const min = parseInt(input.min, 10);
      const max = parseInt(input.max, 10);
      const current = parseInt(input.value, 10) || 0;
      let next = current + step;
      if (!Number.isNaN(min)) next = Math.max(min, next);
      if (!Number.isNaN(max)) next = Math.min(max, next);
      input.value = next;
      updateRoundLabel();
      persistConfig();
    });
  });

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
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", () => {});
  }

  loadConfig();
  updateRoundLabel();
})();
