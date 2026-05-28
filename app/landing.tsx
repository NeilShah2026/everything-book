/**
 * EverythingBook — Landing Page
 * Premium design for unauthenticated web visitors.
 */

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// ─── Palette ──────────────────────────────────
const P = {
  bg:       "#ffffff",
  bgAlt:    "#f9f8ff",       // very subtle lavender tint
  bgDark:   "#0a0a14",       // near-black for CTA section
  text:     "#0d0d14",
  textSec:  "#5c5c7a",
  textMute: "#a0a0b8",
  border:   "#ebebf0",
  accent:   "#6366f1",
  accentHi: "#818cf8",
  accentBg: "#eef2ff",
  accentDk: "#4338ca",
  green:    "#10b981",
  amber:    "#f59e0b",
};

// Web-only box-shadow helper
const shadow = (val: string) =>
  Platform.select({ default: { boxShadow: val } as any }) ?? {};

// ─── Feature data ─────────────────────────────
const FEATURES = [
  { icon: "flash",          col: "#6366f1", bg: "#eef2ff", title: "Smart Planner",        body: "Tasks auto-sort into Today, Tomorrow, This Week, and Later. Every morning starts with perfect clarity." },
  { icon: "pencil-outline", col: "#0ea5e9", bg: "#e0f9ff", title: "Quick Capture",         body: "Jot anything in seconds. No folders, no friction. The app figures out where it belongs." },
  { icon: "timer-outline",  col: "#e11d48", bg: "#fff1f2", title: "Focus Timer",            body: "Built-in Pomodoro sessions track deep-work hours. Watch your streaks grow day by day." },
  { icon: "moon-outline",   col: "#7c3aed", bg: "#f5f3ff", title: "Daily Reflection",       body: "A 2-minute end-of-day ritual. Log your wins, set tomorrow's focus, and close the loop." },
  { icon: "folder-outline", col: "#059669", bg: "#ecfdf5", title: "Lifetime Archive",       body: "Every note and completed task stays searchable forever. Your whole history — always at hand." },
  { icon: "sunny-outline",  col: "#d97706", bg: "#fffbeb", title: "Beautiful Themes",       body: "Warm light and dark modes that follow your system. Designed to make work feel effortless." },
];

const TESTIMONIALS = [
  { init: "P", col: "#6366f1", name: "Priya S.",  role: "Medical student",    quote: "I deleted four apps the day I found EverythingBook. It just handles everything." },
  { init: "J", col: "#0ea5e9", name: "James L.",  role: "Software engineer",  quote: "The planner is the best I've used. I always know exactly what needs to happen today." },
  { init: "S", col: "#10b981", name: "Sarah K.",  role: "High school teacher", quote: "Quick capture alone changed my life. I never lose an idea or a task anymore." },
];

const HOW = [
  { n: "01", title: "Capture anything",     body: "Type a task, note, or idea into the capture bar. Don't think — just get it out of your head. The app sorts it automatically." },
  { n: "02", title: "See your day clearly", body: "Wake up to Today, Tomorrow, This Week, and Later. No hunting through lists. Priorities are always obvious." },
  { n: "03", title: "Reflect and reset",    body: "Close each day with a 2-minute check-in. What shipped? What's the one thing for tomorrow? Start fresh every morning." },
];

