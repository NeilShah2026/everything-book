import React, { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, TextInput, Modal,
  ScrollView, Platform, FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import { DailySheet, Task } from "../../types";
import { getAllSheets, getAllTasks } from "../../lib/storage";
import { formatDisplayDate, todayISO } from "../../lib/utils";
import { useTheme } from "../../context/ThemeContext";

// ── Design tokens ──────────────────────────────
const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10 },
  android: { elevation: 3 },
  default: {},
});

const CAT_BG: Record<string, string> = {
  School: "bg-violet-100", Work: "bg-sky-100",
  Home: "bg-emerald-100",  Health: "bg-rose-100",
};
const CAT_TEXT: Record<string, string> = {
  School: "text-violet-700", Work: "text-sky-700",
  Home: "text-emerald-700",  Health: "text-rose-700",
};

// ── Archive Entry type ─────────────────────────
type ArchiveEntry = {
  date: string;
  sheet: DailySheet | null;
  completedTasks: Task[];
  isToday: boolean;
};

// ─────────────────────────────────────────────
export default function ArchiveScreen() {
  const { colors: C } = useTheme();
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ArchiveEntry | null>(null);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    const [allSheets, allTasks] = await Promise.all([getAllSheets(), getAllTasks()]);
    const today = todayISO();

    const completedByDate = new Map<string, Task[]>();
    for (const task of allTasks) {
      if (task.status === "Done" && task.completedAt) {
        const date = task.completedAt.slice(0, 10);
        if (!completedByDate.has(date)) completedByDate.set(date, []);
        completedByDate.get(date)!.push(task);
      }
    }

    const dateSet = new Set<string>();
    for (const sheet of allSheets) dateSet.add(sheet.date);
    for (const date of completedByDate.keys()) dateSet.add(date);

    const built: ArchiveEntry[] = Array.from(dateSet).map((date) => ({
      date,
      sheet: allSheets.find((s) => s.date === date) ?? null,
      completedTasks: completedByDate.get(date) ?? [],
      isToday: date === today,
    }));

    built.sort((a, b) => b.date.localeCompare(a.date));
    setEntries(built);
  }

  function hasContent(entry: ArchiveEntry): boolean {
    if (entry.completedTasks.length > 0) return true;
    if (!entry.sheet) return false;
    return (
      entry.sheet.quickNotes.length > 0 ||
      entry.sheet.randomThoughts.length > 0 ||
      entry.sheet.reflection.length > 0
    );
  }

  const displayed = entries.filter((entry) => {
    if (!hasContent(entry) && !entry.isToday) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    if (formatDisplayDate(entry.date).toLowerCase().includes(q)) return true;
    if (entry.completedTasks.some((t) => t.title.toLowerCase().includes(q))) return true;
    if (entry.sheet?.quickNotes.some((n) => n.text.toLowerCase().includes(q))) return true;
    if (entry.sheet?.randomThoughts.some((t) => t.text.toLowerCase().includes(q))) return true;
    if (entry.sheet?.reflection.toLowerCase().includes(q)) return true;
    return false;
  });

  function renderItem({ item: entry }: { item: ArchiveEntry }) {
    const preview = entry.completedTasks[0]?.title
      ?? entry.sheet?.quickNotes[0]?.text
      ?? entry.sheet?.randomThoughts[0]?.text
      ?? null;

    return (
      <TouchableOpacity
        onPress={() => setSelected(entry)}
        activeOpacity={0.75}
        style={{ backgroundColor: C.card, borderRadius: 20, marginHorizontal: 16, marginBottom: 10, overflow: "hidden", ...SHADOW }}
      >
        <View style={{ flexDirection: "row" }}>
          {/* Left accent stripe */}
          <View style={{ width: 4, backgroundColor: entry.isToday ? "#f59e0b" : C.accent }} />
          <View style={{ flex: 1, padding: 14 }}>
            {/* Date row */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  {entry.isToday && (
                    <View style={{ backgroundColor: "#fffbeb", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                      <Text style={{ fontSize: 10, fontWeight: "800", color: "#d97706" }}>TODAY</Text>
                    </View>
                  )}
                  <Text style={{ fontSize: 15, fontWeight: "700", color: C.text }}>
                    {formatDisplayDate(entry.date)}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.border} />
            </View>

            {/* Stats */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: preview ? 8 : 0 }}>
              {entry.completedTasks.length > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#f0fdf4", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Ionicons name="checkmark-circle" size={12} color="#22c55e" />
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#16a34a" }}>
                    {entry.completedTasks.length} completed
                  </Text>
                </View>
              )}
              {entry.sheet?.quickNotes && entry.sheet.quickNotes.length > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Ionicons name="document-text-outline" size={12} color={C.textMuted} />
                  <Text style={{ fontSize: 12, fontWeight: "600", color: C.textSec }}>
                    {entry.sheet.quickNotes.length} note{entry.sheet.quickNotes.length !== 1 ? "s" : ""}
                  </Text>
                </View>
              )}
              {entry.sheet?.randomThoughts && entry.sheet.randomThoughts.length > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ fontSize: 11 }}>💭</Text>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: C.textSec }}>
                    {entry.sheet.randomThoughts.length}
                  </Text>
                </View>
              )}
              {entry.sheet?.reflection ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#faf5ff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Ionicons name="moon-outline" size={12} color="#a78bfa" />
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#7c3aed" }}>Reflection</Text>
                </View>
              ) : null}
              {!hasContent(entry) && (
                <Text style={{ fontSize: 12, color: C.border, fontStyle: "italic" }}>Empty day</Text>
              )}
            </View>

            {/* Preview text */}
            {preview && (
              <Text style={{ fontSize: 12, color: C.textMuted, lineHeight: 17 }} numberOfLines={1}>
                "{preview}"
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      {/* ── Header ── */}
      <View style={{ backgroundColor: C.headerBg, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, ...SHADOW }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: C.text, letterSpacing: -0.5, marginBottom: 14 }}>
          Archive
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.inputBg, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
          <Ionicons name="search-outline" size={16} color={C.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search past notes, tasks..."
            placeholderTextColor={C.textMuted}
            style={{ flex: 1, fontSize: 14, color: C.text }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Count */}
      {displayed.length > 0 && (
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}>
          <Text style={{ fontSize: 12, color: C.textMuted, fontWeight: "600" }}>
            {displayed.length} day{displayed.length !== 1 ? "s" : ""} recorded
          </Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={displayed}
        keyExtractor={(item) => item.date}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 80, paddingHorizontal: 32 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Ionicons name="folder-open-outline" size={36} color={C.border} />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "700", color: C.border, textAlign: "center" }}>
              {search ? "No results found" : "Nothing archived yet"}
            </Text>
            <Text style={{ fontSize: 13, color: C.border, marginTop: 6, textAlign: "center" }}>
              Complete tasks and add daily notes — they'll appear here
            </Text>
          </View>
        }
      />

      {/* Day detail modal */}
      <DayDetailModal entry={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// Day Detail Modal
// ─────────────────────────────────────────────
function DayDetailModal({ entry, onClose }: { entry: ArchiveEntry | null; onClose: () => void }) {
  const { colors: C } = useTheme();
  if (!entry) return null;
  const { sheet, completedTasks, isToday, date } = entry;

  return (
    <Modal
      visible={!!entry}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        {/* Header */}
        <View style={{ backgroundColor: C.headerBg, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, ...SHADOW }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              {isToday && (
                <View style={{ backgroundColor: "#fffbeb", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: "flex-start", marginBottom: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: "800", color: "#d97706" }}>TODAY</Text>
                </View>
              )}
              <Text style={{ fontSize: 18, fontWeight: "800", color: C.text }}>
                {formatDisplayDate(date)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="close" size={18} color={C.textSec} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
        >
          {/* ── Completed Tasks ── */}
          {completedTasks.length > 0 && (
            <DetailCard title="Completed Tasks" icon="checkmark-circle-outline" iconColor="#22c55e" accentColor="#f0fdf4">
              {completedTasks.map((task, i) => {
                const catBg  = CAT_BG[task.category]  ?? "bg-gray-100";
                const catTxt = CAT_TEXT[task.category] ?? "text-gray-600";
                return (
                  <View
                    key={task.id}
                    style={{
                      flexDirection: "row", alignItems: "flex-start",
                      paddingVertical: 10,
                      borderBottomWidth: i < completedTasks.length - 1 ? 1 : 0,
                      borderBottomColor: C.border,
                    }}
                  >
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#22c55e", alignItems: "center", justifyContent: "center", marginRight: 10, flexShrink: 0 }}>
                      <Ionicons name="checkmark" size={11} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", textDecorationLine: "line-through", color: C.textMuted }} numberOfLines={2}>
                        {task.title}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 6 }}>
                        <View className={`px-2 py-0.5 rounded-full ${catBg}`}>
                          <Text className={`text-xs font-semibold ${catTxt}`}>{task.category}</Text>
                        </View>
                        {task.milestones?.length > 0 && (
                          <Text style={{ fontSize: 11, color: "#a78bfa" }}>
                            ⚑ {task.milestones.filter((m) => m.done).length}/{task.milestones.length} milestones
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </DetailCard>
          )}

          {/* ── Quick Notes ── */}
          {sheet?.quickNotes && sheet.quickNotes.length > 0 && (
            <DetailCard title="Notes" icon="document-text-outline" iconColor={C.accent} accentColor={C.accentBg}>
              {sheet.quickNotes.map((note, i) => (
                <View
                  key={note.id}
                  style={{ flexDirection: "row", alignItems: "flex-start", paddingVertical: 10, borderBottomWidth: i < sheet.quickNotes.length - 1 ? 1 : 0, borderBottomColor: C.border }}
                >
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.borderStrong, marginTop: 8, marginRight: 10, flexShrink: 0 }} />
                  <Text style={{ flex: 1, fontSize: 14, color: C.text, lineHeight: 20 }}>{note.text}</Text>
                </View>
              ))}
            </DetailCard>
          )}

          {/* ── Random Thoughts (legacy data) ── */}
          {sheet?.randomThoughts && sheet.randomThoughts.length > 0 && (
            <DetailCard title="Random Thoughts" icon="bulb-outline" iconColor="#f59e0b" accentColor="#fffbeb">
              {sheet.randomThoughts.map((thought, i) => (
                <View
                  key={thought.id}
                  style={{ flexDirection: "row", alignItems: "flex-start", paddingVertical: 10, borderBottomWidth: i < sheet.randomThoughts.length - 1 ? 1 : 0, borderBottomColor: C.border }}
                >
                  <Text style={{ fontSize: 15, marginRight: 10 }}>💭</Text>
                  <Text style={{ flex: 1, fontSize: 14, color: C.textSec, lineHeight: 20 }}>{thought.text}</Text>
                </View>
              ))}
            </DetailCard>
          )}

          {/* ── Reflection ── */}
          {sheet?.reflection ? (
            <DetailCard title="Reflection" icon="moon-outline" iconColor="#a78bfa" accentColor="#faf5ff">
              <Text style={{ fontSize: 14, color: C.text, lineHeight: 22, paddingVertical: 6 }}>{sheet.reflection}</Text>
            </DetailCard>
          ) : null}

          {/* Empty state */}
          {completedTasks.length === 0 && !sheet?.quickNotes?.length && !sheet?.randomThoughts?.length && !sheet?.reflection && (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <Text style={{ fontSize: 14, color: C.border }}>Nothing was recorded this day</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// Detail Card
// ─────────────────────────────────────────────
function DetailCard({
  title, icon, iconColor, accentColor, children,
}: {
  title: string; icon: keyof typeof Ionicons.glyphMap;
  iconColor: string; accentColor: string; children: React.ReactNode;
}) {
  const { colors: C } = useTheme();
  return (
    <View style={{ backgroundColor: C.card, borderRadius: 20, overflow: "hidden", ...SHADOW }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: accentColor, paddingHorizontal: 14, paddingVertical: 10 }}>
        <Ionicons name={icon} size={14} color={iconColor} />
        <Text style={{ fontSize: 11, fontWeight: "800", color: iconColor, textTransform: "uppercase", letterSpacing: 0.6 }}>{title}</Text>
      </View>
      <View style={{ paddingHorizontal: 14, paddingBottom: 4 }}>
        {children}
      </View>
    </View>
  );
}
