import "./globals.css";
import Intro from "./Intro";

export const metadata = {
  title: "Proyecto Fep — Crear, aprender, construir",
  description:
    "Una propuesta familiar para combinar creatividad, inteligencia artificial y fabricación 3D."
};

// Decide antes del primer pintado si corresponde mostrar la intro (evita ver la web un instante y luego la intro).
// No se muestra si ya se vio en esta pestaña (sessionStorage) o si el sistema pide menos movimiento.
const introGate = `(function(){var h=document.documentElement;try{if(sessionStorage.getItem("fep-intro-seen")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches){h.classList.add("fep-intro-off");return}}catch(e){}h.classList.add("fep-intro-on")})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introGate }} />
      </head>
      <body>
        {children}
        <Intro />
      </body>
    </html>
  );
}
