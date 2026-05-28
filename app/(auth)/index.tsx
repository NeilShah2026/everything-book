import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, ScrollView, Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";

type Mode = "signin" | "signup";

const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16 },
  android: { elevation: 4 },
  default: { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
});

export default function AuthScreen() {
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
    if (!trimEmail || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimEmail, password,
        });
        if (error) throw error;
        // AuthContext onAuthStateChange will handle the redirect automatically
      } else {
        const { error } = await supabase.auth.signUp({
          email: trimEmail, password,
        });
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#faf8f5" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero ── */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 22,
              backgroundColor: "#ede9fe",
              alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 36 }}>📖</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: "800", color: "#1c1917", letterSpacing: -0.5 }}>
              EverythingBook
            </Text>
            <Text style={{ fontSize: 15, color: "#a8a29e", marginTop: 6, textAlign: "center" }}>
              Your friction-free all-in-one tracker
            </Text>
          </View>

          {/* ── Mode toggle ── */}
          <View style={{
            flexDirection: "row", backgroundColor: "#f0ede8",
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
                    default: {},
                  }),
                }}
              >
                <Text style={{
                  fontSize: 14, fontWeight: mode === m ? "700" : "500",
                  color: mode === m ? "#1c1917" : "#a8a29e",
                }}>
                  {m === "signin" ? "Sign In" : "Create Account"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Form card ── */}
          <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 20, gap: 14, ...SHADOW }}>

            {/* Email */}
            <View>
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#a8a29e", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
                Email
              </Text>
              <View style={{
                flexDirection: "row", alignItems: "center",
                backgroundColor: "#f8f7f5", borderRadius: 14,
                paddingHorizontal: 14, paddingVertical: 12, gap: 10,
              }}>
                <Ionicons name="mail-outline" size={18} color="#a8a29e" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#d1d5db"
                  style={{ flex: 1, fontSize: 15, color: "#1c1917" }}
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
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#a8a29e", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
                Password
              </Text>
              <View style={{
                flexDirection: "row", alignItems: "center",
                backgroundColor: "#f8f7f5", borderRadius: 14,
                paddingHorizontal: 14, paddingVertical: 12, gap: 10,
              }}>
                <Ionicons name="lock-closed-outline" size={18} color="#a8a29e" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#d1d5db"
                  style={{ flex: 1, fontSize: 15, color: "#1c1917" }}
                  secureTextEntry={!showPassword}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  returnKeyType={mode === "signin" ? "done" : "next"}
                  onSubmitEditing={mode === "signin" ? handleSubmit : undefined}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#a8a29e" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm password (sign up only) */}
            {mode === "signup" && (
              <View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#a8a29e", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
                  Confirm Password
                </Text>
                <View style={{
                  flexDirection: "row", alignItems: "center",
                  backgroundColor: "#f8f7f5", borderRadius: 14,
                  paddingHorizontal: 14, paddingVertical: 12, gap: 10,
                }}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#a8a29e" />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repeat your password"
                    placeholderTextColor="#d1d5db"
                    style={{ flex: 1, fontSize: 15, color: "#1c1917" }}
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
              <View style={{
                flexDirection: "row", alignItems: "flex-start", gap: 8,
                backgroundColor: "#fef2f2", borderRadius: 12, padding: 12,
              }}>
                <Ionicons name="alert-circle-outline" size={16} color="#ef4444" style={{ marginTop: 1 }} />
                <Text style={{ flex: 1, fontSize: 13, color: "#dc2626", lineHeight: 18 }}>{error}</Text>
              </View>
            )}

            {/* Success */}
            {successMsg && (
              <View style={{
                flexDirection: "row", alignItems: "flex-start", gap: 8,
                backgroundColor: "#f0fdf4", borderRadius: 12, padding: 12,
              }}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#16a34a" style={{ marginTop: 1 }} />
                <Text style={{ flex: 1, fontSize: 13, color: "#15803d", lineHeight: 18 }}>{successMsg}</Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit || loading}
              style={{
                backgroundColor: canSubmit && !loading ? "#6366f1" : "#e7e5e4",
                paddingVertical: 16, borderRadius: 16, alignItems: "center",
                flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 4,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: canSubmit ? "#fff" : "#a8a29e" }}>
                    {mode === "signin" ? "Sign In" : "Create Account"}
                  </Text>
                  {canSubmit && <Ionicons name="arrow-forward" size={18} color="#fff" />}
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Footer note ── */}
          <Text style={{ textAlign: "center", fontSize: 12, color: "#d1d5db", marginTop: 24, lineHeight: 18 }}>
            Your data is private and synced securely via Supabase.{"\n"}
            No spam, ever.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
