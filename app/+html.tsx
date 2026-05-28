import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * Custom HTML wrapper for Expo Router web.
 *
 * - Prevents zoom on double-tap or input focus on mobile browsers
 * - Prevents viewport jump/shift when software keyboard opens
 * - Sets the theme color for the browser chrome
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        {/* ── Viewport: no user-scaling, cover safe areas ── */}
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
        />
        {/* ── Prevent layout shift when soft keyboard opens ── */}
        <meta name="interactive-widget" content="resizes-content" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <title>EverythingBook</title>
        {/*
          Disable body scroll bounce on iOS Safari while keeping inner
          scroll views scrollable. Also prevent tap-highlight flash.
        */}
        <ScrollViewStyleReset />
        <style>{`
          html, body, #root {
            height: 100%;
            overflow: hidden;
            overscroll-behavior: none;
          }
          /* Prevent input zoom on iOS Safari (font-size must be ≥16px) */
          input, textarea, select {
            font-size: 16px !important;
          }
          /* Kill tap highlight on all interactive elements */
          * {
            -webkit-tap-highlight-color: transparent;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
