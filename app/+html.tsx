import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
        />
        <meta name="interactive-widget" content="resizes-content" />
        <meta name="theme-color" content="#07060e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <title>EverythingBook</title>

        {/* ── Custom fonts: Fraunces (display serif) + Syne (geometric grotesque) ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,800;0,9..144,900;1,9..144,400;1,9..144,700&family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        <ScrollViewStyleReset />

        <style>{`
          html, body, #root {
            height: 100%;
            overflow: hidden;
            overscroll-behavior: none;
          }

          /* ── CSS custom properties for fonts ── */
          :root {
            --ff-display: 'Fraunces', Georgia, serif;
            --ff-body:    'Syne', system-ui, sans-serif;
          }

          /* Prevent input zoom on iOS Safari */
          input, textarea, select { font-size: 16px !important; }
          * { -webkit-tap-highlight-color: transparent; }

          /* ──────────────────────────────────────────
             KEYFRAME ANIMATIONS
          ────────────────────────────────────────── */
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: translateY(0px); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
            50%       { transform: translateY(-18px) rotate(-1.5deg); }
          }
          @keyframes glowPulse {
            0%, 100% { opacity: 0.45; transform: scale(1); }
            50%       { opacity: 0.7;  transform: scale(1.06); }
          }
          @keyframes gradientDrift {
            0%, 100% { background-position: 0% 50%; }
            50%       { background-position: 100% 50%; }
          }
          @keyframes marqueeScroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          @keyframes cardReveal {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          /* ── Hover utilities ── */
          .card-lift {
            transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
                        border-color 0.2s ease,
                        box-shadow 0.25s ease;
          }
          .card-lift:hover {
            transform: translateY(-4px);
            border-color: rgba(99,102,241,0.35) !important;
            box-shadow: 0 16px 40px rgba(99,102,241,0.12), 0 4px 12px rgba(0,0,0,0.3) !important;
          }
          .btn-lift {
            transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
          }
          .btn-lift:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 36px rgba(99,102,241,0.45) !important;
          }
          .btn-lift:active { transform: translateY(0); }

          .link-hover {
            transition: color 0.15s ease;
          }
          .link-hover:hover { color: #818cf8 !important; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
