"use client";

import { useEffect, useRef, useState } from "react";
import "./intro.css";

/*
  Introducción animada de La Propuesta Fep (historia de ~68 s).
  Es una capa (overlay) por encima de la web: no modifica page.js ni la API.
  El tiempo sale del reloj de Web Audio (ctx.currentTime), el más preciso del navegador.
  La música es una pista original a 120 BPM (kick en cada negra), compuesta para esta intro.
*/

const AUDIO_SRC = "/intro/fep-theme.mp3";
const SEEN_KEY = "fep-intro-seen"; // sessionStorage: solo recuerda "ya la viste" en esta pestaña

// Kick de la pista: una negra (0,5 s) de 0–24 s y de 32–68 s; en 24–32 s hay un quiebre sin kick.
const KICKS = [];
for (const [a, b] of [[0, 24], [32, 68]]) for (let t = a; t < b; t += 0.5) KICKS.push(t);

// Inicio de cada escena: 0 flashes · b Fep · c impresora · d "no sé modelar" · e Claude Pro ·
// f Claude Code · g imprime · h festeja · i final
const SCENES = [0, 10, 16, 24, 32, 42, 52, 56, 60];
const LETTERS = "bcdefghi";
const FLASH_UNTIL = SCENES[1]; // solo en los primeros 10 s hay flashes de pantalla completa
const FADE_START = 62; // la música y la imagen empiezan a apagarse
const LEAVE_AT = 66.5; // todo en cero: la capa se disuelve y aparece la web

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
        <path className="fi-mouth m-smile" d="M44 30 Q51 36 58 30" />
        <path className="fi-mouth m-sad" d="M44 34 Q51 28 58 34" />
        <circle className="fi-mouth m-o" cx="51" cy="32" r="3.2" />
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

