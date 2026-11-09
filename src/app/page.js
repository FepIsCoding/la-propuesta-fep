 "use client";

import { useEffect, useState } from "react";

const ideas = [
  ["01", "Piezas útiles para el escritorio", "Organizadores, soportes para auriculares y accesorios diseñados a medida."],
  ["02", "Prototipos que evolucionan", "Crear una primera versión, probarla, detectar qué falla y mejorarla."],
  ["03", "Aprender diseño 3D", "Pasar de una idea a un modelo imprimible con herramientas como Tinkercad."],
  ["04", "Resolver problemas reales", "Medir, planificar, probar soluciones y documentar qué funciona."]
];

function PrinterIllustration() {
  return (
    <div className="machine" aria-label="Ilustración de una impresora 3D">
      <div className="glow" />
      <div className="top">•••</div>
      <div className="frame">
        <div className="rail" />
        <div className="head" />
        <div className="object"><i /><i /><i /></div>
        <div className="bed" />
      </div>
      <div className="base">A1 mini</div>
      <span className="float">IDEA → OBJETO</span>
    </div>
  );
}

export default function Home() {
  const [votes, setVotes] = useState({ yes: 0, no: 0 });
  const [choice, setChoice] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/votes", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("No se pudieron cargar los votos");
        return response.json();
      })
      .then(setVotes)
      .catch(() => {});
    try {
      setChoice(localStorage.getItem("a1mini-vote") || "");
    } catch {}
  }, []);

  async function submitVote(selected) {
    if (choice || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: selected })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo registrar");
      setVotes(data);
      setChoice(selected);
      try {
        localStorage.setItem("a1mini-vote", selected);
      } catch {}
      setMessage("¡Gracias! Tu respuesta quedó registrada.");
    } catch {
      setMessage("No se pudo registrar. Probá de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  const total = votes.yes + votes.no;
  const yesPercent = total ? (votes.yes / total) * 100 : 0;

  return (
    <main id="top">
      <nav>
        <b>◈ PROYECTO FEP</b>
        <a href="#idea">LA PROPUESTA ↘</a>
      </nav>

      <section className="hero">
        <div>
          <label>● UNA IDEA, MUCHAS POSIBILIDADES</label>
          <h1>De imaginarlo<br />a <em>hacerlo.</em></h1>
          <p>Una propuesta para combinar creatividad, inteligencia artificial y fabricación 3D. Dos herramientas para aprender haciendo y convertir ideas en proyectos reales.</p>
          <a className="cta" href="#idea">Conocer el proyecto ↓</a>
          <small>Presentación familiar · Noviembre 2026</small>
        </div>
        <PrinterIllustration />
        <div className="foot">
          01 / 03 <span>CREATIVIDAD + TECNOLOGÍA</span><span>PROYECTO PERSONAL</span>
        </div>
      </section>

      <section className="intro" id="idea">
        <label>01 — LA IDEA</label>
        <div className="split">
          <h2>No se trata solo de comprar tecnología. Se trata de <em>crear cosas.</em></h2>
          <div>
            <p>La Bambu Lab A1 Mini permitiría fabricar objetos físicos a partir de diseños propios. Claude Pro puede ser una herramienta de apoyo para investigar, programar, entender errores y desarrollar proyectos.</p>
            <p>La propuesta es evaluar ambas herramientas como parte de un mismo espacio para experimentar, aprender y construir.</p>
          </div>
        </div>
      </section>

      <section className="tools">
        <label>02 — LAS HERRAMIENTAS</label>
        <div className="cards">
          <article>
            <small>FABRICACIÓN 3D · HARDWARE</small>
            <PrinterIllustration />
            <h3>Bambu Lab<br /><em>A1 Mini</em></h3>
            <p>Una impresora 3D compacta para transformar diseños digitales en objetos reales, con calibración automática y una experiencia pensada para empezar.</p>
            <ul>
              <li>Imprimir piezas y prototipos propios</li>
              <li>Probar diseños y mejorarlos</li>
              <li>Aprender medidas, formas y materiales</li>
            </ul>
            <a href="https://bambulab.com/en/a1-mini" target="_blank" rel="noreferrer">Conocer la A1 Mini ↗</a>
          </article>
          <article className="dark">
            <small>ASISTENCIA CREATIVA · SOFTWARE</small>
            <div className="ai">✳<span>IDEAS　 ·　 CÓDIGO　 ·　 APRENDER</span></div>
            <h3>Claude<br /><em>Pro</em></h3>
            <p>Un asistente de IA para acompañar proyectos más largos: explicar conceptos, ayudar a revisar código y ordenar ideas complejas.</p>
            <ul>
              <li>Investigar y entender temas nuevos</li>
              <li>Planificar y revisar proyectos</li>
              <li>Aprender programación paso a paso</li>
            </ul>
            <a href="https://claude.ai/" target="_blank" rel="noreferrer">Conocer Claude ↗</a>
          </article>
        </div>
        <aside>
          <b>↗ Una decisión familiar informada</b>
          <p>Antes de contratar, podemos revisar las condiciones de cada servicio, definir qué tareas concretas resolvería y comprobar que el presupuesto tenga sentido.</p>
        </aside>
      </section>

      <section className="ideas">
        <label>03 — QUÉ PODRÍA HACER</label>
        <div className="ideas-head">
          <h2>Ideas que pueden<br /><em>salir del papel.</em></h2>
          <p>El objetivo no es tener una máquina guardada: es usarla para crear, experimentar y aprender con proyectos concretos.</p>
        </div>
        <div className="grid">
          {ideas.map(([number, title, description]) => (
            <article key={number}>
              <small>{number} / PROYECTOS</small>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="steps">
        <label>04 — CÓMO LO HARÍAMOS</label>
        <h2>Un plan simple,<br /><em>paso a paso.</em></h2>
        <div className="grid three">
          <article><b>01</b><h3>Elegir un primer proyecto</h3><p>Definir algo útil y alcanzable para diseñar e imprimir.</p></article>
          <article><b>02</b><h3>Aprender y construir</h3><p>Investigar, modelar, programar si hace falta y probar.</p></article>
          <article><b>03</b><h3>Mostrar resultados</h3><p>Enseñar qué funcionó, qué hubo que corregir y qué aprendí.</p></article>
        </div>
      </section>

      <section className="vote">
        <div className="vote-inner">
          <label>05 — DECISIÓN EN FAMILIA</label>
          <h2>¿Te gustaría<br />apoyar la idea?</h2>
          <p>Tu opinión cuenta. Podés indicar si te gustaría contribuir a este proyecto o si preferís no hacerlo. No se realiza ningún cobro ni compromiso desde esta página.</p>
          <div className="buttons">
            <button disabled={!!choice || busy} onClick={() => submitVote("yes")}>Sí, me gustaría contribuir ↗</button>
            <button disabled={!!choice || busy} onClick={() => submitVote("no")}>Por ahora, no →</button>
          </div>
          <small aria-live="polite">{message}</small>
          <div className="results">
            <div>RESPUESTAS REGISTRADAS <span>{total} EN TOTAL</span></div>
            <div className="bar"><i style={{ width: `${yesPercent}%` }} /></div>
            <p><b>{votes.yes}</b> quieren contribuir　 <b>{votes.no}</b> prefieren que no</p>
            <small>El registro muestra respuestas totales, no nombres.</small>
          </div>
        </div>
      </section>

      <footer>
        ◈ PROYECTO FEP
        <span>HECHO CON CURIOSIDAD Y GANAS DE CREAR.</span>
        <a href="#top">VOLVER ARRIBA ↑</a>
      </footer>
    </main>
  );
}