// ─────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const isMid  = width >= 580;
  const pad    = isWide ? 72 : 24;
  const mxW    = Math.min(width, 1160);

  function goAuth() { router.push("/(auth)" as any); }

  return (
    <View style={{ flex: 1, backgroundColor: P.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* ══ NAV ══════════════════════════════════ */}
        <View style={[
          {
            flexDirection: "row", alignItems: "center",
            paddingHorizontal: pad, paddingVertical: 14,
            backgroundColor: "rgba(255,255,255,0.9)",
            borderBottomWidth: 1, borderBottomColor: P.border,
          },
          Platform.select({ default: { position: "sticky", top: 0, zIndex: 999, backdropFilter: "blur(12px)" } as any }),
        ]}>
          {/* Logo */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 9, flex: 1 }}>
            <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: P.accent, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 15 }}>📖</Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: "800", color: P.text, letterSpacing: -0.2 }}>
              EverythingBook
            </Text>
          </View>

          {/* Center links */}
          {isWide && (
            <View style={{ flexDirection: "row", gap: 32, position: "absolute", left: 0, right: 0, justifyContent: "center", pointerEvents: "none" } as any}>
              {["Why it works", "Features", "Pricing"].map(l => (
                <Text key={l} style={{ fontSize: 14, fontWeight: "500", color: P.textSec }}>{l}</Text>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <TouchableOpacity onPress={goAuth} style={{ paddingHorizontal: 14, paddingVertical: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: P.textSec }}>Log in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goAuth}
              style={[{ paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22, backgroundColor: P.text }, shadow("0 2px 12px rgba(0,0,0,0.14)")]}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>Get started free</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ══ HERO ═════════════════════════════════ */}
        <View style={{
          paddingHorizontal: pad,
          paddingTop: isWide ? 96 : 52,
          paddingBottom: isWide ? 80 : 48,
          maxWidth: mxW, alignSelf: "center", width: "100%",
          flexDirection: isWide ? "row" : "column",
          alignItems: isWide ? "center" : "stretch",
          gap: isWide ? 72 : 48,
        }}>

          {/* Left copy */}
          <View style={{ flex: isWide ? 1 : undefined }}>
            {/* Eyebrow badge */}
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 7,
              backgroundColor: P.accentBg, paddingHorizontal: 13, paddingVertical: 6,
              borderRadius: 20, alignSelf: "flex-start", marginBottom: 26,
            }}>
              <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: P.accent }} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: P.accent, letterSpacing: 0.3 }}>
                Your all-in-one productivity book
              </Text>
            </View>

            {/* Headline */}
            <Text style={{
              fontSize: isWide ? 60 : 40,
              fontWeight: "900",
              color: P.text,
              letterSpacing: -2.5,
              lineHeight: isWide ? 68 : 48,
              marginBottom: 22,
            }}>
              {"Stop juggling\n"}
              <Text style={{ color: P.accent }}>5 apps.</Text>
              {"\nUse one."}
            </Text>

            <Text style={{
              fontSize: isWide ? 18 : 16,
              color: P.textSec,
              lineHeight: isWide ? 29 : 26,
              marginBottom: 38,
              maxWidth: 450,
            }}>
              Tasks, daily planner, focus timer, and evening reflections —
              all in one beautifully simple space. Built for students and
              professionals who want clarity without complexity.
            </Text>

            {/* CTAs */}
            <View style={{ flexDirection: "row", gap: 14, alignItems: "center", flexWrap: "wrap", marginBottom: 38 }}>
              <TouchableOpacity
                onPress={goAuth}
                style={[{
                  paddingHorizontal: 28, paddingVertical: 15, borderRadius: 28,
                  backgroundColor: P.accent, flexDirection: "row", alignItems: "center", gap: 6,
                }, shadow("0 6px 24px rgba(99,102,241,0.38)")]}
              >
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#fff" }}>Start for free</Text>
                <Ionicons name="arrow-forward" size={15} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={goAuth}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: P.textSec }}>
                  Already have an account? <Text style={{ color: P.accent }}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Social proof */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flexDirection: "row" }}>
                {["#6366f1","#818cf8","#7c3aed","#0ea5e9","#10b981"].map((c, i) => (
                  <View key={i} style={{
                    width: 28, height: 28, borderRadius: 14, backgroundColor: c,
                    marginLeft: i > 0 ? -7 : 0, borderWidth: 2, borderColor: "#fff",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Text style={{ fontSize: 10, fontWeight: "800", color: "#fff" }}>
                      {["N","A","J","S","M"][i]}
                    </Text>
                  </View>
                ))}
              </View>
              <View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <View style={{ flexDirection: "row", gap: 1 }}>
                    {[1,2,3,4,5].map(s => <Text key={s} style={{ fontSize: 11, color: P.amber }}>★</Text>)}
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: P.text }}>5.0</Text>
                </View>
                <Text style={{ fontSize: 12, color: P.textSec, marginTop: 1 }}>
                  Loved by <Text style={{ fontWeight: "700", color: P.text }}>1,000+</Text> people
                </Text>
              </View>
            </View>
          </View>

          {/* Right: Phone mockup */}
          <View style={{ alignSelf: isWide ? "auto" : "center", flexShrink: 0 }}>
            <PhoneMockup />
          </View>
        </View>

        {/* ══ MARQUEE STRIP ════════════════════════ */}
        <View style={{
          backgroundColor: P.bgAlt, paddingVertical: 22, paddingHorizontal: pad,
          borderTopWidth: 1, borderBottomWidth: 1, borderColor: P.border,
          alignItems: "center",
        }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: P.textMute, letterSpacing: 1.5, textTransform: "uppercase", textAlign: "center" }}>
            Replacing Todoist · Notion · Toggl · Day One · Apple Reminders — all at once
          </Text>
        </View>

        {/* ══ FEATURES ═════════════════════════════ */}
        <View style={{ paddingVertical: isWide ? 100 : 64, paddingHorizontal: pad, backgroundColor: P.bg }}>
          <View style={{ maxWidth: mxW, alignSelf: "center", width: "100%" }}>

            <View style={{ alignItems: "center", marginBottom: 60 }}>
              <View style={[{ backgroundColor: P.accentBg, paddingHorizontal: 13, paddingVertical: 5, borderRadius: 20, marginBottom: 16 }]}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: P.accent, letterSpacing: 1 }}>FEATURES</Text>
              </View>
              <Text style={{
                fontSize: isWide ? 44 : 32, fontWeight: "900", color: P.text,
                letterSpacing: -1.5, textAlign: "center", lineHeight: isWide ? 52 : 40,
              }}>
                {"Everything you need.\nNothing you don't."}
              </Text>
              <Text style={{ fontSize: 16, color: P.textSec, marginTop: 14, textAlign: "center", maxWidth: 420, lineHeight: 25 }}>
                Six tightly integrated features that keep every part of your life in one place.
              </Text>
            </View>

            {/* Feature grid */}
            <FeatureGrid features={FEATURES} isWide={isWide} isMid={isMid} mxW={mxW} pad={pad} width={width} />
          </View>
        </View>

        {/* ══ HOW IT WORKS ═════════════════════════ */}
        <View style={{ backgroundColor: P.bgAlt, paddingVertical: isWide ? 100 : 64, paddingHorizontal: pad }}>
          <View style={{ maxWidth: 740, alignSelf: "center", width: "100%" }}>

            <View style={{ alignItems: "center", marginBottom: 56 }}>
              <View style={{ backgroundColor: P.accentBg, paddingHorizontal: 13, paddingVertical: 5, borderRadius: 20, marginBottom: 16 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: P.accent, letterSpacing: 1 }}>HOW IT WORKS</Text>
              </View>
              <Text style={{ fontSize: isWide ? 44 : 32, fontWeight: "900", color: P.text, letterSpacing: -1.5, textAlign: "center", lineHeight: isWide ? 52 : 40 }}>
                {"Three habits.\nOne system."}
              </Text>
            </View>

            <View style={{ gap: 14 }}>
              {HOW.map((step, i) => (
                <View key={i} style={[{
                  flexDirection: "row", gap: 20, alignItems: "flex-start",
                  backgroundColor: P.bg, borderRadius: 20, padding: 26,
                  borderWidth: 1, borderColor: P.border,
                }, shadow("0 2px 12px rgba(0,0,0,0.04)")]}>
                  <View style={{
                    width: 44, height: 44, borderRadius: 14,
                    backgroundColor: P.accent, alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: "900", color: "#fff" }}>{step.n}</Text>
                  </View>
                  <View style={{ flex: 1, paddingTop: 2 }}>
                    <Text style={{ fontSize: 17, fontWeight: "800", color: P.text, marginBottom: 7 }}>{step.title}</Text>
                    <Text style={{ fontSize: 14, color: P.textSec, lineHeight: 23 }}>{step.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ══ TESTIMONIALS ═════════════════════════ */}
        <View style={{ paddingVertical: isWide ? 100 : 64, paddingHorizontal: pad, backgroundColor: P.bg }}>
          <View style={{ maxWidth: mxW, alignSelf: "center", width: "100%" }}>

            <View style={{ alignItems: "center", marginBottom: 52 }}>
              <View style={{ backgroundColor: P.accentBg, paddingHorizontal: 13, paddingVertical: 5, borderRadius: 20, marginBottom: 16 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: P.accent, letterSpacing: 1 }}>TESTIMONIALS</Text>
              </View>
              <Text style={{ fontSize: isWide ? 44 : 32, fontWeight: "900", color: P.text, letterSpacing: -1.5, textAlign: "center", lineHeight: isWide ? 52 : 40 }}>
                Real people. Real results.
              </Text>
            </View>

            <View style={{ flexDirection: isWide ? "row" : "column", gap: 18 }}>
              {TESTIMONIALS.map((t, i) => (
                <View key={i} style={[{
                  flex: isWide ? 1 : undefined,
                  borderRadius: 20, borderWidth: 1, borderColor: P.border,
                  padding: 28,
                }, shadow("0 2px 16px rgba(0,0,0,0.04)")]}>
                  {/* Stars */}
                  <View style={{ flexDirection: "row", gap: 2, marginBottom: 18 }}>
                    {[1,2,3,4,5].map(s => <Text key={s} style={{ fontSize: 14, color: P.amber }}>★</Text>)}
                  </View>
                  {/* Quote */}
                  <Text style={{ fontSize: 15, color: P.text, lineHeight: 25, fontWeight: "500", marginBottom: 22 }}>
                    "{t.quote}"
                  </Text>
                  {/* Attribution */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
                    <View style={{
                      width: 38, height: 38, borderRadius: 19,
                      backgroundColor: t.col + "22",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <Text style={{ fontSize: 15, fontWeight: "800", color: t.col }}>{t.init}</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: P.text }}>{t.name}</Text>
                      <Text style={{ fontSize: 12, color: P.textMute, marginTop: 1 }}>{t.role}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ══ CTA ══════════════════════════════════ */}
        <View style={{ backgroundColor: P.bgDark, paddingVertical: isWide ? 110 : 72, paddingHorizontal: pad }}>
          <View style={{ maxWidth: 600, alignSelf: "center", alignItems: "center" }}>

            {/* Floating icons */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 36 }}>
              {[
                { icon: "flash",          bg: "#1e1b4b" },
                { icon: "checkmark-done", bg: "#1e1b4b" },
                { icon: "timer-outline",  bg: "#1e1b4b" },
                { icon: "moon-outline",   bg: "#1e1b4b" },
              ].map((item, i) => (
                <View key={i} style={{
                  width: 48, height: 48, borderRadius: 14,
                  backgroundColor: item.bg,
                  borderWidth: 1, borderColor: "#2e2b5a",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Ionicons name={item.icon as any} size={20} color={P.accentHi} />
                </View>
              ))}
            </View>

            <Text style={{
              fontSize: isWide ? 52 : 36, fontWeight: "900", color: "#fff",
              letterSpacing: -2, textAlign: "center",
              lineHeight: isWide ? 60 : 44, marginBottom: 18,
            }}>
              {"Your most organized\nlife starts today."}
            </Text>
            <Text style={{ fontSize: 17, color: "#8b8bac", textAlign: "center", lineHeight: 27, marginBottom: 44 }}>
              Free to get started. No credit card.{"\n"}No complexity. Just clarity.
            </Text>

            <TouchableOpacity
              onPress={goAuth}
              style={[{
                paddingHorizontal: 36, paddingVertical: 18, borderRadius: 30,
                backgroundColor: P.accent,
                flexDirection: "row", alignItems: "center", gap: 8,
              }, shadow("0 8px 40px rgba(99,102,241,0.5)")]}
            >
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#fff" }}>Get EverythingBook free</Text>
              <Ionicons name="arrow-forward" size={17} color="#fff" />
            </TouchableOpacity>

            <Text style={{ fontSize: 13, color: "#4b4b6a", marginTop: 20 }}>
              Already a member?{" "}
              <Text onPress={goAuth} style={{ color: P.accentHi, fontWeight: "700" }}>Sign in here →</Text>
            </Text>
          </View>
        </View>

        {/* ══ FOOTER ═══════════════════════════════ */}
        <View style={{
          backgroundColor: P.bgDark,
          borderTopWidth: 1, borderTopColor: "#16162a",
          paddingVertical: 30, paddingHorizontal: pad,
        }}>
          <View style={{
            maxWidth: mxW, alignSelf: "center", width: "100%",
            flexDirection: isWide ? "row" : "column",
            alignItems: isWide ? "center" : "flex-start",
            gap: 16,
          }}>
            {/* Brand */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
              <View style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: P.accent, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 13 }}>📖</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#fff" }}>EverythingBook</Text>
            </View>
            {/* Links */}
            {isWide && (
              <View style={{ flexDirection: "row", gap: 28 }}>
                {["Features", "How it works", "Sign in", "Get started"].map(l => (
                  <TouchableOpacity key={l} onPress={goAuth}>
                    <Text style={{ fontSize: 13, color: "#4b4b6a", fontWeight: "500" }}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Text style={{ fontSize: 12, color: "#2e2e48" }}>© 2026 EverythingBook</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Feature grid (extracted to avoid inline calc) ───
function FeatureGrid({ features, isWide, isMid, mxW, pad, width }: {
  features: typeof FEATURES; isWide: boolean; isMid: boolean; mxW: number; pad: number; width: number;
}) {
  const cols = isWide ? 3 : isMid ? 2 : 1;
  const gapPx = 16;
  const totalGap = (cols - 1) * gapPx;
  const avail = Math.min(width, mxW) - pad * 2;
  const cardW = cols > 1 ? (avail - totalGap) / cols : ("100%" as any);

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: gapPx }}>
      {features.map((f, i) => (
        <View key={i} style={[{
          width: cardW, borderRadius: 20, padding: 26,
          borderWidth: 1, borderColor: P.border,
          backgroundColor: P.bg,
        }, shadow("0 2px 12px rgba(0,0,0,0.04)")]}>
          <View style={{
            width: 46, height: 46, borderRadius: 14,
            backgroundColor: f.bg, alignItems: "center", justifyContent: "center", marginBottom: 16,
          }}>
            <Ionicons name={f.icon as any} size={22} color={f.col} />
          </View>
          <Text style={{ fontSize: 16, fontWeight: "800", color: P.text, marginBottom: 8 }}>{f.title}</Text>
          <Text style={{ fontSize: 14, color: P.textSec, lineHeight: 22 }}>{f.body}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Phone mockup ─────────────────────────────
function PhoneMockup() {
  const TASKS = [
    { title: "Review lecture notes",  cat: "School", strip: "#7c3aed", catBg: "#f5f3ff", catCol: "#7c3aed" },
    { title: "Team standup @ 10am",   cat: "Work",   strip: "#0ea5e9", catBg: "#e0f9ff", catCol: "#0284c7" },
    { title: "Evening run — 5 km",    cat: "Health", strip: "#e11d48", catBg: "#fff1f2", catCol: "#e11d48" },
  ];

  return (
    <View style={[{
      width: 260, height: 510,
      backgroundColor: "#faf8f5",
      borderRadius: 44,
      overflow: "hidden",
      borderWidth: 9,
      borderColor: "#14141e",
    }, shadow("0 32px 80px rgba(99,102,241,0.22), 0 8px 24px rgba(0,0,0,0.18)")]}>

      {/* Dynamic island / notch */}
      <View style={{ height: 26, backgroundColor: "#14141e", alignItems: "center", justifyContent: "flex-end", paddingBottom: 4 }}>
        <View style={{ width: 90, height: 10, borderRadius: 5, backgroundColor: "#000" }} />
      </View>

      {/* Status bar */}
      <View style={{ height: 28, backgroundColor: "#faf8f5", flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#0d0d14", flex: 1 }}>9:41</Text>
        <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
          {[3, 5, 7, 9].map((h, i) => (
            <View key={i} style={{ width: 3, height: h, backgroundColor: "#0d0d14", borderRadius: 1 }} />
          ))}
          <View style={{ width: 14, height: 7, borderRadius: 2, borderWidth: 1.2, borderColor: "#0d0d14", marginLeft: 4, overflow: "hidden" }}>
            <View style={{ width: "75%", height: "100%", backgroundColor: "#10b981" }} />
          </View>
        </View>
      </View>

      {/* App nav bar */}
      <View style={{ height: 42, backgroundColor: "#faf8f5", flexDirection: "row", alignItems: "center", paddingHorizontal: 14 }}>
        <Text style={{ flex: 1, fontSize: 11, fontWeight: "700", color: "#0d0d14" }}>☀️ Good morning, Neil</Text>
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: "#eef2ff", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 9, fontWeight: "800", color: "#6366f1" }}>N</Text>
        </View>
      </View>

      {/* Separator */}
      <View style={{ height: 1, backgroundColor: "#e8e8f0" }} />

      {/* Date + stats row */}
      <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6 }}>
        <Text style={{ fontSize: 10, color: "#9898b0", marginBottom: 7 }}>Wednesday, May 28</Text>
        <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
          <View style={{ backgroundColor: "#eef2ff", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 }}>
            <Text style={{ fontSize: 8.5, fontWeight: "700", color: "#6366f1" }}>✓ 3 tasks today</Text>
          </View>
          <View style={{ backgroundColor: "#fff1f2", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 }}>
            <Text style={{ fontSize: 8.5, fontWeight: "700", color: "#e11d48" }}>⚠ 1 overdue</Text>
          </View>
        </View>
      </View>

      {/* Section label */}
      <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 5 }}>
        <Text style={{ fontSize: 7.5, fontWeight: "800", color: "#9898b0", textTransform: "uppercase", letterSpacing: 0.8 }}>Today</Text>
      </View>

      {/* Task cards */}
      <View style={{ paddingHorizontal: 10, gap: 5 }}>
        {TASKS.map((t, i) => (
          <View key={i} style={[{
            backgroundColor: "#fff", borderRadius: 11, flexDirection: "row", overflow: "hidden",
          }, shadow("0 1px 4px rgba(0,0,0,0.07)")]}>
            <View style={{ width: 3, backgroundColor: t.strip }} />
            <View style={{ flex: 1, paddingHorizontal: 9, paddingVertical: 7 }}>
              <Text style={{ fontSize: 10, fontWeight: "600", color: "#0d0d14", marginBottom: 3 }} numberOfLines={1}>{t.title}</Text>
              <View style={{ backgroundColor: t.catBg, paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 6, alignSelf: "flex-start" }}>
                <Text style={{ fontSize: 8, fontWeight: "700", color: t.catCol }}>{t.cat}</Text>
              </View>
            </View>
            <View style={{ justifyContent: "center", paddingRight: 9 }}>
              <Text style={{ fontSize: 14, color: "#d0d0e0", lineHeight: 16 }}>›</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Coming up */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, marginTop: 10 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: "#e8e8f0" }} />
        <Text style={{ fontSize: 7, fontWeight: "700", color: "#9898b0", textTransform: "uppercase", letterSpacing: 0.5 }}>Coming up</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: "#e8e8f0" }} />
      </View>

      {/* Tomorrow card */}
      <View style={{ paddingHorizontal: 10, marginTop: 6 }}>
        <View style={[{ backgroundColor: "#fff", borderRadius: 11, overflow: "hidden" }, shadow("0 1px 4px rgba(0,0,0,0.06)")]}>
          <View style={{ width: 3, height: "100%", backgroundColor: "#f59e0b", position: "absolute", left: 0, top: 0 }} />
          <View style={{ paddingHorizontal: 11, paddingVertical: 8 }}>
            <View style={{ backgroundColor: "#fffbeb", paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 6, alignSelf: "flex-start", marginBottom: 3 }}>
              <Text style={{ fontSize: 7.5, fontWeight: "700", color: "#d97706" }}>🌅 Tomorrow</Text>
            </View>
            <Text style={{ fontSize: 10, fontWeight: "600", color: "#0d0d14" }}>Submit assignment draft</Text>
          </View>
        </View>
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Capture bar */}
      <View style={{
        backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#e8e8f0",
        paddingHorizontal: 10, paddingVertical: 8,
        flexDirection: "row", alignItems: "center", gap: 7,
      }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#6366f1", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 18, color: "#fff", lineHeight: 22, marginTop: -1 }}>+</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: "#f4f4fa", borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ fontSize: 9, color: "#9898b0" }}>Capture anything quickly...</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={{ height: 44, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f0f0f5", flexDirection: "row", alignItems: "center" }}>
        {[
          { icon: "sunny",            label: "Today",   active: true  },
          { icon: "checkmark-circle", label: "Tasks",   active: false },
          { icon: "calendar",         label: "Planner", active: false },
          { icon: "folder",           label: "Archive", active: false },
        ].map((tab, i) => (
          <View key={i} style={{ flex: 1, alignItems: "center", gap: 2 }}>
            <View style={{
              width: 36, height: 20, borderRadius: 10,
              backgroundColor: tab.active ? "#eef2ff" : "transparent",
              alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name={tab.icon as any} size={14} color={tab.active ? "#6366f1" : "#9898b0"} />
            </View>
            <Text style={{ fontSize: 7, fontWeight: tab.active ? "700" : "500", color: tab.active ? "#6366f1" : "#9898b0" }}>
              {tab.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
