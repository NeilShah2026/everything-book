/**
 * DatePickerInline — a self-contained inline calendar that renders
 * directly in a form (no nested Modal needed).
 */
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface Props {
  value: string | null; // YYYY-MM-DD
  onSelect: (date: string) => void;
  onClear: () => void;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

export default function DatePickerInline({ value, onSelect, onClear }: Props) {
  const { colors: C } = useTheme();

  const now = new Date();
  const todayYear  = now.getFullYear();
  const todayMonth = now.getMonth(); // 0-indexed
  const todayDay   = now.getDate();

  const parsed = value
    ? (() => { const [y,m,d] = value.split("-").map(Number); return { y, m: m-1, d }; })()
    : null;

  const [viewYear,  setViewYear]  = useState(parsed?.y  ?? todayYear);
  const [viewMonth, setViewMonth] = useState(parsed?.m  ?? todayMonth);

  // Sync view position when value changes from outside
  useEffect(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    }
  }, [value]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  // Build calendar grid
  const firstDOW    = new Date(viewYear, viewMonth, 1).getDay();   // Sun=0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDOW; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <View style={{ marginTop: 12, backgroundColor: C.surface, borderRadius: 16, padding: 12 }}>
      {/* Month navigation */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <TouchableOpacity onPress={prevMonth} style={{ padding: 6 }} hitSlop={{ top:6, bottom:6, left:6, right:6 }}>
          <Ionicons name="chevron-back" size={18} color={C.accent} />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: "center", fontSize: 14, fontWeight: "800", color: C.text }}>
          {MONTHS[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={{ padding: 6 }} hitSlop={{ top:6, bottom:6, left:6, right:6 }}>
          <Ionicons name="chevron-forward" size={18} color={C.accent} />
        </TouchableOpacity>
      </View>

      {/* Day-of-week labels */}
      <View style={{ flexDirection: "row", marginBottom: 4 }}>
        {DAY_LABELS.map(d => (
          <Text key={d} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: "700", color: C.border }}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {cells.map((day, i) => {
          if (!day) return <View key={`pad-${i}`} style={{ width: "14.28%", height: 34 }} />;

          const isSel   = parsed && day === parsed.d && viewMonth === parsed.m && viewYear === parsed.y;
          const isToday = day === todayDay && viewMonth === todayMonth && viewYear === todayYear;
          const isPast  = new Date(viewYear, viewMonth, day) < new Date(todayYear, todayMonth, todayDay);

          return (
            <TouchableOpacity
              key={day}
              onPress={() => {
                const iso = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                onSelect(iso);
              }}
              style={{ width: "14.28%", height: 34, alignItems: "center", justifyContent: "center" }}
            >
              <View style={{
                width: 30, height: 30, borderRadius: 15,
                backgroundColor: isSel ? C.accent : isToday ? C.accentBg : "transparent",
                alignItems: "center", justifyContent: "center",
              }}>
                <Text style={{
                  fontSize: 13,
                  fontWeight: (isSel || isToday) ? "700" : "400",
                  color: isSel ? "#fff" : isToday ? C.accent : isPast ? C.border : C.text,
                }}>
                  {day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Clear button */}
      {value && (
        <TouchableOpacity
          onPress={onClear}
          style={{ marginTop: 8, paddingVertical: 6, alignItems: "center" }}
        >
          <Text style={{ fontSize: 12, color: C.textMuted, fontWeight: "600" }}>✕ Clear date</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
