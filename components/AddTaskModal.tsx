import React, { useState, useEffect } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Task, TaskCategory, TaskStatus, DEFAULT_CATEGORIES } from "../types";
import { generateId, todayISO, offsetDateISO, formatShortDate } from "../lib/utils";
import { assignBucket } from "../lib/planner";
import { getClasses, saveClasses } from "../lib/storage";
import DatePickerInline from "./DatePickerInline";
import { useTheme } from "../context/ThemeContext";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  initial?: Partial<Task>;
}

const STATUSES: TaskStatus[] = ["Not Started", "In Progress", "Done"];

// Quick-pick date options
const DATE_QUICK: { label: string; emoji: string; getValue: () => string | null }[] = [
  { label: "None",      emoji: "✕",  getValue: () => null },
  { label: "Today",     emoji: "⚡", getValue: () => todayISO() },
  { label: "Tomorrow",  emoji: "🌅", getValue: () => offsetDateISO(1) },
  { label: "+3 days",   emoji: "📅", getValue: () => offsetDateISO(3) },
  { label: "Next week", emoji: "🗓️", getValue: () => offsetDateISO(7) },
];

// ── Style maps ─────────────────────────────────
const CAT_COLORS: Record<string, { activeBg: string; activeText: string }> = {
  School: { activeBg: "#ede9fe", activeText: "#6d28d9" },
  Work:   { activeBg: "#e0f2fe", activeText: "#0284c7" },
  Home:   { activeBg: "#d1fae5", activeText: "#059669" },
  Health: { activeBg: "#ffe4e6", activeText: "#e11d48" },
};
const STATUS_COLORS: Record<TaskStatus, { activeBg: string; activeText: string }> = {
  "Not Started": { activeBg: "#f5f5f4", activeText: "#44403c" },
  "In Progress": { activeBg: "#eff6ff", activeText: "#2563eb" },
  "Done":        { activeBg: "#f0fdf4", activeText: "#16a34a" },
};

