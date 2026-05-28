import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import { DailySheet, QuickNote, Task } from "../../types";
import {
  getAllTasks,
  saveTask,
  deleteTask,
  getSheetByDate,
  saveSheet,
} from "../../lib/storage";
import {
  generateId,
  todayISO,
  formatDisplayDate,
  parseFastInput,
  formatShortDate,
} from "../../lib/utils";
import { assignBucket } from "../../lib/planner";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import AddTaskModal from "../../components/AddTaskModal";
import TaskDetailSheet from "../../components/TaskDetailSheet";

// ── Design tokens (static — don't depend on theme) ─────────
const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10 },
  android: { elevation: 3 },
  default: {},
});

// Category → left-strip color (replaces priority strips)
const CAT_STRIP: Record<string, string> = {
  School: "#7c3aed", Work: "#0284c7",
  Home: "#059669",   Health: "#e11d48",
};

// Category chips
const CAT_BG: Record<string, string> = {
  School: "bg-violet-100", Work: "bg-sky-100",
  Home: "bg-emerald-100", Health: "bg-rose-100",
};
const CAT_TEXT: Record<string, string> = {
  School: "text-violet-700", Work: "text-sky-700",
  Home: "text-emerald-700", Health: "text-rose-700",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { text: "Good morning", emoji: "☀️" };
  if (h >= 12 && h < 17) return { text: "Good afternoon", emoji: "🌤️" };
  if (h >= 17 && h < 21) return { text: "Good evening", emoji: "🌆" };
  return { text: "Good night", emoji: "🌙" };
}

