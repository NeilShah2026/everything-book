import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import { Task, TaskBucket } from "../../types";
import { getAllTasks, saveTask } from "../../lib/storage";
import { groupByBucket } from "../../lib/planner";
import { formatShortDate, isOverdue } from "../../lib/utils";
import AddTaskModal from "../../components/AddTaskModal";
import TaskDetailSheet from "../../components/TaskDetailSheet";
import { useTheme } from "../../context/ThemeContext";

// ── Design tokens ──────────────────────────────
const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10 },
  android: { elevation: 3 },
  default: {},
});

const CAT_STRIP: Record<string, string> = {
  School: "#7c3aed", Work: "#0284c7",
  Home: "#059669",   Health: "#e11d48",
};
const CAT_BG: Record<string, string> = {
  School: "bg-violet-100", Work: "bg-sky-100",
  Home: "bg-emerald-100",  Health: "bg-rose-100",
};
const CAT_TEXT: Record<string, string> = {
  School: "text-violet-700", Work: "text-sky-700",
  Home: "text-emerald-700",  Health: "text-rose-700",
};

// ── Bucket config (accent colors stay fixed — they're semantic) ──
const BUCKET_CFG: Record<
  TaskBucket,
  { emoji: string; label: string; headerBg: string; headerText: string; countBg: string; countText: string; stripColor: string }
> = {
  Today: {
    emoji: "⚡",  label: "Today",
    headerBg: "#ede9fe", headerText: "#4f46e5",
    countBg: "#6366f1", countText: "#fff",
    stripColor: "#6366f1",
  },
  Tomorrow: {
    emoji: "🌅", label: "Tomorrow",
    headerBg: "#fffbeb", headerText: "#d97706",
    countBg: "#f59e0b", countText: "#fff",
    stripColor: "#f59e0b",
  },
  "This Week": {
    emoji: "📅", label: "This Week",
    headerBg: "#e0f2fe", headerText: "#0284c7",
    countBg: "#0ea5e9", countText: "#fff",
    stripColor: "#0ea5e9",
  },
  Later: {
    emoji: "🗓️", label: "Later",
    headerBg: "#f5f5f4", headerText: "#78716c",
    countBg: "#a8a29e", countText: "#fff",
    stripColor: "#d1d5db",
  },
};

const BUCKET_ORDER: TaskBucket[] = ["Today", "Tomorrow", "This Week", "Later"];

