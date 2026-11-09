"use client";

import { useEffect, useRef, useState } from "react";
import "./intro.css";

/*
  Introducción animada de La Propuesta Fep.
  Es una capa (overlay) por encima de la web: no modifica page.js ni la API.
  Todo se sincroniza con audio.currentTime, que es el reloj real de la música.
*/

const AUDIO_SRC = "/intro/fep-theme.mp3";
const SEEN_KEY = "fep-intro-seen"; // sessionStorage: solo recuerda "ya la viste" en esta pestaña

// Golpes de kick detectados en el audio (segundos). Los flashes salen de aquí, no son aleatorios.
const KICKS = [
  0.02, 0.466, 1.542, 2.474, 2.922, 3.996, 4.928, 5.376, 6.45, 7.384, 7.828, 8.904,
  9.842, 10.29, 10.76, 11.36, 11.99, 12.3, 12.74, 13.21, 13.81, 14.44, 14.75, 15.19,
  15.67, 16.27, 17.2, 17.65, 18.13, 18.72, 19.66, 20.11, 20.58, 21.18, 21.81, 22.11,
  22.56, 23.03, 23.63, 23.95, 24.57, 25.01, 25.49, 26.09, 27.02, 27.47, 27.95, 28.54
];

// Inicio de cada escena: 0 flashes · 1 Fep · 2 impresora · 3 Claude · 4 final (compases de 2,45 s a 98 BPM)
const SCENES = [0, 9.84, 14.74, 19.64, 24.54];
const FADE_START = 27.0; // empieza a bajar el volumen
const FADE_END = 30.2; // volumen en cero
const LEAVE_AT = 30.2; // transición hacia la web

function sceneAt(t) {
  for (let i = SCENES.length - 1; i > 0; i--) if (t >= SCENES[i]) return i;
  return 0;
}

function Fep({ pose }) {
  return (
    <svg className={`fi-fep fi-p-${pose}`} viewBox="0 0 100 160" aria-hidden="true">
      <g className="fi-body">
        <line className="fi-leg fi-legA" x1="50" y1="94" x2="41" y2="146" />
        <line className="fi-leg fi-legB" x1="50" y1="94" x2="59" y2="146" />
        <line className="fi-torso" x1="50" y1="38" x2="50" y2="94" />
        <line className="fi-arm fi-armL" x1="50" y1="52" x2="50" y2="90" />
        <line className="fi-arm fi-armR" x1="50" y1="52" x2="50" y2="90" />
        <circle className="fi-head" cx="50" cy="22" r="15" />
        <path className="fi-cap" d="M35 18 Q35 4 50 4 Q65 4 65 18 Z" />
        <path className="fi-brim" d="M58 17 L77 19" />
        <circle className="fi-eye" cx="45" cy="23" r="2.2" style={{ transformOrigin: "45px 23px" }} />
        <circle className="fi-eye" cx="57" cy="23" r="2.2" style={{ transformOrigin: "57px 23px" }} />
        <path className="fi-mouth" d="M44 30 Q51 36 58 30" />
      </g>
    </svg>
  );
}

function Printer({ className = "" }) {
  return (
    <svg className={`fi-printer ${className}`} viewBox="0 0 200 200" aria-hidden="true">
      <rect x="24" y="34" width="22" height="126" rx="4" fill="#3a4136" stroke="#5a6451" />
      <rect x="28" y="157" width="150" height="28" rx="6" fill="#20261d" stroke="#5a6451" />
      <text x="103" y="175" textAnchor="middle" fontSize="9" fill="#cfd6c8" fontFamily="DM Mono, monospace" letterSpacing="1.5">A1 mini</text>
      <rect x="40" y="150" width="130" height="7" fill="#cfd6c8" />
      <g className="fi-obj">
        <polygon points="110,90 138,103 138,138 110,150 82,138 82,103" fill="#d7fa58" />
        <path d="M82 114H138M82 126H138M82 138H138" stroke="#8ba52d" strokeWidth="1" />
      </g>
      <g className="fi-gantry">
        <rect x="40" y="60" width="130" height="12" rx="3" fill="#4a5343" stroke="#5a6451" />
        <g className="fi-head-move">
          <rect x="98" y="72" width="24" height="16" rx="3" fill="#f3f3ed" />
          <polygon points="106,88 114,88 110,94" fill="#d7fa58" />
        </g>
      </g>
      <circle cx="35" cy="22" r="17" fill="none" stroke="#d7fa58" strokeWidth="7" />
      <circle cx="35" cy="22" r="4" fill="#d7fa58" />
    </svg>
  );
}