function Terminal() {
  const lines = [
    ["> Hacé un soporte para auriculares", "", "0.4s"],
    ["✻ Pensando en las medidas…", "dim", "2.6s"],
    ["● Write(soporte.scad)", "", "4.4s"],
    ["✓ Listo: soporte.3mf", "ok", "6.4s"]
  ];
  return (
    <div className="fi-term" aria-hidden="true">
      <div className="fi-term-bar"><i /><i /><i /><span>claude code</span></div>
      <div className="fi-term-body">
        {lines.map(([text, kind, delay]) => (
          <p key={text} className={`fi-ty ${kind}`} style={{ "--n": text.length + 1, "--d": delay }}>{text}</p>
        ))}
      </div>
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
  const letter = LETTERS[scene - 1];
  let stage = null;
  let caption = null;

  if (letter === "b") {
    stage = <Fep pose="enter" />;
    caption = (<><h2>Hola, soy <em>Fep.</em></h2><p>Y esta es mi historia</p></>);
  } else if (letter === "c") {
    stage = (
      <>
        <Fep pose="surprise" />
        <span className="fi-mark">!</span>
        <div className="fi-bubble">¡Uy, una impresora 3D!</div>
        <Printer />
      </>
    );
    caption = (<><h2>Bambu Lab <em>A1 Mini</em></h2><p>De la idea al objeto</p></>);
  } else if (letter === "d") {
    stage = (
      <>
        <Fep pose="think" />
        <span className="fi-mark">?</span>
        <span className="fi-mark q2">?</span>
        <div className="fi-bubble">Pero… ¡no sé modelar!</div>
        <Printer className="fi-idle fi-dim fi-nopop" />
      </>
    );
    caption = (<><h2>Hay un <em>problema…</em></h2><p>Diseñar en 3D no es tan fácil</p></>);
  } else if (letter === "e") {
    stage = (
      <>
        <Fep pose="pointUp" />
        <div className="fi-bubble">¡Qué suerte! Claude Pro hace tareas más difíciles y puede hacer de todo</div>
        <Logo />
      </>
    );
    caption = (
      <>
        <h2>¡Hace <em>de todo!</em></h2>
        <p>Claude Pro · ideas · código · aprender</p>
        <div className="fi-price">
          <b>US$20 / mes</b> plan mensual estándar (EE. UU.)
          <small>La API de Anthropic se cobra aparte.</small>
        </div>
      </>
    );
  } else if (letter === "f") {
    stage = (
      <>
        <Terminal />
        <Fep pose="pointUp" />
        <div className="fi-bubble">¡Y trae las capacidades de Claude Code también!</div>
        <Logo className="fi-mini" />
      </>
    );
    caption = (<><h2>Claude <em>Code</em></h2><p>Escribe el código por vos</p></>);
  } else if (letter === "g") {
    stage = (
      <>
        <Fep pose="point" />
        <Printer className="fi-nopop" />
      </>
    );
    caption = (<><h2>De la idea <em>al objeto</em></h2><p>Diseñado por Claude · impreso en la A1 Mini</p></>);
  } else if (letter === "h") {
    stage = (
      <>
        <Fep pose="cheer" />
        <div className="fi-bubble">¡Lo logramos!</div>
        <Printer className="fi-done fi-nopop" />
      </>
    );
    caption = (<><h2>¡Sin saber <em>modelar!</em></h2><p>Fep + Claude + A1 Mini</p></>);
  } else {
    stage = (
      <>
        <Printer className="fi-mini fi-done" />
        <Fep pose="cheer" />
        <Logo className="fi-mini" />
      </>
    );
    caption = (<><h2>La <em>Propuesta</em> Fep</h2><p>Creado por Fep</p></>);
  }

  return (
    <div key={scene} className={`fi-scene fi-sc-${letter}`}>
      <div className="fi-stage">
        {stage}
        <div className="fi-ground" />
      </div>
      <div className="fi-caption">{caption}</div>
    </div>
  );
}

export default function Intro() {
  const [phase, setPhase] = useState("boot"); // boot | ready | playing | leaving | done
  const [scene, setScene] = useState(0);
  const [fast, setFast] = useState(false);
  const rootRef = useRef(null);
  const api = useRef({ start() {}, skip() {} });

  useEffect(() => {
    const html = document.documentElement;
    const unlock = () => {
      html.classList.remove("fep-intro-on");
      html.classList.add("fep-intro-off");
    };
    if (!html.classList.contains("fep-intro-on")) {
      setPhase("done");
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      unlock(); // sin Web Audio no hay intro: se va directo a la web
      setPhase("done");
      return;
    }

    const timers = [];
    let raf = 0;
    let started = false;
    let ended = false;
    let cancelled = false;
    let sceneNow = 0;
    let t0 = 0;
    let source = null;

    const ctx = new AC();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    try {
      if (navigator.audioSession) navigator.audioSession.type = "playback"; // iOS: suena con el switch en silencio
    } catch {}

    // Se decodifica la música desde ya; reproducirla es un paso instantáneo después del toque.
    const bufferReady = fetch(AUDIO_SRC)
      .then((r) => {
        if (!r.ok) throw new Error("audio");
        return r.arrayBuffer();
      })
      .then(
        (ab) =>
          new Promise((resolve, reject) => {
            const p = ctx.decodeAudioData(ab, resolve, reject); // Safari viejo usa callbacks
            if (p && p.then) p.then(resolve, reject);
          })
      );
    bufferReady.catch(() => finish(true)); // si el audio falla, nunca dejamos al visitante atrapado

    // Mientras dura la intro, la web de abajo no recibe foco ni lectores de pantalla.
    const covered = Array.from(document.body.children).filter(
      (n) => n.tagName !== "SCRIPT" && !n.classList.contains("fep-intro")
    );
    covered.forEach((n) => n.setAttribute("inert", ""));

    const setVol = (v) => gain.gain.setTargetAtTime(v, ctx.currentTime, 0.04);
    const markSeen = () => {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
    };
    const stopAudio = () => {
      try {
        source && source.stop();
      } catch {}
      try {
        ctx.close();
      } catch {}
    };

    function finish(isFast) {
      if (ended) return;
      ended = true;
      cancelAnimationFrame(raf);
      markSeen();
      if (isFast) setVol(0);
      setFast(!!isFast);
      setPhase("leaving");
      timers.push(setTimeout(stopAudio, isFast ? 350 : 150)); // la música se detiene sí o sí
      timers.push(setTimeout(() => {
        covered.forEach((n) => n.removeAttribute("inert"));
        unlock();
        setPhase("done");
      }, isFast ? 600 : 1500));
    }

    function tick() {
      const t = Math.max(0, ctx.currentTime - t0); // segundos de música reproducidos
      const lat = Math.min(0.2, ctx.outputLatency || ctx.baseLatency || 0);
      const tv = Math.max(0, t - lat); // tiempo realmente oído, para clavar el flash con el kick

      let last = -1;
      for (let i = 0; i < KICKS.length && KICKS[i] <= tv; i++) last = KICKS[i];
      const d = last < 0 ? 9 : tv - last;
      const kick = Math.exp(-d / 0.12);
      const el = rootRef.current;
      if (el) {
        el.style.setProperty("--kick", kick.toFixed(3));
        el.style.setProperty("--flash", (tv < FLASH_UNTIL ? kick : 0).toFixed(3));
      }

      const s = sceneAt(tv);
      if (s !== sceneNow) {
        sceneNow = s;
        setScene(s);
      }

      if (t >= FADE_START) {
        const x = Math.min(1, (t - FADE_START) / (LEAVE_AT - FADE_START));
        const v = Math.cos((x * Math.PI) / 2);
        setVol(v); // la música baja...
        if (el) el.style.setProperty("--fade", v.toFixed(3)); // ...y la imagen se apaga con ella
      }
      if (t >= LEAVE_AT) {
        finish(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (started || ended) return;
      started = true;
      setPhase("boot");
      // resume() debe llamarse dentro del gesto del usuario, por eso va primero y sin esperar.
      Promise.all([bufferReady, Promise.resolve(ctx.resume())])
        .then(([buffer]) => {
          if (cancelled || ended) return;
          if (ctx.state !== "running") throw new Error("blocked");
          source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(gain);
          t0 = ctx.currentTime + 0.05;
          source.start(t0);
          markSeen();
          setPhase("playing");
          raf = requestAnimationFrame(tick);
        })
        .catch(() => {
          started = false;
          if (!cancelled && !ended) setPhase("ready");
        });
    }

    api.current = { start, skip: () => finish(true) };

    const onHidden = () => {
      if (document.hidden && started && !ended) finish(true);
    };
    const onKey = (e) => {
      if (e.key === "Escape") finish(true);
    };
    document.addEventListener("visibilitychange", onHidden);
    document.addEventListener("keydown", onKey);

    // Si el navegador permite audio sin gesto, arranca solo; si no, pide un toque.
    if (ctx.state === "running") start();
    else setPhase("ready");

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      document.removeEventListener("visibilitychange", onHidden);
      document.removeEventListener("keydown", onKey);
      stopAudio();
      covered.forEach((n) => n.removeAttribute("inert"));
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      ref={rootRef}
      className={`fep-intro fi-${phase}${fast ? " fi-fast" : ""}`}
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
          <p className="fi-note">Dura ~1 minuto. Incluye música y destellos suaves.</p>
          <button className="fi-link" onClick={() => api.current.skip()}>Entrar sin la intro</button>
          <p className="fi-legal">Proyecto personal. El logo de Claude es marca de Anthropic; no es contenido oficial.</p>
        </div>
      )}

      {(phase === "playing" || phase === "leaving") && (
        <div className="fi-content">
          <Scenes scene={scene} />
        </div>
      )}

      {(phase === "ready" || phase === "playing") && (
        <button className="fi-skip" onClick={() => api.current.skip()}>Saltar ›</button>
      )}
    </div>
  );
}