// ─────────────────────────────────────────────
export default function AddTaskModal({ visible, onClose, onSave, initial }: Props) {
  const { colors: C } = useTheme();

  const [title,       setTitle]       = useState("");
  const [category,    setCategory]    = useState<TaskCategory>("School");
  const [subCategory, setSubCategory] = useState("");
  const [status,      setStatus]      = useState<TaskStatus>("Not Started");
  const [notes,       setNotes]       = useState("");
  const [dueDate,     setDueDate]     = useState<string | null>(null);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);

  // School classes
  const [classes,     setClasses]     = useState<string[]>([]);
  const [addingClass, setAddingClass] = useState(false);
  const [classInput,  setClassInput]  = useState("");

  // Load state whenever modal opens
  useEffect(() => {
    if (visible) {
      setTitle(initial?.title ?? "");
      setCategory(initial?.category ?? "School");
      setSubCategory(initial?.subCategory ?? "");
      setStatus(initial?.status ?? "Not Started");
      setNotes(initial?.notes ?? "");
      setDueDate(initial?.dueDate ?? null);
      setShowDatePicker(false);
      setAddingClass(false);
      setClassInput("");
      loadClasses();
    }
  }, [visible]);

  async function loadClasses() {
    setClasses(await getClasses());
  }

  // ── Class management ──────────────────────────
  async function handleAddClass() {
    const name = classInput.trim();
    if (!name) return;
    if (classes.includes(name)) {
      setSubCategory(name); setAddingClass(false); setClassInput(""); return;
    }
    const updated = [...classes, name];
    setClasses(updated);
    await saveClasses(updated);
    setSubCategory(name); setAddingClass(false); setClassInput("");
  }

  async function handleDeleteClass(name: string) {
    const updated = classes.filter((c) => c !== name);
    setClasses(updated);
    await saveClasses(updated);
    if (subCategory === name) setSubCategory("");
  }

  // ── Save ──────────────────────────────────────
  function handleSave() {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    const task: Task = {
      id: initial?.id || generateId(),
      title: title.trim(),
      category,
      subCategory: category === "School" ? subCategory : undefined,
      dueDate,
      priority: "Medium", // kept internally; not shown in UI
      status,
      notes: notes.trim(),
      suggestedBucket: assignBucket({ dueDate, priority: "Medium", status } as Task),
      milestones: initial?.milestones ?? [],
      sortOrder: initial?.sortOrder ?? 0,
      completedAt: status === "Done" ? (initial?.completedAt ?? now) : null,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(task);
    onClose();
  }

  const isEdit   = !!initial?.id;
  const canSave  = title.trim().length > 0;
  const isCustomDate = dueDate !== null && !DATE_QUICK.some((o) => o.getValue() === dueDate);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: C.bg }}
      >
        {/* ── Nav bar ── */}
        <SafeAreaView edges={["top"]} style={{ backgroundColor: C.headerBg }}>
          <View style={{
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            paddingHorizontal: 20, paddingVertical: 14,
            borderBottomWidth: 1, borderBottomColor: C.border,
          }}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ fontSize: 15, color: C.textMuted, fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 17, fontWeight: "800", color: C.text }}>
              {isEdit ? "Edit Task" : "New Task"}
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={!canSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: canSave ? C.accent : C.border }}>
                {isEdit ? "Save" : "Add"}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
        >
          {/* ── Title + Notes ── */}
          <View style={{ backgroundColor: C.card, borderRadius: 20, overflow: "hidden", ...CARD_SHADOW }}>
            <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border }}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Task name"
                placeholderTextColor={C.textPlaceholder}
                style={{ fontSize: 18, fontWeight: "700", color: C.text, lineHeight: 24 }}
                autoFocus={!isEdit}
                multiline
                returnKeyType="next"
              />
            </View>
            <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14 }}>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes or details..."
                placeholderTextColor={C.textPlaceholder}
                style={{ fontSize: 14, color: C.textSec, lineHeight: 21, minHeight: 56 }}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* ── Category ── */}
          <FieldCard label="Category" icon="apps-outline">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {DEFAULT_CATEGORIES.map((cat) => {
                const sel = category === cat.name;
                const c = CAT_COLORS[cat.name] ?? { activeBg: C.accentBg, activeText: C.accentText };
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => { setCategory(cat.name); if (cat.name !== "School") setSubCategory(""); }}
                    style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14, backgroundColor: sel ? c.activeBg : C.inputBg }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: sel ? c.activeText : C.textMuted }}>
                      {cat.icon}  {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FieldCard>

          {/* ── School class picker ── */}
          {category === "School" && (
            <FieldCard label="Class" icon="school-outline">
              {classes.length === 0 && !addingClass ? (
                <TouchableOpacity
                  onPress={() => setAddingClass(true)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 }}
                >
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.accentBg, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="add" size={18} color={C.accent} />
                  </View>
                  <Text style={{ fontSize: 14, color: C.textMuted, fontStyle: "italic" }}>Add your first class...</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {classes.map((cls) => {
                    const sel = subCategory === cls;
                    return (
                      <View
                        key={cls}
                        style={{
                          flexDirection: "row", alignItems: "center",
                          paddingLeft: 12, paddingRight: 6, paddingVertical: 7,
                          borderRadius: 14,
                          backgroundColor: sel ? C.accentBg : C.inputBg,
                          gap: 4,
                        }}
                      >
                        <TouchableOpacity onPress={() => setSubCategory(sel ? "" : cls)}>
                          <Text style={{ fontSize: 14, fontWeight: "600", color: sel ? C.accentText : C.textSec }}>{cls}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteClass(cls)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Ionicons name="close" size={14} color={sel ? C.accent : C.border} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}

                  {!addingClass && (
                    <TouchableOpacity
                      onPress={() => setAddingClass(true)}
                      style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14, backgroundColor: C.inputBg, borderWidth: 1.5, borderColor: C.borderStrong, borderStyle: "dashed" }}
                    >
                      <Ionicons name="add" size={14} color={C.textMuted} />
                      <Text style={{ fontSize: 13, color: C.textMuted, fontWeight: "600" }}>Add class</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {addingClass && (
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, backgroundColor: C.inputBg, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}>
                  <TextInput
                    value={classInput}
                    onChangeText={setClassInput}
                    placeholder="Class name (e.g. AP History)"
                    placeholderTextColor={C.textMuted}
                    style={{ flex: 1, fontSize: 14, color: C.text }}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleAddClass}
                  />
                  <TouchableOpacity onPress={handleAddClass}>
                    <Ionicons name="checkmark-circle" size={22} color={C.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setAddingClass(false); setClassInput(""); }}>
                    <Ionicons name="close-circle" size={22} color={C.border} />
                  </TouchableOpacity>
                </View>
              )}
            </FieldCard>
          )}

          {/* ── Due Date ── */}
          <FieldCard label="Due Date" icon="calendar-outline">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 2 }}>
              {DATE_QUICK.map((opt) => {
                const val = opt.getValue();
                const sel = !showDatePicker && dueDate === val;
                return (
                  <TouchableOpacity
                    key={opt.label}
                    onPress={() => { setDueDate(val); setShowDatePicker(false); }}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: sel ? C.accentBg : C.inputBg }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "700", color: sel ? C.accent : C.textMuted }}>
                      {opt.emoji} {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {/* Calendar picker chip */}
              <TouchableOpacity
                onPress={() => setShowDatePicker(!showDatePicker)}
                style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: (showDatePicker || isCustomDate) ? C.accentBg : C.inputBg }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: (showDatePicker || isCustomDate) ? C.accent : C.textMuted }}>
                  {isCustomDate && !showDatePicker ? `📅 ${formatShortDate(dueDate!)}` : "📅 Pick date"}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Inline calendar picker */}
            {showDatePicker && (
              <DatePickerInline
                value={dueDate}
                onSelect={(d) => { setDueDate(d); setShowDatePicker(false); }}
                onClear={() => { setDueDate(null); setShowDatePicker(false); }}
              />
            )}
          </FieldCard>

          {/* ── Status ── */}
          <FieldCard label="Status" icon="checkmark-circle-outline">
            <View style={{ flexDirection: "row", gap: 8 }}>
              {STATUSES.map((s) => {
                const sel = status === s;
                const c   = STATUS_COLORS[s];
                const icons: Record<string, string> = { "Not Started": "○", "In Progress": "◑", "Done": "●" };
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStatus(s)}
                    style={{ flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: "center", backgroundColor: sel ? c.activeBg : C.inputBg }}
                  >
                    <Text style={{ fontSize: 16 }}>{icons[s]}</Text>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: sel ? c.activeText : C.textMuted, marginTop: 3, textAlign: "center" }}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FieldCard>

          {/* ── Save button ── */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave}
            style={{ backgroundColor: canSave ? C.accent : C.borderStrong, paddingVertical: 16, borderRadius: 20, alignItems: "center", ...CARD_SHADOW }}
          >
            <Text style={{ fontSize: 16, fontWeight: "800", color: canSave ? "#fff" : C.textMuted }}>
              {isEdit ? "Save Changes" : "Add Task"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Sub-component ──────────────────────────────
function FieldCard({ label, icon, children }: { label: string; icon: keyof typeof Ionicons.glyphMap; children: React.ReactNode }) {
  const { colors: C } = useTheme();
  return (
    <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 14, ...CARD_SHADOW }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <Ionicons name={icon} size={13} color={C.textMuted} />
        <Text style={{ fontSize: 11, fontWeight: "800", color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.6 }}>
          {label}
        </Text>
      </View>
      {children}
    </View>
  );
}

const CARD_SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10 },
  android: { elevation: 3 },
  default: {},
});
