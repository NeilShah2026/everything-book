import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, ScrollView, Platform,
  ActivityIndicator, useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";

type Mode = "signin" | "signup";

// ─── Typography helpers ───────────────────────────────────────────────────────
const FF = {
  display: Platform.select({ web: "'Fraunces', Georgia, serif",    default: undefined }),
  body:    Platform.select({ web: "'Syne', system-ui, sans-serif", default: undefined }),
};

// ─── Web helpers ──────────────────────────────────────────────────────────────
const sh = (v: string) => Platform.select({ default: { boxShadow: v } as any }) ?? {};
const bg = (v: string) => Platform.select({ default: { background: v } as any }) ?? {};

// ─────────────────────────────────────────────────────────────────────────────
export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ fromLanding?: string }>();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 900;

  // On web: if no fromLanding flag → the user typed "/" directly, send to landing
  useEffect(() => {
    if (Platform.OS === "web" && !params.fromLanding) {
      router.replace("/landing" as any);
    }
  }, []);

  if (Platform.OS === "web" && !params.fromLanding) return null;

  return isDesktop ? (
    <DesktopLayout />
  ) : (
    <MobileLayout />
  );
}

// ─── Desktop layout ───────────────────────────────────────────────────────────
function DesktopLayout() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      {/* ── Left branding panel ── */}
      <View style={[{
        width: 420, flexShrink: 0,
        paddingHorizontal: 48, paddingVertical: 52,
        flexDirection: "column", justifyContent: "space-between",
        overflow: "hidden",
      }, bg("linear-gradient(160deg, #0d0b18 0%, #0a091a 50%, #07060e 100%)") as any]}>

        {/* Radial glow behind content */}
        <View style={[{
          position: "absolute", width: 400, height: 400,
          top: -100, left: -100,
        }, Platform.select({ default: {
          background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        } as any }) ?? {}]} />

        {/* Top: Logo + back link */}
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 64 }}>
            <View style={[{
              width: 34, height: 34, borderRadius: 10,
              backgroundColor: "#0f0e2a",
              borderWidth: 1, borderColor: "#252340",
              alignItems: "center", justifyContent: "center",
            }, sh("0 0 14px rgba(99,102,241,0.3)")]}>
              <Text style={{ fontSize: 17 }}>📖</Text>
            </View>
            <Text style={{ fontFamily: FF.display, fontSize: 17, fontWeight: "800", color: "#f2ede6" }}>
              EverythingBook
            </Text>
          </View>

          {/* Headline */}
          <Text style={{
            fontFamily: FF.display,
            fontSize: 38, fontWeight: "900", color: "#f2ede6",
            letterSpacing: -1.5, lineHeight: 46, marginBottom: 16,
          }}>
            {"Every thought.\nEvery task.\nOne place."}
          </Text>
          <Text style={{
            fontFamily: FF.body,
            fontSize: 15, color: "#7a748f", lineHeight: 25, marginBottom: 48,
          }}>
            Stop switching between apps. EverythingBook brings your tasks,
            planner, timer, and reflections into one calm space.
          </Text>

          {/* Feature list */}
          <View style={{ gap: 18 }}>
            {[
              { icon: "flash",          col: "#818cf8", title: "Smart Planner",   desc: "Auto-sorts by due date" },
              { icon: "timer-outline",  col: "#f87171", title: "Focus Timer",     desc: "Built-in Pomodoro sessions" },
              { icon: "moon-outline",   col: "#a78bfa", title: "Daily Reflection",desc: "2-minute evening ritual" },
            ].map((f, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View style={[{
                  width: 38, height: 38, borderRadius: 11,
                  backgroundColor: "#0f0e2a",
                  borderWidth: 1, borderColor: "#252340",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }]}>
                  <Ionicons name={f.icon as any} size={18} color={f.col} />
                </View>
                <View>
                  <Text style={{ fontFamily: FF.body, fontSize: 14, fontWeight: "700", color: "#f2ede6" }}>{f.title}</Text>
                  <Text style={{ fontFamily: FF.body, fontSize: 12, color: "#7a748f", marginTop: 1 }}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom: back link */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/landing" as any })}
          style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 32 }}
        >
          <Ionicons name="arrow-back" size={14} color="#3a3555" />
          <Text style={{ fontFamily: FF.body, fontSize: 12, color: "#3a3555", fontWeight: "600" }}>
            Back to website
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Right form panel ── */}
      <View style={{ flex: 1, backgroundColor: "#faf8f5", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <FormCard isDesktop />
      </View>
    </View>
  );
}