function Logo({ className = "" }) {
  return (
    <div className={`fi-logo ${className}`}>
      <span className="fi-halo" />
      <span className="fi-orbit"><i /><i /><i /></span>
      {/* Logo de Claude tal como lo subió Fep, sin modificar */}
      <img src="/intro/claude-logo.png" alt="" width="555" height="552" />
    </div>
  );
}

function Scenes({ scene }) {
  if (scene === 0) {
    return (
      <div className="fi-a">
        <div className="fi-big">FEP</div>
        <div className="fi-pres">PRESENTA</div>
      </div>
    );
  }
  const letter = "bcde"[scene - 1];
  return (
    <div key={scene} className={`fi-scene fi-sc-${letter}`}>
      <div className="fi-stage">
        {scene === 1 && <Fep pose="enter" />}
        {scene === 2 && (
          <>
            <Fep pose="point" />
            <Printer />
          </>
        )}
        {scene === 3 && (
          <>
            <Fep pose="pointUp" />
            <div className="fi-bubble">¿Y si lo diseñamos juntos?</div>
            <Logo />
          </>
        )}
        {scene === 4 && (
          <>
            <Printer className="fi-mini" />
            <Fep pose="cheer" />
            <Logo className="fi-mini" />
          </>
        )}
        <div className="fi-ground" />
      </div>
      <div className="fi-caption">
        {scene === 1 && (<><h2>Hola, soy <em>Fep.</em></h2><p>Y traigo una propuesta.</p></>)}
        {scene === 2 && (<><h2>Bambu Lab <em>A1 Mini</em></h2><p>De la idea al objeto</p></>)}
        {scene === 3 && (
          <>
            <h2>Claude <em>Pro</em></h2>
            <p>Ideas · código · aprender</p>
            <div className="fi-price">
              <b>US$20 / mes</b> plan mensual estándar (EE. UU.)
              <small>La API de Anthropic se cobra aparte.</small>
            </div>
          </>
        )}
        {scene === 4 && (<><h2>La <em>Propuesta</em> Fep</h2><p>Creado por Fep</p></>)}
      </div>
    </div>
  );
}

