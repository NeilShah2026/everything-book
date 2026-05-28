import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useTheme, ThemeMode } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";

const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10 },
  android: { elevation: 3 },
  default: {},
});

export default function SettingsScreen() {
  const router       = useRouter();
  const { session, signOut } = useAuth();
  const { colors, mode, setMode } = useTheme();

  const email       = session?.user?.email ?? "";
  const initials    = email.slice(0, 2).toUpperCase();
  const savedName   = (session?.user?.user_metadata?.full_name as string) ?? "";

  const [displayName,  setDisplayName]  = useState(savedName);
  const [savingName,   setSavingName]   = useState(false);
  const [nameSuccess,  setNameSuccess]  = useState(false);
  const [nameError,    setNameError]    = useState<string | null>(null);

  // Keep local state in sync if session refreshes
  useEffect(() => { setDisplayName(savedName); }, [savedName]);

  async function handleSaveName() {
    if (!displayName.trim()) return;
    setSavingName(true);
    setNameError(null);
    setNameSuccess(false);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName.trim() },
      });
      if (error) throw error;
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 2500);
    } catch (e: any) {
      setNameError(e.message ?? "Failed to save.");
    } finally {
      setSavingName(false);
    }
  }

  const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
    { value: "light",  label: "Light",  icon: "☀️" },
    { value: "dark",   label: "Dark",   icon: "🌙" },
    { value: "system", label: "System", icon: "⚙️" },
  ];

  const s = {
    bg:   colors.bg,
    card: colors.card,
    text: colors.text,
    sec:  colors.textSec,
    mut:  colors.textMuted,
    brd:  colors.border,
    brdS: colors.borderStrong,
    acc:  colors.accent,
    aBg:  colors.accentBg,
    aTxt: colors.accentText,
    inp:  colors.inputBg,
    hdr:  colors.headerBg,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: s.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        {/* ── Header ── */}
        <View style={{
          backgroundColor: s.hdr, paddingHorizontal: 20,
          paddingTop: 16, paddingBottom: 14,
          borderBottomWidth: 1, borderBottomColor: s.brd,
          flexDirection: "row", alignItems: "center", gap: 12,
          ...SHADOW,
        }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={24} color={s.acc} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "800", color: s.text, flex: 1, letterSpacing: -0.3 }}>
            Settings
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Profile ── */}
          <SectionLabel label="Profile" icon="person-outline" colors={colors} />
          <View style={{ backgroundColor: s.card, borderRadius: 20, overflow: "hidden", ...SHADOW }}>
            {/* Avatar + email row */}
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 14,
              paddingHorizontal: 16, paddingVertical: 16,
              borderBottomWidth: 1, borderBottomColor: s.brd,
            }}>
              <View style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: s.aBg, alignItems: "center", justifyContent: "center",
              }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: s.acc }}>
                  {displayName ? displayName.charAt(0).toUpperCase() : initials}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: s.text }}>
                  {displayName || "No name set"}
                </Text>
                <Text style={{ fontSize: 12, color: s.mut, marginTop: 2 }}>{email}</Text>
              </View>
            </View>

            {/* Display name input */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: s.mut, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
                Display Name
              </Text>
              <View style={{
                flexDirection: "row", alignItems: "center",
                backgroundColor: s.inp, borderRadius: 14,
                paddingHorizontal: 12, paddingVertical: 10, gap: 8,
              }}>
                <TextInput
                  value={displayName}
                  onChangeText={(v) => { setDisplayName(v); setNameError(null); setNameSuccess(false); }}
                  placeholder="Your name"
                  placeholderTextColor={colors.textPlaceholder}
                  style={{ flex: 1, fontSize: 15, color: s.text }}
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
                />
                <TouchableOpacity
                  onPress={handleSaveName}
                  disabled={savingName || !displayName.trim() || displayName.trim() === savedName}
                  style={{
                    backgroundColor: (displayName.trim() && displayName.trim() !== savedName) ? s.acc : s.inp,
                    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
                  }}
                >
                  {savingName ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={{
                      fontSize: 13, fontWeight: "700",
                      color: (displayName.trim() && displayName.trim() !== savedName) ? "#fff" : s.mut,
                    }}>
                      {nameSuccess ? "✓ Saved" : "Save"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              {nameError && (
                <Text style={{ fontSize: 12, color: "#ef4444", marginTop: 6 }}>{nameError}</Text>
              )}
            </View>
          </View>

          {/* ── Appearance ── */}
          <SectionLabel label="Appearance" icon="color-palette-outline" colors={colors} />
          <View style={{ backgroundColor: s.card, borderRadius: 20, padding: 16, ...SHADOW }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: s.mut, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12 }}>
              Theme
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {THEME_OPTIONS.map((opt) => {
                const active = mode === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setMode(opt.value)}
                    activeOpacity={0.7}
                    style={{
                      flex: 1, alignItems: "center", paddingVertical: 14,
                      borderRadius: 16,
                      backgroundColor: active ? s.aBg : s.inp,
                      borderWidth: active ? 2 : 0,
                      borderColor: s.acc,
                    }}
                  >
                    <Text style={{ fontSize: 22, marginBottom: 6 }}>{opt.icon}</Text>
                    <Text style={{ fontSize: 13, fontWeight: active ? "700" : "500", color: active ? s.aTxt : s.sec }}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Account ── */}
          <SectionLabel label="Account" icon="shield-outline" colors={colors} />
          <View style={{ backgroundColor: s.card, borderRadius: 20, overflow: "hidden", ...SHADOW }}>
            <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: s.brd }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: s.mut, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>
                Email
              </Text>
              <Text style={{ fontSize: 15, color: s.text }}>{email}</Text>
            </View>
            <TouchableOpacity
              onPress={signOut}
              activeOpacity={0.7}
              style={{
                flexDirection: "row", alignItems: "center", gap: 12,
                paddingHorizontal: 16, paddingVertical: 14,
              }}
            >
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#fef2f2", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="log-out-outline" size={18} color="#ef4444" />
              </View>
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#ef4444" }}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* ── Version ── */}
          <Text style={{ textAlign: "center", fontSize: 12, color: s.mut, marginTop: 8 }}>
            EverythingBook v1.0 · Made with ☕
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SectionLabel({ label, icon, colors }: { label: string; icon: keyof typeof Ionicons.glyphMap; colors: any }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4 }}>
      <Ionicons name={icon} size={13} color={colors.textMuted} />
      <Text style={{ fontSize: 11, fontWeight: "800", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>
        {label}
      </Text>
    </View>
  );
}
