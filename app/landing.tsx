/**
 * EverythingBook — Landing Page
 *
 * Design: Dark editorial hero + warm light content sections.
 * Fraunces (display serif) + Syne (geometric grotesque).
 * Hero / CTA / Footer stay atmospheric dark.
 * Features / How It Works / Testimonials / Pricing use warm light
 * (#faf8f5 / #fff) for excellent readability and visual rhythm.
 */

import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  type LayoutChangeEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// ─── Dark palette (hero / CTA / footer) ──────────────────────────────────────
const C = {
  bg:       "#07060e",
  bgCard:   "#0d0b18",
  bgSurf:   "#111028",
  bgMid:    "#0a091a",
  text:     "#f2ede6",
  textSec:  "#9490aa",   // lifted from #7a748f — legible on dark bg
  textMute: "#6b6882",   // lifted from #36324a — now actually visible
  border:   "#18162c",
  borderHi: "#25224a",
  accent:   "#6366f1",
  accentHi: "#818cf8",
  accentBg: "#0f0e2a",
  amber:    "#f59e0b",
  green:    "#10b981",
};

// ─── Light palette (how / features / testimonials / pricing) ─────────────────
const L = {
  bg:          "#faf8f5",
  bgAlt:       "#ffffff",
  bgCard:      "#ffffff",
  text:        "#1c1917",
  textSec:     "#57534e",
  textMute:    "#a8a29e",
  border:      "#e8e3dc",
  borderHi:    "#d4cfc8",
  accent:      "#6366f1",
  accentHi:    "#4338ca",
  accentBg:    "#eef2ff",
  accentBdr:   "#c7d2fe",
  amber:       "#d97706",
  green:       "#059669",
};

// ─── Typography helpers ───────────────────────────────────────────────────────
const FF = {
  display: Platform.select({ web: "'Fraunces', Georgia, serif",    default: undefined }),
  body:    Platform.select({ web: "'Syne', system-ui, sans-serif", default: undefined }),
};

// ─── CSS helpers (web-only) ───────────────────────────────────────────────────
const sh = (v: string) => Platform.select({ default: { boxShadow: v }  as any }) ?? {};
const an = (v: string) => Platform.select({ default: { animation: v }  as any }) ?? {};
const bg = (v: string) => Platform.select({ default: { background: v } as any }) ?? {};

// ─── Content data ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "flash",          col: "#6366f1", bgc: "#eef2ff", title: "Smart Planner",    body: "Tasks auto-sort into Today, Tomorrow, This Week, and Later — so every morning opens with a clear agenda." },
  { icon: "pencil-outline", col: "#0ea5e9", bgc: "#e0f2fe", title: "Quick Capture",    body: "Drop any task, note, or idea in seconds. No folder decisions. The app files it for you." },
  { icon: "timer-outline",  col: "#ef4444", bgc: "#fee2e2", title: "Focus Timer",      body: "Pomodoro sessions built-in. Track deep-work hours and watch your streaks compound week over week." },
  { icon: "moon-outline",   col: "#8b5cf6", bgc: "#ede9fe", title: "Reflection",       body: "A 2-minute end-of-day ritual. Log what you shipped, set tomorrow's one thing, and close the loop." },
  { icon: "folder-outline", col: "#10b981", bgc: "#d1fae5", title: "Full Archive",     body: "Every note and completed task is stored and fully searchable forever. Your whole history at hand." },
  { icon: "sunny-outline",  col: "#f59e0b", bgc: "#fef3c7", title: "Beautiful Themes", body: "Warm light and dark modes. Follows your system automatically — or pin either. Designed for long sessions." },
];

const HOW = [
  { n: "01", title: "Capture instantly",    body: "Type anything into the quick-capture bar. Don't think — just type. The app understands context and places it automatically." },
  { n: "02", title: "See your day clearly", body: "Wake up to a clean board: Today, Tomorrow, This Week, Later. No hunting, no guessing. Your priorities are always on the surface." },
  { n: "03", title: "Reflect and reset",    body: "Close each day with two questions. What did you accomplish? What's the one priority tomorrow? Start every morning with intention." },
];

const TESTIMONIALS = [
  { init: "P", col: "#6366f1", name: "Priya S.",  role: "Medical student",     q: "I deleted four apps the day I found EverythingBook. It just handles everything." },
  { init: "J", col: "#0ea5e9", name: "James L.",  role: "Software engineer",   q: "The planner is the best I've ever used. I always know exactly what needs to happen today." },
  { init: "S", col: "#10b981", name: "Sarah K.",  role: "High school teacher", q: "Quick capture alone changed my workflow. I never lose a thought or task anymore." },
];

const PRICING_FEATURES = [
  "Unlimited tasks & notes",
  "Smart daily planner",
  "Built-in focus timer",
  "Evening reflections",
  "Full searchable archive",
  "Beautiful light & dark themes",
  "Sync across all your devices",
];

const CONTENT_MAX = 1120;
const GAP         = 20;

const NAV_LINKS = [
  { label: "How it works", key: "howItWorks" as const },
  { label: "Features",     key: "features"   as const },
  { label: "Pricing",      key: "pricing"    as const },
];

