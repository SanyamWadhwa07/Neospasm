import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeoSpasm — Infant Epilepsy Monitoring",
  description: "Real-time EEG and video fusion monitoring for infantile epileptic spasm syndrome",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