// ─────────────────────────────────────────────
export default function PlannerScreen() {
  const { colors: C } = useTheme();

  const [groups, setGroups] = useState<Record<TaskBucket, Task[]>>({
    Today: [], Tomorrow: [], "This Week": [], Later: [],
  });
  const [showAdd, setShowAdd] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    const tasks = await getAllTasks();
    setGroups(groupByBucket(tasks));
  }

  async function handleSave(task: Task) { await saveTask(task); await load(); }
  function openDetail(task: Task) { setSelectedTask(task); setDetailVisible(true); }
  function handleTaskUpdated() { load(); }
  function handleTaskDeleted() { load(); }
  function toggleCollapse(bucket: TaskBucket) {
    setCollapsed((prev) => ({ ...prev, [bucket]: !prev[bucket] }));
  }

  const totalActive = BUCKET_ORDER.reduce((acc, b) => {
    return acc + groups[b].filter((t) => t.status !== "Done").length;
  }, 0);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      {/* ── Header ── */}
      <View style={{ backgroundColor: C.headerBg, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, ...SHADOW }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 26, fontWeight: "800", color: C.text, letterSpacing: -0.5 }}>Planner</Text>
            <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>
              {totalActive === 0 ? "All clear 🎉" : `${totalActive} active task${totalActive !== 1 ? "s" : ""}`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.accent, alignItems: "center", justifyContent: "center", ...SHADOW }}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
      >
        {BUCKET_ORDER.map((bucket) => {
          const bucketTasks = groups[bucket];
          const cfg = BUCKET_CFG[bucket];
          const isCollapsed = collapsed[bucket];
          const activeTasks = bucketTasks.filter((t) => t.status !== "Done");
          const doneTasks   = bucketTasks.filter((t) => t.status === "Done");

          return (
            <View key={bucket} style={{ backgroundColor: C.card, borderRadius: 24, overflow: "hidden", ...SHADOW }}>
              {/* Bucket header */}
              <TouchableOpacity
                onPress={() => toggleCollapse(bucket)}
                activeOpacity={0.7}
                style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: cfg.headerBg, gap: 10 }}
              >
                <Text style={{ fontSize: 20 }}>{cfg.emoji}</Text>
                <Text style={{ fontSize: 15, fontWeight: "800", color: cfg.headerText, flex: 1 }}>{cfg.label}</Text>
                <View style={{ backgroundColor: cfg.countBg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: "800", color: cfg.countText }}>{bucketTasks.length}</Text>
                </View>
                <Ionicons name={isCollapsed ? "chevron-down" : "chevron-up"} size={16} color={cfg.headerText} />
              </TouchableOpacity>

              {/* Tasks */}
              {!isCollapsed && (
                <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, gap: 8 }}>
                  {bucketTasks.length === 0 ? (
                    <TouchableOpacity
                      onPress={() => setShowAdd(true)}
                      style={{ paddingVertical: 16, alignItems: "center", borderRadius: 16, borderWidth: 1.5, borderColor: C.border, borderStyle: "dashed" }}
                    >
                      <Text style={{ fontSize: 13, color: C.border }}>Nothing here yet</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      {activeTasks.map((task) => (
                        <BucketTaskCard key={task.id} task={task} bucketStripColor={cfg.stripColor} onPress={() => openDetail(task)} />
                      ))}
                      {doneTasks.map((task) => (
                        <BucketTaskCard key={task.id} task={task} bucketStripColor={C.borderStrong} onPress={() => openDetail(task)} isDimmed />
                      ))}
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <AddTaskModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleSave}
        initial={undefined}
      />
      <TaskDetailSheet
        task={selectedTask}
        visible={detailVisible}
        onClose={() => { setDetailVisible(false); setSelectedTask(null); }}
        onUpdated={handleTaskUpdated}
        onDeleted={handleTaskDeleted}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// Bucket Task Card
// ─────────────────────────────────────────────
function BucketTaskCard({
  task, bucketStripColor, onPress, isDimmed = false,
}: {
  task: Task; bucketStripColor: string; onPress: () => void; isDimmed?: boolean;
}) {
  const { colors: C } = useTheme();
  const isDone  = task.status === "Done";
  const overdue = task.dueDate && isOverdue(task.dueDate) && !isDone;
  const catBg   = CAT_BG[task.category]  ?? "bg-gray-100";
  const catTxt  = CAT_TEXT[task.category] ?? "text-gray-600";
  const stripColor = !isDone ? (CAT_STRIP[task.category] ?? bucketStripColor) : C.borderStrong;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        { backgroundColor: C.surface, borderRadius: 16, flexDirection: "row", overflow: "hidden" },
        isDimmed && { opacity: 0.55 },
      ]}
    >
      <View style={{ width: 3, backgroundColor: stripColor }} />
      <View style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center" }}>
        {/* Done checkmark */}
        <View
          style={{
            width: 20, height: 20, borderRadius: 10, borderWidth: 2,
            borderColor: isDone ? "#22c55e" : C.borderStrong,
            backgroundColor: isDone ? "#22c55e" : "transparent",
            alignItems: "center", justifyContent: "center",
            marginRight: 10, flexShrink: 0,
          }}
        >
          {isDone && <Ionicons name="checkmark" size={11} color="#fff" />}
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={[
              { fontSize: 14, fontWeight: "600", color: C.text, lineHeight: 19 },
              isDone && { textDecorationLine: "line-through", color: C.textMuted },
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 5, alignItems: "center" }}>
            <View className={`px-2 py-0.5 rounded-full ${catBg}`}>
              <Text className={`text-xs font-semibold ${catTxt}`}>{task.category}</Text>
            </View>
            {task.category === "School" && task.subCategory ? (
              <View style={{ backgroundColor: C.accentBg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 16 }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: C.accentText }}>🎓 {task.subCategory}</Text>
              </View>
            ) : null}
            {task.dueDate && (
              <Text style={{ fontSize: 11, color: overdue ? "#ef4444" : C.textMuted, fontWeight: overdue ? "600" : "400" }}>
                {overdue ? "⚠️ " : ""}{formatShortDate(task.dueDate)}
              </Text>
            )}
            {task.milestones?.length > 0 && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                <Ionicons name="flag-outline" size={10} color="#a78bfa" />
                <Text style={{ fontSize: 10, color: "#a78bfa", fontWeight: "600" }}>
                  {task.milestones.filter((m) => m.done).length}/{task.milestones.length}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={14} color={C.border} style={{ marginLeft: 8 }} />
      </View>
    </TouchableOpacity>
  );
}