export default function Intro() {
  const [phase, setPhase] = useState("boot"); // boot | ready | playing | leaving | done
  const [scene, setScene] = useState(0);
  const rootRef = useRef(null);
  const api = useRef({ start() {}, skip() {} });

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("fep-intro-on")) {
      setPhase("done");
      return;
    }

    const timers = [];
    let raf = 0;
    let started = false;
    let ended = false;
    let cancelled = false;
    let sceneNow = 0;

    const audio = new Audio(AUDIO_SRC);
    audio.preload = "auto";
    audio.loop = false;

    // Web Audio solo para controlar el volumen (iOS ignora audio.volume).
    let ctx = null;
    let gain = null;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        ctx = new AC();
        gain = ctx.createGain();
        ctx.createMediaElementSource(audio).connect(gain);
        gain.connect(ctx.destination);
      }
    } catch {
      ctx = null;
      gain = null;
    }
    try {
      if (navigator.audioSession) navigator.audioSession.type = "playback";
    } catch {}

    const setVol = (v) => {
      if (gain && ctx) gain.gain.setTargetAtTime(v, ctx.currentTime, 0.04);
      else audio.volume = Math.max(0, Math.min(1, v));
    };

    // Mientras dura la intro, la web de abajo no recibe foco ni lectores de pantalla.
    const covered = Array.from(document.body.children).filter(
      (n) => n.tagName !== "SCRIPT" && !n.classList.contains("fep-intro")
    );
    covered.forEach((n) => n.setAttribute("inert", ""));

    const markSeen = () => {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
    };

    const stopAudio = () => {
      try {
        audio.pause();
      } catch {}
      try {
        ctx && ctx.close();
      } catch {}
    };

    const unlock = () => {
      covered.forEach((n) => n.removeAttribute("inert"));
      html.classList.remove("fep-intro-on");
      html.classList.add("fep-intro-off");
    };

    const finish = (fast) => {
      if (ended) return;
      ended = true;
      cancelAnimationFrame(raf);
      markSeen();
      if (fast) setVol(0);
      setPhase("leaving");
      timers.push(setTimeout(stopAudio, fast ? 350 : 100)); // la música se detiene sí o sí
      timers.push(setTimeout(() => {
        unlock();
        setPhase("done");
      }, 950));
    };

    const tick = () => {
      const t = audio.currentTime;
      const lat = ctx ? Math.min(0.15, ctx.outputLatency || ctx.baseLatency || 0) : 0;
      const tv = Math.max(0, t - lat); // tiempo "oído", para clavar el flash con el kick

      let last = -1;
      for (let i = 0; i < KICKS.length && KICKS[i] <= tv; i++) last = KICKS[i];
      const d = last < 0 ? 9 : tv - last;
      const kick = Math.min(1, d / 0.01) * Math.exp(-d / 0.12);
      const el = rootRef.current;
      if (el) {
        el.style.setProperty("--kick", kick.toFixed(3));
        el.style.setProperty("--flash", (tv < SCENES[1] ? kick : 0).toFixed(3));
      }

      const s = sceneAt(tv);
      if (s !== sceneNow) {
        sceneNow = s;
        setScene(s);
      }

      if (t >= FADE_START) {
        const x = Math.min(1, (t - FADE_START) / (FADE_END - FADE_START));
        setVol(Math.cos((x * Math.PI) / 2));
      }
      if (t >= LEAVE_AT || audio.ended) {
        finish(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (started || ended) return;
      started = true;
      try {
        ctx && ctx.resume && ctx.resume();
      } catch {}
      Promise.resolve(audio.play())
        .then(() => {
          if (cancelled || ended) return;
          markSeen();
          setPhase("playing");
          raf = requestAnimationFrame(tick);
        })
        .catch(() => {
          started = false;
          if (!cancelled) setPhase("ready");
        });
    };

    api.current = { start, skip: () => finish(true) };

    const onHidden = () => {
      if (document.hidden && started && !ended) finish(true);
    };
    const onKey = (e) => {
      if (e.key === "Escape") finish(true);
    };
    const onError = () => finish(true); // si el audio falla, nunca dejamos al visitante atrapado
    document.addEventListener("visibilitychange", onHidden);
    document.addEventListener("keydown", onKey);
    audio.addEventListener("error", onError);

    // Intento de reproducción automática; si el navegador la bloquea, pedimos un toque.
    if (ctx && ctx.state !== "running") setPhase("ready");
    else start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      document.removeEventListener("visibilitychange", onHidden);
      document.removeEventListener("keydown", onKey);
      audio.removeEventListener("error", onError);
      stopAudio();
      covered.forEach((n) => n.removeAttribute("inert"));
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      ref={rootRef}
      className={`fep-intro fi-${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label="Introducción animada de La Propuesta Fep"
    >
      <div className="fi-flash" />
      {phase === "boot" && <div className="fi-bootmark">◈ PROYECTO FEP</div>}

      {phase === "ready" && (
        <div className="fi-ready">
          <button className="fi-play" onClick={() => api.current.start()} autoFocus aria-label="Comenzar la introducción">
            ▶
          </button>
          <p className="fi-ready-title">Tocá para comenzar</p>
          <p className="fi-note">Incluye música y destellos suaves.</p>
          <button className="fi-link" onClick={() => api.current.skip()}>Entrar sin la intro</button>
          <p className="fi-legal">Proyecto personal. El logo de Claude es marca de Anthropic; no es contenido oficial.</p>
        </div>
      )}

      {(phase === "playing" || phase === "leaving") && <Scenes scene={scene} />}

      {(phase === "ready" || phase === "playing") && (
        <button className="fi-skip" onClick={() => api.current.skip()}>Saltar ›</button>
      )}
    </div>
  );
}
