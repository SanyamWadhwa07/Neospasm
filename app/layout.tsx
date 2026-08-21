import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeoSpasm: Infant Epilepsy Monitoring",
  description: "EEG monitoring and review for infantile epileptic spasm syndrome",
};

// Runs before hydration so the page never flashes light-then-dark: reads the
// saved preference (or falls back to the OS setting) and stamps data-theme
// on <html> before first paint.
const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem("neospasm-theme");
    var theme = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // data-theme is set by the inline script below, before React hydrates.
  // suppressHydrationWarning tells React that's expected, not a bug.
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