// ─────────────────────────────────────────────
export default function TodayScreen() {
  const today    = todayISO();
  const greeting = getGreeting();
  const router   = useRouter();
  const { session } = useAuth();
  const { colors }  = useTheme();

  const userMeta   = session?.user?.user_metadata;
  const displayName = (userMeta?.full_name as string | undefined)?.split(" ")[0] ?? "";
  const email      = session?.user?.email ?? "";
  const initials   = displayName ? displayName.charAt(0).toUpperCase() : email.slice(0, 2).toUpperCase();

  const [sheet, setSheet] = useState<DailySheet | null>(null);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  const [fastInput, setFastInput] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [editTask, setEditTask] = useState<Partial<Task> | undefined>(undefined);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const [showRollover, setShowRollover] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    let s = await getSheetByDate(today);
    if (!s) {
      s = {
        id: generateId(), date: today, quickNotes: [], randomThoughts: [],
        reflection: "", taskIds: [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      await saveSheet(s);
    }
    setSheet(s);
    const tasks = await getAllTasks();
    setAllTasks(tasks);
    setTodayTasks(
      tasks
        .filter((t) => t.status !== "Done" && assignBucket(t) === "Today")
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    );
    setUpcomingTasks(
      tasks
        .filter((t) => {
          if (t.status === "Done") return false;
          const b = assignBucket(t);
          return b === "Tomorrow" || b === "This Week";
        })
        .sort((a, b) => {
          const bA = assignBucket(a), bB = assignBucket(b);
          if (bA === "Tomorrow" && bB !== "Tomorrow") return -1;
          if (bA !== "Tomorrow" && bB === "Tomorrow") return 1;
          return (a.dueDate ?? "z").localeCompare(b.dueDate ?? "z");
        })
    );
  }

  async function updateSheet(updates: Partial<DailySheet>) {
    if (!sheet) return;
    const updated = { ...sheet, ...updates, updatedAt: new Date().toISOString() };
    setSheet(updated);
    await saveSheet(updated);
  }

  async function addQuickNote() {
    if (!noteInput.trim() || !sheet) return;
    const note: QuickNote = { id: generateId(), text: noteInput.trim(), createdAt: new Date().toISOString() };
    await updateSheet({ quickNotes: [...sheet.quickNotes, note] });
    setNoteInput(""); setAddingNote(false);
  }

  async function removeQuickNote(id: string) {
    if (!sheet) return;
    await updateSheet({ quickNotes: sheet.quickNotes.filter((n) => n.id !== id) });
  }

  function openDetail(task: Task) { setSelectedTask(task); setDetailVisible(true); }
  function handleTaskUpdated() { load(); }
  function handleTaskDeleted() { load(); }

  async function handleSaveTask(task: Task) { await saveTask(task); await load(); }

  async function handleFastInput() {
    const trimmed = fastInput.trim();
    if (!trimmed) return;
    const parsed = parseFastInput(trimmed);
    if (parsed.likelyTask) {
      setEditTask({ title: parsed.title, category: parsed.category, dueDate: parsed.dueDate, priority: parsed.priority, status: "Not Started", notes: "" });
      setShowAddTask(true);
    } else if (sheet) {
      const note: QuickNote = { id: generateId(), text: trimmed, createdAt: new Date().toISOString() };
      await updateSheet({ quickNotes: [...sheet.quickNotes, note] });
    }
    setFastInput("");
  }

  async function handleRolloverConfirm(updates: Task[], deletes: string[]) {
    for (const t of updates) await saveTask(t);
    for (const id of deletes) await deleteTask(id);
    await load(); setShowRollover(false);
  }

  const unfinished  = allTasks.filter((t) => t.status !== "Done" && assignBucket(t) === "Today");
  const overdueCount = todayTasks.filter((t) => t.dueDate && t.dueDate < today).length;

  // Shorthand color aliases
  const C = colors;

  // ─────────────────────────────────────────
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* ── Hero Header ── */}
          <View style={{ backgroundColor: C.headerBg, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20, ...SHADOW }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 26, fontWeight: "800", color: C.text, letterSpacing: -0.5 }}>
                  {greeting.emoji} {greeting.text}{displayName ? `, ${displayName}` : ""}
                </Text>
                <Text style={{ fontSize: 14, color: C.textMuted, marginTop: 2 }}>
                  {formatDisplayDate(today)}
                </Text>
              </View>
              {/* Avatar → Settings */}
              <TouchableOpacity
                onPress={() => router.push("/settings")}
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: C.accentBg, alignItems: "center", justifyContent: "center",
                  marginLeft: 12,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "800", color: C.accent }}>
                  {initials || "👤"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Stats row */}
            <View style={{ flexDirection: "row", marginTop: 16, gap: 8, flexWrap: "wrap" }}>
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.accentBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 5 }}>
                <Ionicons name="checkmark-circle-outline" size={14} color={C.accent} />
                <Text style={{ fontSize: 12, fontWeight: "700", color: C.accent }}>
                  {todayTasks.length} task{todayTasks.length !== 1 ? "s" : ""} today
                </Text>
              </View>
              {overdueCount > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fef2f2", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 5 }}>
                  <Ionicons name="warning-outline" size={14} color="#ef4444" />
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#ef4444" }}>{overdueCount} overdue</Text>
                </View>
              )}
              {unfinished.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowRollover(true)}
                  style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fffbeb", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 5 }}
                >
                  <Ionicons name="time-outline" size={14} color="#d97706" />
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#d97706" }}>{unfinished.length} unfinished</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ── Tasks for Today ── */}
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <SectionHeader title="Tasks for Today" icon="checkmark-circle-outline" colors={C}
              onAdd={() => { setEditTask(undefined); setShowAddTask(true); }} />

            {todayTasks.length === 0 && upcomingTasks.length === 0 ? (
              <TouchableOpacity
                onPress={() => { setEditTask(undefined); setShowAddTask(true); }}
                style={{ backgroundColor: C.card, borderRadius: 20, padding: 20, alignItems: "center", borderWidth: 1.5, borderColor: C.borderStrong, borderStyle: "dashed", ...SHADOW }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.accentBg, alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <Ionicons name="add" size={22} color={C.accent} />
                </View>
                <Text style={{ fontSize: 14, color: C.textMuted, fontWeight: "600" }}>Add your first task for today</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ gap: 10 }}>
                {todayTasks.length === 0 && (
                  <TouchableOpacity
                    onPress={() => { setEditTask(undefined); setShowAddTask(true); }}
                    style={{ backgroundColor: C.card, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: C.border, borderStyle: "dashed" }}
                  >
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.accentBg, alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="add" size={16} color={C.accent} />
                    </View>
                    <Text style={{ fontSize: 13, color: C.textMuted, fontWeight: "600" }}>Add a task for today</Text>
                  </TouchableOpacity>
                )}
                {todayTasks.map((task) => (
                  <TaskCard key={task.id} task={task} today={today} colors={C} onPress={() => openDetail(task)} />
                ))}

                {upcomingTasks.length > 0 && (
                  <>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6, marginBottom: 2 }}>
                      <View style={{ flex: 1, height: 1, backgroundColor: C.borderStrong }} />
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: C.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                        <Ionicons name="time-outline" size={11} color={C.textMuted} />
                        <Text style={{ fontSize: 10, fontWeight: "800", color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>
                          Coming up
                        </Text>
                      </View>
                      <View style={{ flex: 1, height: 1, backgroundColor: C.borderStrong }} />
                    </View>
                    {upcomingTasks.map((task) => {
                      const bucket = assignBucket(task) as "Tomorrow" | "This Week";
                      return (
                        <UpcomingTaskCard key={task.id} task={task} bucket={bucket} today={today} colors={C} onPress={() => openDetail(task)} />
                      );
                    })}
                  </>
                )}
              </View>
            )}
          </View>

          {/* ── Quick Notes ── */}
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <SectionHeader title="Notes" icon="document-text-outline" colors={C} onAdd={() => setAddingNote(true)} />
            <View style={{ backgroundColor: C.card, borderRadius: 20, overflow: "hidden", ...SHADOW }}>
              {sheet?.quickNotes.map((note, i) => (
                <View
                  key={note.id}
                  style={{
                    flexDirection: "row", alignItems: "flex-start",
                    paddingHorizontal: 16, paddingVertical: 13,
                    borderBottomWidth: i < (sheet.quickNotes.length - 1) || addingNote ? 1 : 0,
                    borderBottomColor: C.border,
                  }}
                >
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.borderStrong, marginTop: 8, marginRight: 12, flexShrink: 0 }} />
                  <Text style={{ flex: 1, fontSize: 14, color: C.text, lineHeight: 20 }}>{note.text}</Text>
                  <TouchableOpacity onPress={() => removeQuickNote(note.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={15} color={C.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}

              {addingNote && (
                <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                  <InlineInput
                    value={noteInput} onChangeText={setNoteInput}
                    placeholder="Add a note..." onSubmit={addQuickNote} colors={C}
                    onCancel={() => { setAddingNote(false); setNoteInput(""); }}
                  />
                </View>
              )}

              {!sheet?.quickNotes.length && !addingNote && (
                <TouchableOpacity onPress={() => setAddingNote(true)} style={{ padding: 16 }}>
                  <Text style={{ fontSize: 14, color: C.textPlaceholder, fontStyle: "italic" }}>Tap + to jot a note</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ── End-of-Day Reflection ── */}
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <SectionHeader title="End-of-Day Reflection" icon="moon-outline" colors={C} />
            <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 16, ...SHADOW }}>
              <TextInput
                value={sheet?.reflection ?? ""}
                onChangeText={(v) => updateSheet({ reflection: v })}
                placeholder={"What did I get done today?\nWhat still needs attention?"}
                placeholderTextColor={C.textPlaceholder}
                style={{ fontSize: 14, color: C.text, lineHeight: 22, minHeight: 90 }}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* ── Fast input bar ── */}
        <View style={{
          backgroundColor: C.headerBg,
          paddingHorizontal: 16, paddingVertical: 12,
          flexDirection: "row", alignItems: "center", gap: 10,
          borderTopWidth: 1, borderTopColor: C.border,
          ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.04, shadowRadius: 8 }, android: {} }),
        }}>
          <TouchableOpacity
            onPress={() => { setEditTask(undefined); setShowAddTask(true); }}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.accent, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
          <TextInput
            value={fastInput}
            onChangeText={setFastInput}
            placeholder="Capture anything quickly..."
            placeholderTextColor={C.textMuted}
            style={{ flex: 1, fontSize: 14, color: C.text, backgroundColor: C.inputBg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 }}
            returnKeyType="done"
            onSubmitEditing={handleFastInput}
          />
          {fastInput.length > 0 && (
            <TouchableOpacity onPress={handleFastInput}>
              <Ionicons name="arrow-up-circle" size={32} color={C.accent} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      <AddTaskModal
        visible={showAddTask}
        onClose={() => { setShowAddTask(false); setEditTask(undefined); }}
        onSave={handleSaveTask}
        initial={editTask}
      />
      <TaskDetailSheet
        task={selectedTask}
        visible={detailVisible}
        onClose={() => { setDetailVisible(false); setSelectedTask(null); }}
        onUpdated={handleTaskUpdated}
        onDeleted={handleTaskDeleted}
      />
      <RolloverModal
        visible={showRollover}
        tasks={unfinished}
        onClose={() => setShowRollover(false)}
        onConfirm={handleRolloverConfirm}
        colors={C}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// Task Card
// ─────────────────────────────────────────────
function TaskCard({ task, today, colors: C, onPress }: { task: Task; today: string; colors: any; onPress: () => void }) {
  const overdue    = task.dueDate && task.dueDate < today;
  const catBg      = CAT_BG[task.category]   ?? "bg-gray-100";
  const catTxt     = CAT_TEXT[task.category] ?? "text-gray-600";
  const stripColor = CAT_STRIP[task.category] ?? "#d1d5db";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}
      style={{ backgroundColor: C.card, borderRadius: 20, flexDirection: "row", overflow: "hidden", ...SHADOW }}>
      <View style={{ width: 4, backgroundColor: stripColor }} />
      <View style={{ flex: 1, padding: 14, flexDirection: "row", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: C.text, lineHeight: 21, marginBottom: 6 }}>
            {task.title}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            <View className={`px-2.5 py-1 rounded-full ${catBg}`}>
              <Text className={`text-xs font-semibold ${catTxt}`}>{task.category}</Text>
            </View>
            {task.category === "School" && task.subCategory ? (
              <View style={{ backgroundColor: C.accentBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: C.accentText }}>🎓 {task.subCategory}</Text>
              </View>
            ) : null}
            {task.dueDate && (
              <Text style={{ fontSize: 12, color: overdue ? "#ef4444" : C.textMuted, fontWeight: overdue ? "600" : "400" }}>
                {overdue ? "⚠️ " : "📅 "}{formatShortDate(task.dueDate)}
              </Text>
            )}
            {task.milestones?.length > 0 && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                <Ionicons name="flag-outline" size={11} color="#a78bfa" />
                <Text style={{ fontSize: 11, color: "#a78bfa", fontWeight: "600" }}>
                  {task.milestones.filter((m) => m.done).length}/{task.milestones.length}
                </Text>
              </View>
            )}
            {task.status === "In Progress" && (
              <View style={{ backgroundColor: "#eff6ff", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                <Text style={{ fontSize: 11, color: "#3b82f6", fontWeight: "600" }}>In progress</Text>
              </View>
            )}
          </View>
          {task.notes ? (
            <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 6, lineHeight: 17 }} numberOfLines={1}>{task.notes}</Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={16} color={C.borderStrong} style={{ marginTop: 2, marginLeft: 8 }} />
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────
// Upcoming Task Card
// ─────────────────────────────────────────────
function UpcomingTaskCard({ task, bucket, today, colors: C, onPress }: {
  task: Task; bucket: "Tomorrow" | "This Week"; today: string; colors: any; onPress: () => void;
}) {
  const catBg  = CAT_BG[task.category]   ?? "bg-gray-100";
  const catTxt = CAT_TEXT[task.category] ?? "text-gray-600";
  const stripColor = CAT_STRIP[task.category] ?? "#d1d5db";
  const bucketCfg = bucket === "Tomorrow"
    ? { label: "🌅 Tomorrow", bg: "#fffbeb", text: "#d97706" }
    : { label: "📅 This Week", bg: "#e0f2fe", text: "#0284c7" };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        backgroundColor: C.card,
        borderRadius: 18,
        flexDirection: "row",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: C.border,
        ...SHADOW,
      }}
    >
      {/* Dimmed strip — slightly thinner than today tasks to visually de-emphasise */}
      <View style={{ width: 3, backgroundColor: stripColor, opacity: 0.55 }} />
      <View style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          {/* Bucket badge on its own line so it's clearly legible */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <View style={{ backgroundColor: bucketCfg.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
              <Text style={{ fontSize: 10, fontWeight: "800", color: bucketCfg.text }}>{bucketCfg.label}</Text>
            </View>
            {task.dueDate && (
              <Text style={{ fontSize: 11, color: C.textMuted }}>{formatShortDate(task.dueDate)}</Text>
            )}
          </View>
          <Text style={{ fontSize: 14, fontWeight: "600", color: C.text, lineHeight: 19, marginBottom: 4 }}>{task.title}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
            <View className={`px-2 py-0.5 rounded-full ${catBg}`}>
              <Text className={`text-xs font-semibold ${catTxt}`}>{task.category}</Text>
            </View>
            {task.category === "School" && task.subCategory ? (
              <View style={{ backgroundColor: C.accentBg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: C.accentText }}>🎓 {task.subCategory}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={14} color={C.borderStrong} style={{ marginTop: 4, marginLeft: 8 }} />
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────
function SectionHeader({ title, icon, onAdd, colors: C }: {
  title: string; icon: keyof typeof Ionicons.glyphMap; onAdd?: () => void; colors: any;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 6 }}>
      <Ionicons name={icon} size={14} color={C.textMuted} />
      <Text style={{ fontSize: 11, fontWeight: "800", color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, flex: 1 }}>
        {title}
      </Text>
      {onAdd && (
        <TouchableOpacity onPress={onAdd} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="add" size={20} color={C.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// Inline Input
// ─────────────────────────────────────────────
function InlineInput({ value, onChangeText, placeholder, onSubmit, onCancel, colors: C }: {
  value: string; onChangeText: (v: string) => void; placeholder: string;
  onSubmit: () => void; onCancel: () => void; colors: any;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <TextInput
        value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor={C.textPlaceholder}
        style={{ flex: 1, fontSize: 14, color: C.text }}
        autoFocus onSubmitEditing={onSubmit} returnKeyType="done" blurOnSubmit={false}
      />
      <TouchableOpacity onPress={onSubmit}><Ionicons name="checkmark-circle" size={22} color={C.accent} /></TouchableOpacity>
      <TouchableOpacity onPress={onCancel}><Ionicons name="close-circle" size={22} color={C.borderStrong} /></TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────
// Rollover Modal
// ─────────────────────────────────────────────
type RolloverDecision = "tomorrow" | "keep" | "done" | "delete";
const ROLLOVER_OPTS: { key: RolloverDecision; label: string; color: string }[] = [
  { key: "tomorrow", label: "Tomorrow", color: "#f59e0b" },
  { key: "keep",     label: "Keep",     color: "#6366f1" },
  { key: "done",     label: "Done ✓",   color: "#22c55e" },
  { key: "delete",   label: "Delete",   color: "#ef4444" },
];

function RolloverModal({ visible, tasks, onClose, onConfirm, colors: C }: {
  visible: boolean; tasks: Task[]; onClose: () => void;
  onConfirm: (updates: Task[], deletes: string[]) => Promise<void>; colors: any;
}) {
  const [decisions, setDecisions] = useState<Record<string, RolloverDecision>>({});
  useEffect(() => { if (visible) setDecisions({}); }, [visible]);

  function setDecision(id: string, d: RolloverDecision) {
    setDecisions((prev) => ({ ...prev, [id]: d }));
  }

  async function confirm() {
    const tomorrow = (() => {
      const d = new Date(); d.setDate(d.getDate() + 1);
      return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
    })();
    const updates: Task[] = []; const deletes: string[] = [];
    const now = new Date().toISOString();
    for (const task of tasks) {
      const dec = decisions[task.id] ?? "keep";
      if (dec === "delete") deletes.push(task.id);
      else if (dec === "done") updates.push({ ...task, status: "Done", completedAt: now, updatedAt: now });
      else if (dec === "tomorrow") updates.push({ ...task, dueDate: tomorrow, updatedAt: now });
    }
    await onConfirm(updates, deletes);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={{ backgroundColor: C.headerBg, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: C.text }}>End-of-Day Review</Text>
          <Text style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} unfinished — what should happen?
          </Text>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>
          {tasks.map((task) => {
            const dec = decisions[task.id] ?? "keep";
            return (
              <View key={task.id} style={{ backgroundColor: C.card, borderRadius: 20, padding: 16, ...SHADOW }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 12 }} numberOfLines={2}>{task.title}</Text>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {ROLLOVER_OPTS.map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      onPress={() => setDecision(task.id, opt.key)}
                      style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center", backgroundColor: dec === opt.key ? opt.color : C.surface }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "700", color: dec === opt.key ? "#fff" : C.textMuted }}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
        <View style={{ padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: C.border }}>
          <TouchableOpacity onPress={confirm} style={{ backgroundColor: C.accent, paddingVertical: 16, borderRadius: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#fff" }}>Confirm & Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ paddingVertical: 12, alignItems: "center" }}>
            <Text style={{ fontSize: 14, color: C.textMuted }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
