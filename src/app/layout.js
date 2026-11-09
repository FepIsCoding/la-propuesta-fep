import "./globals.css";

export const metadata = {
  title: "Proyecto Fep — Crear, aprender, construir",
  description:
    "Una propuesta familiar para combinar creatividad, inteligencia artificial y fabricación 3D."
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