type SectionKey = typeof NAV_LINKS[number]["key"];

// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { width } = useWindowDimensions();
  const router    = useRouter();
  const isWide    = width >= 900;
  const isMid     = width >= 580;
  const pad       = isWide ? 68 : 24;
  const contentW  = Math.min(width, CONTENT_MAX);

  // ── Scroll-to navigation ──────────────────────────────────────────────────
  const scrollRef = useRef<ScrollView>(null);
  const sectionY  = useRef<Partial<Record<SectionKey, number>>>({});

  function scrollTo(key: SectionKey) {
    const y = sectionY.current[key] ?? 0;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 60), animated: true });
  }

  function track(key: SectionKey) {
    return (e: LayoutChangeEvent) => {
      sectionY.current[key] = e.nativeEvent.layout.y;
    };
  }

  function goAuth() {
    router.push({ pathname: "/(auth)" as any, params: { fromLanding: "1" } });
  }

  const dotGrid = Platform.select({
    default: {
      backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
      backgroundSize:  "28px 28px",
    } as any,
  }) ?? {};

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} bounces={false}>

        {/* ══ NAVBAR ════════════════════════════════════════════════════════ */}
        <View style={[
          {
            flexDirection: "row", alignItems: "center",
            paddingHorizontal: pad, paddingVertical: 16,
            borderBottomWidth: 1, borderBottomColor: C.border,
          },
          Platform.select({ default: {
            position: "sticky", top: 0, zIndex: 999,
            backgroundColor: "rgba(7,6,14,0.9)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
          } as any }),
        ]}>

          {/* Logo */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
            <View style={[{
              width: 32, height: 32, borderRadius: 9,
              backgroundColor: C.accentBg, borderWidth: 1, borderColor: C.borderHi,
              alignItems: "center", justifyContent: "center",
            }, sh("0 0 12px rgba(99,102,241,0.3)")]}>
              <Text style={{ fontSize: 16 }}>📖</Text>
            </View>
            <Text style={{ fontFamily: FF.display, fontSize: 17, fontWeight: "800", color: C.text, letterSpacing: -0.3 }}>
              EverythingBook
            </Text>
          </View>

          {/* Nav links — desktop only, box-none so clicks reach the logo/actions behind */}
          {isWide && (
            <View
              pointerEvents="box-none"
              style={[{
                position: "absolute" as any, left: 0, right: 0,
                flexDirection: "row", justifyContent: "center", alignItems: "center",
              }]}
            >
              <View style={{ flexDirection: "row", gap: 32 }}>
                {NAV_LINKS.map(({ label, key }) => (
                  <TouchableOpacity key={key} onPress={() => scrollTo(key)} style={{ paddingVertical: 8, paddingHorizontal: 4 }}>
                    <Text
                      className="link-hover"
                      style={{ fontFamily: FF.body, fontSize: 13, fontWeight: "500", color: C.textSec }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* CTA actions */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity onPress={goAuth} style={{ paddingHorizontal: 14, paddingVertical: 8 }}>
              <Text
                className="link-hover"
                style={{ fontFamily: FF.body, fontSize: 13, fontWeight: "600", color: C.textSec }}
              >
                Log in
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goAuth}
              className="btn-lift"
              style={[{
                paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22,
                borderWidth: 1, borderColor: C.accent, backgroundColor: C.accentBg,
              }, sh("0 0 16px rgba(99,102,241,0.2)")]}
            >
              <Text style={{ fontFamily: FF.body, fontSize: 13, fontWeight: "700", color: C.accentHi }}>
                Get started free
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <View style={[{
          overflow: "hidden",
          paddingTop: isWide ? 110 : 60,
          paddingBottom: isWide ? 100 : 60,
          backgroundColor: C.bg,
        }, dotGrid]}>

          {/* Radial glow */}
          <View style={[{
            position: "absolute", top: -120,
            width: 700, height: 500,
            left: "50%" as any, marginLeft: -350,
            borderRadius: 350,
          }, Platform.select({ default: {
            background: "radial-gradient(ellipse, rgba(99,102,241,0.22) 0%, transparent 70%)",
            filter: "blur(48px)",
            animation: "glowPulse 7s ease-in-out infinite",
          } as any }) ?? {}]} />

          <View style={{
            maxWidth: CONTENT_MAX, alignSelf: "center", width: "100%",
            paddingHorizontal: pad,
            flexDirection: isWide ? "row" : "column",
            alignItems: isWide ? "center" : "stretch",
            gap: isWide ? 80 : 52,
          }}>

            {/* Copy */}
            <View style={{ flex: isWide ? 1 : undefined }}>
              {/* Eyebrow */}
              <View style={[{
                flexDirection: "row", alignItems: "center", gap: 7,
                backgroundColor: C.accentBg, paddingHorizontal: 13, paddingVertical: 6,
                borderRadius: 20, alignSelf: "flex-start", marginBottom: 28,
                borderWidth: 1, borderColor: C.borderHi,
              }, an("fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both")]}>
                <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.accentHi }} />
                <Text style={{ fontFamily: FF.body, fontSize: 11, fontWeight: "700", color: C.accentHi, letterSpacing: 0.4 }}>
                  Your all-in-one productivity book
                </Text>
              </View>

              {/* Headline */}
              <Text style={[{
                fontFamily: FF.display,
                fontSize: isWide ? 66 : 42,
                fontWeight: "900",
                color: C.text,
                letterSpacing: -2,
                lineHeight: isWide ? 74 : 50,
                marginBottom: 20,
              }, an("fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s both")]}>
                {"Stop juggling\n"}
                <Text style={[
                  { fontFamily: FF.display, fontStyle: "italic" },
                  bg(`linear-gradient(135deg, ${C.accentHi}, #a78bfa)`) as any,
                  Platform.select({ default: {
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  } as any }) ?? {},
                ]}>
                  {"5 apps."}
                </Text>
                {"\nUse one."}
              </Text>

              {/* Body */}
              <Text style={[{
                fontFamily: FF.body,
                fontSize: isWide ? 18 : 16,
                color: C.textSec,
                lineHeight: isWide ? 30 : 27,
                marginBottom: 38,
                maxWidth: 440,
              }, an("fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.28s both")]}>
                Tasks, daily planner, focus timer, and evening reflections —
                all in one beautifully simple space. Built for students and
                professionals who want clarity without complexity.
              </Text>

              {/* CTAs */}
              <View style={[{
                flexDirection: "row", gap: 14, alignItems: "center",
                flexWrap: "wrap", marginBottom: 40,
              }, an("fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both")]}>
                <TouchableOpacity
                  onPress={goAuth}
                  className="btn-lift"
                  style={[{
                    paddingHorizontal: 28, paddingVertical: 15, borderRadius: 28,
                    backgroundColor: C.accent,
                    flexDirection: "row", alignItems: "center", gap: 7,
                  }, sh("0 6px 32px rgba(99,102,241,0.42)")]}
                >
                  <Text style={{ fontFamily: FF.body, fontSize: 15, fontWeight: "800", color: "#fff" }}>Start for free</Text>
                  <Ionicons name="arrow-forward" size={15} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={goAuth} style={{ paddingVertical: 15, paddingHorizontal: 4 }}>
                  <Text
                    className="link-hover"
                    style={{ fontFamily: FF.body, fontSize: 14, fontWeight: "600", color: C.textSec }}
                  >
                    Already a member?{" "}
                    <Text style={{ color: C.accentHi }}>Sign in →</Text>
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Social proof */}
              <View style={[{
                flexDirection: "row", alignItems: "center", gap: 13,
              }, an("fadeIn 0.8s ease 0.6s both")]}>
                <View style={{ flexDirection: "row" }}>
                  {["#6366f1","#7c6af1","#818cf8","#a78bfa","#818cf8"].map((c, i) => (
                    <View key={i} style={{
                      width: 28, height: 28, borderRadius: 14, backgroundColor: c,
                      marginLeft: i > 0 ? -7 : 0,
                      borderWidth: 1.5, borderColor: C.bg,
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: "800", color: "#fff", fontFamily: FF.body }}>
                        {["N","A","J","S","M"][i]}
                      </Text>
                    </View>
                  ))}
                </View>
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    {[1,2,3,4,5].map(s => <Text key={s} style={{ fontSize: 12, color: C.amber }}>★</Text>)}
                    <Text style={{ fontFamily: FF.body, fontSize: 12, fontWeight: "700", color: C.text, marginLeft: 3 }}>5.0</Text>
                  </View>
                  <Text style={{ fontFamily: FF.body, fontSize: 12, color: C.textSec, marginTop: 1 }}>
                    <Text style={{ fontWeight: "700", color: C.text }}>1,000+</Text> people organized
                  </Text>
                </View>
              </View>
            </View>

            {/* Phone mockup */}
            <View style={[{
              alignSelf: isWide ? "auto" : "center",
              flexShrink: 0,
            }, an("fadeIn 0.9s ease 0.3s both")]}>
              <View style={Platform.select({ default: { animation: "float 5s ease-in-out infinite" } as any }) ?? {}}>
                <PhoneMockup />
              </View>
            </View>
          </View>
        </View>

        {/* ══ TRUST STRIP ═══════════════════════════════════════════════════ */}
        <View style={[{
          borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.border,
          paddingVertical: 20,
          backgroundColor: C.bgCard,
        }]}>
          <View style={[{ flexDirection: "row" }, Platform.select({ default: { overflow: "hidden" } as any }) ?? {}]}>
            <View style={[{
              flexDirection: "row", alignItems: "center", gap: 48, paddingHorizontal: 40,
            }, Platform.select({ default: {
              animation: "marqueeScroll 28s linear infinite",
              flexShrink: 0, whiteSpace: "nowrap",
            } as any }) ?? {}]}>
              {[
                "Todoist","Notion","Toggl","Day One","Apple Reminders",
                "Todoist","Notion","Toggl","Day One","Apple Reminders",
              ].map((app, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.textMute }} />
                  <Text style={{ fontFamily: FF.body, fontSize: 12, fontWeight: "600", color: C.textSec, letterSpacing: 1 }}>
                    {app.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
        <View
          onLayout={track("howItWorks")}
          style={{
            paddingVertical: isWide ? 104 : 68,
            backgroundColor: L.bg,
          }}
        >
          <View style={{
            maxWidth: 780, alignSelf: "center", width: "100%",
            paddingHorizontal: pad, gap: 48,
          }}>
            <View style={{ gap: 12, alignItems: "center" }}>
              <LightSectionLabel>HOW IT WORKS</LightSectionLabel>
              <LightSectionTitle isWide={isWide}>{"Three habits.\nOne system."}</LightSectionTitle>
            </View>
            <View style={{ gap: 14 }}>
              {HOW.map((step, i) => (
                <HowCard key={i} step={step} />
              ))}
            </View>
          </View>
        </View>

        {/* ══ FEATURES ══════════════════════════════════════════════════════ */}
        <View
          onLayout={track("features")}
          style={{
            paddingVertical: isWide ? 104 : 68,
            backgroundColor: L.bgAlt,
            borderTopWidth: 1, borderTopColor: L.border,
          }}
        >
          <View style={{
            maxWidth: CONTENT_MAX, alignSelf: "center", width: "100%",
            paddingHorizontal: pad, gap: 52,
          }}>
            <View style={{ gap: 12, alignItems: "center" }}>
              <LightSectionLabel>FEATURES</LightSectionLabel>
              <LightSectionTitle isWide={isWide}>{"Everything you need.\nNothing you don't."}</LightSectionTitle>
              <Text style={{
                fontFamily: FF.body, fontSize: 16, color: L.textSec,
                textAlign: "center", maxWidth: 400, lineHeight: 26,
              }}>
                Six integrated features that keep every corner of your life in one place.
              </Text>
            </View>
            <LightFeatureGrid
              features={FEATURES}
              isWide={isWide} isMid={isMid}
              contentW={contentW} pad={pad}
            />
          </View>
        </View>

        {/* ══ TESTIMONIALS ══════════════════════════════════════════════════ */}
        <View style={{
          paddingVertical: isWide ? 104 : 68,
          backgroundColor: L.bg,
          borderTopWidth: 1, borderTopColor: L.border,
        }}>
          <View style={{
            maxWidth: CONTENT_MAX, alignSelf: "center", width: "100%",
            paddingHorizontal: pad, gap: 52,
          }}>
            <View style={{ gap: 12, alignItems: "center" }}>
              <LightSectionLabel>WHAT PEOPLE SAY</LightSectionLabel>
              <LightSectionTitle isWide={isWide}>Real people. Real results.</LightSectionTitle>
            </View>
            <View style={{ flexDirection: isWide ? "row" : "column", gap: 18 }}>
              {TESTIMONIALS.map((t, i) => (
                <View key={i} className="card-lift" style={[{
                  flex: isWide ? 1 : undefined,
                  backgroundColor: L.bgCard, borderRadius: 20, padding: 28,
                  borderWidth: 1, borderColor: L.border,
                }, sh("0 4px 20px rgba(0,0,0,0.07)")]}>
                  <View style={{ flexDirection: "row", gap: 2, marginBottom: 18 }}>
                    {[1,2,3,4,5].map(s => <Text key={s} style={{ fontSize: 14, color: L.amber }}>★</Text>)}
                  </View>
                  <Text style={{
                    fontFamily: FF.body, fontSize: 15, color: L.text,
                    lineHeight: 25, fontWeight: "500", marginBottom: 24, fontStyle: "italic",
                  }}>
                    "{t.q}"
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
                    <View style={{
                      width: 38, height: 38, borderRadius: 19,
                      backgroundColor: t.col + "22", alignItems: "center", justifyContent: "center",
                      borderWidth: 1, borderColor: t.col + "44",
                    }}>
                      <Text style={{ fontFamily: FF.body, fontSize: 14, fontWeight: "800", color: t.col }}>{t.init}</Text>
                    </View>
                    <View>
                      <Text style={{ fontFamily: FF.body, fontSize: 13, fontWeight: "700", color: L.text }}>{t.name}</Text>
                      <Text style={{ fontFamily: FF.body, fontSize: 11, color: L.textSec, marginTop: 1 }}>{t.role}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ══ PRICING ═══════════════════════════════════════════════════════ */}
        <View
          onLayout={track("pricing")}
          style={{
            paddingVertical: isWide ? 104 : 68,
            backgroundColor: L.bgAlt,
            borderTopWidth: 1, borderTopColor: L.border,
          }}
        >
          <View style={{
            maxWidth: 620, alignSelf: "center", width: "100%",
            paddingHorizontal: pad, alignItems: "center",
          }}>
            <LightSectionLabel>PRICING</LightSectionLabel>
            <View style={{ height: 20 }} />

            <Text style={{
              fontFamily: FF.display,
              fontSize: isWide ? 58 : 42, fontWeight: "900",
              color: L.text, letterSpacing: -2, textAlign: "center",
              lineHeight: isWide ? 66 : 50, marginBottom: 12,
            }}>
              It's free.
            </Text>
            <Text style={{
              fontFamily: FF.display, fontSize: isWide ? 24 : 19, fontWeight: "400",
              color: L.textSec, fontStyle: "italic", textAlign: "center",
              lineHeight: isWide ? 32 : 28, marginBottom: 48,
            }}>
              Always. No trial. No credit card. No catch.
            </Text>

            {/* Pricing card */}
            <View style={[{
              backgroundColor: L.bgCard, borderRadius: 28,
              padding: isWide ? 44 : 28,
              borderWidth: 1, borderColor: L.border,
              width: "100%",
            }, sh("0 8px 40px rgba(0,0,0,0.08)")]}>

              {/* Plan header */}
              <View style={{
                flexDirection: "row", alignItems: "flex-start",
                justifyContent: "space-between", marginBottom: 28,
              }}>
                <View>
                  <Text style={{
                    fontFamily: FF.body, fontSize: 11, fontWeight: "700",
                    color: L.textMute, letterSpacing: 1.2, marginBottom: 4,
                  }}>
                    EVERYTHING PLAN
                  </Text>
                  <Text style={{
                    fontFamily: FF.display, fontSize: 52, fontWeight: "900",
                    color: L.text, letterSpacing: -2, lineHeight: 56,
                  }}>
                    $0
                  </Text>
                  <Text style={{ fontFamily: FF.body, fontSize: 14, color: L.textSec, marginTop: 2 }}>
                    forever free
                  </Text>
                </View>
                <View style={{
                  backgroundColor: L.accentBg, paddingHorizontal: 16, paddingVertical: 9,
                  borderRadius: 20, borderWidth: 1, borderColor: L.accentBdr,
                }}>
                  <Text style={{ fontFamily: FF.body, fontSize: 13, fontWeight: "700", color: L.accentHi }}>
                    🎉 No cost ever
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: L.border, marginBottom: 28 }} />

              {/* Feature checklist */}
              <View style={{ gap: 16, marginBottom: 36 }}>
                {PRICING_FEATURES.map((f, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                    <View style={{
                      width: 24, height: 24, borderRadius: 12,
                      backgroundColor: L.accentBg, borderWidth: 1, borderColor: L.accentBdr,
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Ionicons name="checkmark" size={13} color={L.accentHi} />
                    </View>
                    <Text style={{ fontFamily: FF.body, fontSize: 15, color: L.text, fontWeight: "500" }}>
                      {f}
                    </Text>
                  </View>
                ))}
              </View>

              {/* CTA */}
              <TouchableOpacity
                onPress={goAuth}
                className="btn-lift"
                style={[{
                  paddingVertical: 17, borderRadius: 24,
                  backgroundColor: L.accent,
                  flexDirection: "row", alignItems: "center",
                  justifyContent: "center", gap: 8,
                }, sh("0 6px 32px rgba(99,102,241,0.35)")]}
              >
                <Text style={{ fontFamily: FF.body, fontSize: 16, fontWeight: "800", color: "#fff" }}>
                  Get started — it's free
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ══ CTA SECTION ═══════════════════════════════════════════════════ */}
        <View style={[{
          paddingVertical: isWide ? 120 : 80,
          overflow: "hidden",
          borderTopWidth: 1, borderTopColor: C.border,
        }, bg("linear-gradient(135deg, #0a091a 0%, #0d0b18 40%, #130e28 100%)") as any]}>

          {/* Orb */}
          <View style={[{
            position: "absolute", width: 600, height: 400,
            top: "50%" as any, marginTop: -200,
            left: "50%" as any, marginLeft: -300,
          }, Platform.select({ default: {
            background: "radial-gradient(ellipse, rgba(99,102,241,0.14) 0%, transparent 70%)",
            filter: "blur(60px)",
          } as any }) ?? {}]} />

          <View style={{
            maxWidth: 600, alignSelf: "center", alignItems: "center",
            paddingHorizontal: 24,
          }}>
            {/* Icon row */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 40 }}>
              {(["flash","checkmark-done","timer-outline","moon-outline"] as const).map((icon, i) => (
                <View key={i} style={[{
                  width: 48, height: 48, borderRadius: 14,
                  backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderHi,
                  alignItems: "center", justifyContent: "center",
                }, sh("0 4px 16px rgba(0,0,0,0.4)")]}>
                  <Ionicons name={icon} size={20} color={C.accentHi} />
                </View>
              ))}
            </View>

            <Text style={{
              fontFamily: FF.display,
              fontSize: isWide ? 54 : 38, fontWeight: "900", color: C.text,
              letterSpacing: -2, textAlign: "center",
              lineHeight: isWide ? 62 : 46, marginBottom: 18,
            }}>
              Your most organized{"\n"}
              <Text style={[
                { fontFamily: FF.display, fontStyle: "italic" },
                bg("linear-gradient(135deg, #818cf8, #a78bfa)") as any,
                Platform.select({ default: {
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                } as any }) ?? {},
              ]}>
                life
              </Text>
              {" starts today."}
            </Text>

            <Text style={{
              fontFamily: FF.body, fontSize: 17, color: C.textSec,
              textAlign: "center", lineHeight: 27, marginBottom: 44,
            }}>
              Free to start. No credit card.{"\n"}No complexity. Just clarity.
            </Text>

            <TouchableOpacity
              onPress={goAuth}
              className="btn-lift"
              style={[{
                paddingHorizontal: 36, paddingVertical: 18, borderRadius: 30,
                backgroundColor: C.accent,
                flexDirection: "row", alignItems: "center", gap: 8,
              }, sh("0 8px 40px rgba(99,102,241,0.5)")]}
            >
              <Text style={{ fontFamily: FF.body, fontSize: 17, fontWeight: "800", color: "#fff" }}>
                Get EverythingBook free
              </Text>
              <Ionicons name="arrow-forward" size={17} color="#fff" />
            </TouchableOpacity>

            <Text style={{ fontFamily: FF.body, fontSize: 13, color: C.textSec, marginTop: 20 }}>
              Already a member?{" "}
              <Text
                onPress={goAuth}
                className="link-hover"
                style={{ color: C.accentHi, fontWeight: "700" }}
              >
                Sign in →
              </Text>
            </Text>
          </View>
        </View>

        {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
        <View style={{
          backgroundColor: C.bg,
          borderTopWidth: 1, borderTopColor: C.border,
          paddingVertical: 32, paddingHorizontal: pad,
        }}>
          <View style={{
            maxWidth: CONTENT_MAX, alignSelf: "center", width: "100%",
            flexDirection: isWide ? "row" : "column",
            alignItems: isWide ? "center" : "flex-start", gap: 16,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 9, flex: 1 }}>
              <View style={{
                width: 26, height: 26, borderRadius: 7,
                backgroundColor: C.accentBg, borderWidth: 1, borderColor: C.borderHi,
                alignItems: "center", justifyContent: "center",
              }}>
                <Text style={{ fontSize: 13 }}>📖</Text>
              </View>
              <Text style={{ fontFamily: FF.display, fontSize: 14, fontWeight: "700", color: C.text }}>
                EverythingBook
              </Text>
            </View>
            {isWide && (
              <View style={{ flexDirection: "row", gap: 28 }}>
                {NAV_LINKS.map(({ label, key }) => (
                  <TouchableOpacity key={key} onPress={() => scrollTo(key)}>
                    <Text
                      className="link-hover"
                      style={{ fontFamily: FF.body, fontSize: 13, color: C.textSec, fontWeight: "500" }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={goAuth}>
                  <Text
                    className="link-hover"
                    style={{ fontFamily: FF.body, fontSize: 13, color: C.textSec, fontWeight: "500" }}
                  >
                    Sign in
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={{ fontFamily: FF.body, fontSize: 12, color: C.textSec }}>
              © 2026 EverythingBook
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Light section components ─────────────────────────────────────────────────

function LightSectionLabel({ children }: { children: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <View style={{
        backgroundColor: L.accentBg, paddingHorizontal: 14, paddingVertical: 6,
        borderRadius: 20, borderWidth: 1, borderColor: L.accentBdr,
      }}>
        <Text style={{
          fontFamily: FF.body, fontSize: 10, fontWeight: "700",
          color: L.accentHi, letterSpacing: 1.4,
        }}>
          {children}
        </Text>
      </View>
    </View>
  );
}

function LightSectionTitle({ children, isWide }: { children: string; isWide: boolean }) {
  return (
    <Text style={{
      fontFamily: FF.display,
      fontSize: isWide ? 46 : 34, fontWeight: "900",
      color: L.text, letterSpacing: -1.5, textAlign: "center",
      lineHeight: isWide ? 54 : 42, alignSelf: "center",
    }}>
      {children}
    </Text>
  );
}

// ─── Light feature grid ───────────────────────────────────────────────────────

function LightFeatureGrid({ features, isWide, isMid, contentW, pad }: {
  features: typeof FEATURES;
  isWide: boolean; isMid: boolean; contentW: number; pad: number;
}) {
  const cols   = isWide ? 3 : isMid ? 2 : 1;
  const innerW = contentW - pad * 2;
  const gapTot = (cols - 1) * GAP;
  const cardW  = cols > 1 ? Math.floor((innerW - gapTot) / cols) : undefined;

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP, justifyContent: "center" }}>
      {features.map((f, i) => (
        <View
          key={i}
          className="card-lift"
          style={[{
            width: cardW ?? "100%",
            backgroundColor: L.bgCard, borderRadius: 20, padding: 26,
            borderWidth: 1, borderColor: L.border,
          }, sh("0 4px 20px rgba(0,0,0,0.07)")]}
        >
          <View style={{
            width: 46, height: 46, borderRadius: 14,
            backgroundColor: f.bgc, alignItems: "center", justifyContent: "center",
            marginBottom: 16,
          }}>
            <Ionicons name={f.icon as any} size={22} color={f.col} />
          </View>
          <Text style={{
            fontFamily: FF.display, fontSize: 17, fontWeight: "700",
            color: L.text, marginBottom: 9, letterSpacing: -0.3,
          }}>
            {f.title}
          </Text>
          <Text style={{ fontFamily: FF.body, fontSize: 13.5, color: L.textSec, lineHeight: 22 }}>
            {f.body}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── How-it-works card (light) ────────────────────────────────────────────────

function HowCard({ step }: { step: typeof HOW[0] }) {
  return (
    <View
      className="card-lift"
      style={[{
        flexDirection: "row", gap: 20, alignItems: "flex-start",
        backgroundColor: L.bgCard, borderRadius: 20, padding: 26,
        borderWidth: 1, borderColor: L.border,
      }, sh("0 4px 20px rgba(0,0,0,0.07)")]}
    >
      <View style={{
        width: 46, height: 46, borderRadius: 13,
        backgroundColor: L.accentBg, borderWidth: 1, borderColor: L.accentBdr,
        alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Text style={{ fontFamily: FF.display, fontSize: 15, fontWeight: "900", color: L.accentHi }}>
          {step.n}
        </Text>
      </View>
      <View style={{ flex: 1, paddingTop: 2 }}>
        <Text style={{
          fontFamily: FF.display, fontSize: 18, fontWeight: "700",
          color: L.text, marginBottom: 7, letterSpacing: -0.3,
        }}>
          {step.title}
        </Text>
        <Text style={{ fontFamily: FF.body, fontSize: 14, color: L.textSec, lineHeight: 23 }}>
          {step.body}
        </Text>
      </View>
    </View>
  );
}

// ─── Phone mockup (dark — lives in the dark hero) ─────────────────────────────

function PhoneMockup() {
  const TASKS = [
    { title: "Review lecture notes", cat: "School", strip: "#7c3aed", catBg: "#1a1035", catCol: "#a78bfa" },
    { title: "Team standup @ 10am",  cat: "Work",   strip: "#0ea5e9", catBg: "#071622", catCol: "#38bdf8" },
    { title: "Evening run — 5 km",   cat: "Health", strip: "#e11d48", catBg: "#1a060d", catCol: "#f87171" },
  ];

  return (
    <View style={[{
      width: 252, height: 498,
      backgroundColor: "#0d0b18",
      borderRadius: 44, overflow: "hidden",
      borderWidth: 8, borderColor: "#1a1830",
    }, sh("0 0 0 1px #252340, 0 36px 80px rgba(99,102,241,0.28), 0 12px 32px rgba(0,0,0,0.6)")]}>

      {/* Dynamic island */}
      <View style={{ height: 24, backgroundColor: "#0d0b18", alignItems: "center", justifyContent: "flex-end", paddingBottom: 3 }}>
        <View style={{ width: 82, height: 9, borderRadius: 4.5, backgroundColor: "#07060e" }} />
      </View>

      {/* Status bar */}
      <View style={{ height: 26, backgroundColor: "#0d0b18", flexDirection: "row", alignItems: "center", paddingHorizontal: 14 }}>
        <Text style={{ fontFamily: FF.body, fontSize: 10, fontWeight: "700", color: C.text, flex: 1 }}>9:41</Text>
        <View style={{ flexDirection: "row", gap: 2.5, alignItems: "flex-end" }}>
          {[4,6,8,10].map((h, i) => (
            <View key={i} style={{ width: 3, height: h, backgroundColor: C.textSec, borderRadius: 1 }} />
          ))}
          <View style={{ width: 13, height: 7, borderRadius: 2, borderWidth: 1, borderColor: C.textSec, marginLeft: 3, overflow: "hidden" }}>
            <View style={{ width: "70%", height: "100%", backgroundColor: C.green }} />
          </View>
        </View>
      </View>

      {/* App nav */}
      <View style={{ height: 38, backgroundColor: "#0d0b18", flexDirection: "row", alignItems: "center", paddingHorizontal: 12 }}>
        <Text style={{ flex: 1, fontFamily: FF.body, fontSize: 10, fontWeight: "700", color: C.text }}>☀️ Good morning, Neil</Text>
        <View style={{
          width: 25, height: 25, borderRadius: 12.5,
          backgroundColor: C.accentBg, borderWidth: 1, borderColor: C.borderHi,
          alignItems: "center", justifyContent: "center",
        }}>
          <Text style={{ fontFamily: FF.body, fontSize: 9, fontWeight: "800", color: C.accentHi }}>N</Text>
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: C.border }} />

      {/* Date + stats */}
      <View style={{ paddingHorizontal: 12, paddingTop: 9, paddingBottom: 7 }}>
        <Text style={{ fontFamily: FF.body, fontSize: 9.5, color: C.textSec, marginBottom: 6 }}>Wednesday, May 28</Text>
        <View style={{ flexDirection: "row", gap: 5 }}>
          <View style={{ backgroundColor: C.accentBg, paddingHorizontal: 6, paddingVertical: 2.5, borderRadius: 7, borderWidth: 1, borderColor: C.borderHi }}>
            <Text style={{ fontFamily: FF.body, fontSize: 8, fontWeight: "700", color: C.accentHi }}>✓ 3 tasks today</Text>
          </View>
          <View style={{ backgroundColor: "#1a0608", paddingHorizontal: 6, paddingVertical: 2.5, borderRadius: 7, borderWidth: 1, borderColor: "#3a1015" }}>
            <Text style={{ fontFamily: FF.body, fontSize: 8, fontWeight: "700", color: "#f87171" }}>⚠ 1 overdue</Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 12, paddingBottom: 5 }}>
        <Text style={{ fontFamily: FF.body, fontSize: 7, fontWeight: "700", color: C.textMute, textTransform: "uppercase", letterSpacing: 0.8 }}>
          Today
        </Text>
      </View>

      {/* Task cards */}
      <View style={{ paddingHorizontal: 9, gap: 4 }}>
        {TASKS.map((t, i) => (
          <View key={i} style={[{
            backgroundColor: C.bgSurf, borderRadius: 10, flexDirection: "row", overflow: "hidden",
            borderWidth: 1, borderColor: C.border,
          }]}>
            <View style={{ width: 3, backgroundColor: t.strip }} />
            <View style={{ flex: 1, paddingHorizontal: 8, paddingVertical: 6 }}>
              <Text style={{ fontFamily: FF.body, fontSize: 9.5, fontWeight: "600", color: C.text, marginBottom: 3 }} numberOfLines={1}>
                {t.title}
              </Text>
              <View style={{ backgroundColor: t.catBg, paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 5, alignSelf: "flex-start" }}>
                <Text style={{ fontFamily: FF.body, fontSize: 7.5, fontWeight: "700", color: t.catCol }}>{t.cat}</Text>
              </View>
            </View>
            <View style={{ justifyContent: "center", paddingRight: 8 }}>
              <Text style={{ fontSize: 13, color: C.textMute, lineHeight: 15 }}>›</Text>
            </View>
          </View>
        ))}
      </View>

      {/* "Coming up" divider */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, marginTop: 9 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
        <Text style={{ fontFamily: FF.body, fontSize: 6.5, fontWeight: "700", color: C.textMute, textTransform: "uppercase", letterSpacing: 0.6 }}>
          Coming up
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
      </View>

      {/* Tomorrow card */}
      <View style={{ paddingHorizontal: 9, marginTop: 5 }}>
        <View style={[{ backgroundColor: C.bgSurf, borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: C.border }]}>
          <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, backgroundColor: "#f59e0b" }} />
          <View style={{ paddingLeft: 10, paddingRight: 8, paddingVertical: 7 }}>
            <View style={{ backgroundColor: "#1a1108", paddingHorizontal: 4, paddingVertical: 1.5, borderRadius: 5, alignSelf: "flex-start", marginBottom: 3 }}>
              <Text style={{ fontFamily: FF.body, fontSize: 7, fontWeight: "700", color: "#fbbf24" }}>🌅 Tomorrow</Text>
            </View>
            <Text style={{ fontFamily: FF.body, fontSize: 9.5, fontWeight: "600", color: C.text }}>Submit assignment draft</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      {/* Capture bar */}
      <View style={{
        backgroundColor: C.bgCard, borderTopWidth: 1, borderTopColor: C.border,
        paddingHorizontal: 9, paddingVertical: 7,
        flexDirection: "row", alignItems: "center", gap: 6,
      }}>
        <View style={[{
          width: 26, height: 26, borderRadius: 13,
          backgroundColor: C.accent, alignItems: "center", justifyContent: "center",
        }, sh("0 0 10px rgba(99,102,241,0.4)")]}>
          <Text style={{ fontSize: 17, color: "#fff", lineHeight: 20, marginTop: -1 }}>+</Text>
        </View>
        <View style={{
          flex: 1, backgroundColor: C.bgSurf, borderRadius: 11,
          paddingHorizontal: 8, paddingVertical: 4.5, borderWidth: 1, borderColor: C.border,
        }}>
          <Text style={{ fontFamily: FF.body, fontSize: 8.5, color: C.textSec }}>Capture anything quickly...</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={{
        height: 42, backgroundColor: C.bgCard,
        borderTopWidth: 1, borderTopColor: C.border,
        flexDirection: "row", alignItems: "center",
      }}>
        {[
          { icon: "sunny",            label: "Today",   on: true  },
          { icon: "checkmark-circle", label: "Tasks",   on: false },
          { icon: "calendar",         label: "Planner", on: false },
          { icon: "folder",           label: "Archive", on: false },
        ].map((tab, i) => (
          <View key={i} style={{ flex: 1, alignItems: "center", gap: 2 }}>
            <View style={{
              width: 34, height: 18, borderRadius: 9,
              backgroundColor: tab.on ? C.accentBg : "transparent",
              alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name={tab.icon as any} size={13} color={tab.on ? C.accentHi : C.textMute} />
            </View>
            <Text style={{
              fontFamily: FF.body, fontSize: 6.5,
              fontWeight: tab.on ? "700" : "500",
              color: tab.on ? C.accentHi : C.textMute,
            }}>
              {tab.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