// ─── Mobile layout ────────────────────────────────────────────────────────────
function MobileLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#faf8f5" }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: 36 }}>
            <View style={[{
              width: 68, height: 68, borderRadius: 20,
              backgroundColor: "#ede9fe",
              alignItems: "center", justifyContent: "center", marginBottom: 14,
            }, Platform.select({ ios: { shadowColor: "#6366f1", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 }, default: {} })]}>
              <Text style={{ fontSize: 34 }}>📖</Text>
            </View>
            <Text style={{ fontFamily: FF.display, fontSize: 26, fontWeight: "800", color: "#1c1917", letterSpacing: -0.5 }}>
              EverythingBook
            </Text>
            <Text style={{ fontFamily: FF.body, fontSize: 14, color: "#a8a29e", marginTop: 5, textAlign: "center" }}>
              Your friction-free all-in-one tracker
            </Text>
          </View>

          <FormCard isDesktop={false} />

          <Text style={{ textAlign: "center", fontFamily: FF.body, fontSize: 11, color: "#d1d5db", marginTop: 24, lineHeight: 18 }}>
            Your data is private and synced securely.{"\n"}No spam, ever.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Shared form card ─────────────────────────────────────────────────────────
function FormCard({ isDesktop }: { isDesktop: boolean }) {
  const [mode,            setMode]            = useState<Mode>("signin");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [successMsg,      setSuccessMsg]       = useState<string | null>(null);

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setSuccessMsg(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit() {
    setError(null);
    setSuccessMsg(null);
    const trimEmail = email.trim().toLowerCase();
    if (!trimEmail || !password) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && password !== confirmPassword) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: trimEmail, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email: trimEmail, password });
        if (error) throw error;
        setSuccessMsg("Account created! Check your email to confirm, then sign in.");
        switchMode("signin");
      }
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = email.trim().length > 0 && password.length >= 1 &&
    (mode === "signin" || confirmPassword.length >= 1);

  const cardStyle = isDesktop ? {
    width: "100%", maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 24, padding: 40,
    borderWidth: 1, borderColor: "#f0ede8",
    ...sh("0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)"),
  } : {
    backgroundColor: "#ffffff",
    borderRadius: 24, padding: 22,
    borderWidth: 1, borderColor: "#f0ede8",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16 },
      default: {},
    }),
  };

  return (
    <View style={cardStyle as any}>

      {/* Title (desktop only) */}
      {isDesktop && (
        <View style={{ marginBottom: 28 }}>
          <Text style={{
            fontFamily: FF.display, fontSize: 28, fontWeight: "800",
            color: "#1c1917", letterSpacing: -0.8, marginBottom: 6,
          }}>
            {mode === "signin" ? "Welcome back." : "Create your account."}
          </Text>
          <Text style={{ fontFamily: FF.body, fontSize: 14, color: "#a8a29e" }}>
            {mode === "signin"
              ? "Sign in to continue to EverythingBook."
              : "Start organizing your life today — it's free."}
          </Text>
        </View>
      )}

      {/* Mode toggle */}
      <View style={{
        flexDirection: "row", backgroundColor: "#f5f0ea",
        borderRadius: 16, padding: 4, marginBottom: 24,
      }}>
        {(["signin", "signup"] as Mode[]).map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => switchMode(m)}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center",
              backgroundColor: mode === m ? "#fff" : "transparent",
              ...Platform.select({
                ios: mode === m ? { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 } : {},
                default: mode === m ? { boxShadow: "0 1px 4px rgba(0,0,0,0.08)" } : {},
              } as any),
            }}
          >
            <Text style={{
              fontFamily: FF.body,
              fontSize: 13, fontWeight: mode === m ? "700" : "500",
              color: mode === m ? "#1c1917" : "#a8a29e",
            }}>
              {m === "signin" ? "Sign In" : "Create Account"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fields */}
      <View style={{ gap: 16 }}>
        {/* Email */}
        <View>
          <Text style={{ fontFamily: FF.body, fontSize: 11, fontWeight: "700", color: "#a8a29e", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 8 }}>
            Email
          </Text>
          <View style={{
            flexDirection: "row", alignItems: "center",
            backgroundColor: "#faf8f5", borderRadius: 14,
            paddingHorizontal: 14, paddingVertical: isDesktop ? 14 : 12,
            gap: 10, borderWidth: 1, borderColor: "#f0ede8",
          }}>
            <Ionicons name="mail-outline" size={17} color="#c4b9ae" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#d1c8c0"
              style={{ flex: 1, fontSize: 15, color: "#1c1917", fontFamily: FF.body as any }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Password */}
        <View>
          <Text style={{ fontFamily: FF.body, fontSize: 11, fontWeight: "700", color: "#a8a29e", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 8 }}>
            Password
          </Text>
          <View style={{
            flexDirection: "row", alignItems: "center",
            backgroundColor: "#faf8f5", borderRadius: 14,
            paddingHorizontal: 14, paddingVertical: isDesktop ? 14 : 12,
            gap: 10, borderWidth: 1, borderColor: "#f0ede8",
          }}>
            <Ionicons name="lock-closed-outline" size={17} color="#c4b9ae" />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 6 characters"
              placeholderTextColor="#d1c8c0"
              style={{ flex: 1, fontSize: 15, color: "#1c1917", fontFamily: FF.body as any }}
              secureTextEntry={!showPassword}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              returnKeyType={mode === "signin" ? "done" : "next"}
              onSubmitEditing={mode === "signin" ? handleSubmit : undefined}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={17} color="#c4b9ae" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm password */}
        {mode === "signup" && (
          <View>
            <Text style={{ fontFamily: FF.body, fontSize: 11, fontWeight: "700", color: "#a8a29e", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 8 }}>
              Confirm Password
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "#faf8f5", borderRadius: 14,
              paddingHorizontal: 14, paddingVertical: isDesktop ? 14 : 12,
              gap: 10, borderWidth: 1, borderColor: "#f0ede8",
            }}>
              <Ionicons name="shield-checkmark-outline" size={17} color="#c4b9ae" />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat your password"
                placeholderTextColor="#d1c8c0"
                style={{ flex: 1, fontSize: 15, color: "#1c1917", fontFamily: FF.body as any }}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#fef2f2", borderRadius: 12, padding: 12 }}>
            <Ionicons name="alert-circle-outline" size={15} color="#ef4444" style={{ marginTop: 1 }} />
            <Text style={{ flex: 1, fontFamily: FF.body, fontSize: 13, color: "#dc2626", lineHeight: 18 }}>{error}</Text>
          </View>
        )}

        {/* Success */}
        {successMsg && (
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#f0fdf4", borderRadius: 12, padding: 12 }}>
            <Ionicons name="checkmark-circle-outline" size={15} color="#16a34a" style={{ marginTop: 1 }} />
            <Text style={{ flex: 1, fontFamily: FF.body, fontSize: 13, color: "#15803d", lineHeight: 18 }}>{successMsg}</Text>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || loading}
          style={[{
            backgroundColor: canSubmit && !loading ? "#6366f1" : "#e7e5e4",
            paddingVertical: isDesktop ? 16 : 15,
            borderRadius: 16, alignItems: "center",
            flexDirection: "row", justifyContent: "center", gap: 8,
            marginTop: 4,
          }, canSubmit && !loading ? sh("0 4px 20px rgba(99,102,241,0.3)") : {}]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={{ fontFamily: FF.body, fontSize: 15, fontWeight: "800", color: canSubmit ? "#fff" : "#a8a29e" }}>
                {mode === "signin" ? "Sign In" : "Create Account"}
              </Text>
              {canSubmit && <Ionicons name="arrow-forward" size={17} color="#fff" />}
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
