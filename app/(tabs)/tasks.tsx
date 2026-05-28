import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

import { Task, DEFAULT_CATEGORIES } from "../../types";
import { getAllTasks, saveTask, reorderTasks } from "../../lib/storage";
import { formatShortDate, todayISO, isOverdue } from "../../lib/utils";
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

const FILTERS = ["All", ...DEFAULT_CATEGORIES.map((c) => c.name)];
const FILTER_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  All: "apps-outline", School: "book-outline", Work: "briefcase-outline",
  Home: "home-outline", Health: "heart-outline",
};
const PORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

// ─────────────────────────────────────────────
export default function TasksScreen() {
  const today = todayISO();
  const { colors: C } = useTheme();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    const all = await getAllTasks();
    all.sort((a, b) => {
      const aDone = a.status === "Done" ? 1 : 0;
      const bDone = b.status === "Done" ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      const so = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (so !== 0) return so;
      return (PORDER[a.priority] ?? 1) - (PORDER[b.priority] ?? 1);
    });
    setTasks(all);
  }

  const isDraggable = filter === "All" && !search.trim();

  // Active tasks only — done tasks move to Archive
  const displayed = tasks.filter((t) => {
    if (t.status === "Done") return false;
    const matchCat    = filter === "All" || t.category === filter;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeCount = displayed.length;
  const doneCount = tasks.filter((t) => {
    if (t.status !== "Done") return false;
    const matchCat    = filter === "All" || t.category === filter;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }).length;

  async function handleSave(task: Task) { await saveTask(task); await load(); }
  function openDetail(task: Task) { setSelectedTask(task); setDetailVisible(true); }
  function handleTaskUpdated() { load(); }
  function handleTaskDeleted() { load(); }

  function handleDragEnd({ data }: { data: Task[] }) {
    setTasks(data);
    reorderTasks(data).catch(console.error);
  }

  function renderTask({ item: task, drag, isActive }: RenderItemParams<Task>) {
    const isDone = task.status === "Done";
    const overdue = task.dueDate && isOverdue(task.dueDate) && !isDone;
    const stripColor = CAT_STRIP[task.category] ?? C.borderStrong;
    const catBg  = CAT_BG[task.category]  ?? "bg-gray-100";
    const catTxt = CAT_TEXT[task.category] ?? "text-gray-600";

    return (
      <ScaleDecorator activeScale={0.97}>
        <TouchableOpacity
          onPress={() => openDetail(task)}
          onLongPress={isDraggable && !isDone ? drag : undefined}
          disabled={isActive}
          activeOpacity={0.75}
          style={[
            { backgroundColor: C.card, borderRadius: 20, flexDirection: "row", overflow: "hidden", marginHorizontal: 16, marginBottom: 10 },
            SHADOW,
            isActive && { opacity: 0.9 },
            isDone && { opacity: 0.6 },
          ]}
        >
          {/* Category strip */}
          <View style={{ width: 4, backgroundColor: isDone ? C.borderStrong : stripColor }} />

          {/* Content */}
          <View style={{ flex: 1, padding: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                {isDone && (
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4, gap: 4 }}>
                    <Ionicons name="checkmark-circle" size={13} color="#22c55e" />
                    <Text style={{ fontSize: 11, color: "#86efac", fontWeight: "700" }}>Completed</Text>
                  </View>
                )}
                <Text
                  style={[
                    { fontSize: 15, fontWeight: "700", color: C.text, lineHeight: 21, marginBottom: 6 },
                    isDone && { textDecorationLine: "line-through", color: C.textMuted },
                  ]}
                >
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
                  <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 6, lineHeight: 17 }} numberOfLines={1}>
                    {task.notes}
                  </Text>
                ) : null}
              </View>

              {/* Drag handle or chevron */}
              <View style={{ alignItems: "center", gap: 6, marginLeft: 10, marginTop: 2 }}>
                {isDraggable && !isDone && (
                  <Ionicons name="reorder-three-outline" size={20} color={C.border} />
                )}
                <Ionicons name="chevron-forward" size={16} color={C.border} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      {/* ── Header ── */}
      <View style={{ backgroundColor: C.headerBg, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, ...SHADOW }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <View>
            <Text style={{ fontSize: 26, fontWeight: "800", color: C.text, letterSpacing: -0.5 }}>Tasks</Text>
            <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 1 }}>
              {activeCount > 0 ? `${activeCount} active` : "Nothing active — great work!"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.accent, alignItems: "center", justifyContent: "center", ...SHADOW }}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.inputBg, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
          <Ionicons name="search-outline" size={16} color={C.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search tasks..."
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

      {/* ── Filter chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        style={{ backgroundColor: C.headerBg, borderBottomWidth: 1, borderBottomColor: C.border, flexGrow: 0 }}
      >
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={{
                flexDirection: "row", alignItems: "center", gap: 5,
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                backgroundColor: active ? C.accent : C.inputBg,
              }}
            >
              <Ionicons name={FILTER_ICONS[f] ?? "apps-outline"} size={13} color={active ? "#fff" : C.textMuted} />
              <Text style={{ fontSize: 13, fontWeight: "700", color: active ? "#fff" : C.textSec }}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Drag hint */}
      {isDraggable && tasks.filter((t) => t.status !== "Done").length > 1 && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 2 }}>
          <Ionicons name="reorder-three-outline" size={13} color={C.border} />
          <Text style={{ fontSize: 11, color: C.border }}>Long-press to reorder</Text>
        </View>
      )}

      {/* ── Draggable Task List ── */}
      <View style={{ flex: 1 }}>
        <DraggableFlatList
          data={displayed}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          onDragEnd={handleDragEnd}
          activationDistance={8}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: doneCount > 0 ? 8 : 32 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 80, paddingHorizontal: 32 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Ionicons name="checkmark-circle-outline" size={36} color={C.border} />
              </View>
              <Text style={{ fontSize: 15, fontWeight: "700", color: C.border, textAlign: "center" }}>
                {search ? "No tasks match your search" : filter !== "All" ? `No ${filter} tasks yet` : "All clear!"}
              </Text>
              {!search && filter === "All" && (
                <Text style={{ fontSize: 13, color: C.border, marginTop: 6, textAlign: "center" }}>
                  Tap the + button to add your first task
                </Text>
              )}
            </View>
          }
        />
      </View>

      {/* ── Completed tasks hint — pinned above tab bar, never floating ── */}
      {doneCount > 0 && (
        <View style={{ marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: 16, backgroundColor: "#f0fdf4", flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
          <Text style={{ flex: 1, fontSize: 13, color: "#16a34a", fontWeight: "600" }}>
            {doneCount} task{doneCount !== 1 ? "s" : ""} completed
          </Text>
          <Text style={{ fontSize: 12, color: "#86efac" }}>→ Archive</Text>
        </View>
      )}

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
