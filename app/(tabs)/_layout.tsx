import React from "react";
import { Redirect, Tabs, usePathname, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];
type TabBarFnProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>>[0];

// ── Constants ──────────────────────────────────
const SIDEBAR_W  = 220;
const BREAKPOINT = 860;

const NAV_ITEMS: {
  name: string; title: string;
  icon: IoniconName; activeIcon: IoniconName;
}[] = [
  { name: "index",   title: "Today",   icon: "sunny-outline",            activeIcon: "sunny"            },
  { name: "tasks",   title: "Tasks",   icon: "checkmark-circle-outline", activeIcon: "checkmark-circle" },
  { name: "planner", title: "Planner", icon: "calendar-outline",         activeIcon: "calendar"         },
  { name: "archive", title: "Archive", icon: "folder-outline",           activeIcon: "folder"           },
];

// ── Desktop sidebar ────────────────────────────
function SidebarNav() {
  const router    = useRouter();
  const pathname  = usePathname();
  const { session, signOut } = useAuth();
  const { colors } = useTheme();

  function isActive(name: string) {
    if (name === "index") return pathname === "/" || pathname === "";
    return pathname === `/${name}`;
  }

  function navigate(name: string) {
    if (name === "index") router.navigate("/");
    else router.navigate(`/${name}` as never);
  }

  // Email initials avatar
  const email    = session?.user?.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  const c = colors;
  return (
    <View style={{
      width: SIDEBAR_W,
      backgroundColor: c.headerBg,
      borderRightWidth: 1,
      borderRightColor: c.border,
      paddingHorizontal: 14,
      paddingTop: 40,
      paddingBottom: 24,
      flexDirection: "column",
    }}>
      {/* App brand */}
      <View style={{ paddingHorizontal: 8, marginBottom: 28 }}>
        <Text style={{ fontSize: 18, fontWeight: "800", color: c.text, letterSpacing: -0.3 }}>
          📖 EverythingBook
        </Text>
        <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 3 }}>
          Your all-in-one tracker
        </Text>
      </View>

      {/* Nav items */}
      <View style={{ gap: 4, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.name);
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => navigate(item.name)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row", alignItems: "center", gap: 11,
                paddingHorizontal: 12, paddingVertical: 11, borderRadius: 14,
                backgroundColor: active ? c.accentBg : "transparent",
              }}
            >
              <Ionicons name={active ? item.activeIcon : item.icon} size={20} color={active ? c.accent : c.textMuted} />
              <Text style={{ fontSize: 14, fontWeight: active ? "700" : "500", color: active ? c.accentText : c.textSec }}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Settings link in sidebar */}
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          activeOpacity={0.7}
          style={{
            flexDirection: "row", alignItems: "center", gap: 11,
            paddingHorizontal: 12, paddingVertical: 11, borderRadius: 14,
            backgroundColor: pathname === "/settings" ? c.accentBg : "transparent",
            marginTop: 8,
          }}
        >
          <Ionicons name="settings-outline" size={20} color={pathname === "/settings" ? c.accent : c.textMuted} />
          <Text style={{ fontSize: 14, fontWeight: "500", color: pathname === "/settings" ? c.accentText : c.textSec }}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* User + sign-out (bottom of sidebar) */}
      <View style={{ borderTopWidth: 1, borderTopColor: c.border, paddingTop: 16, gap: 10 }}>
        {email ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 8 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.accentBg, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 12, fontWeight: "800", color: c.accent }}>{initials}</Text>
            </View>
            <Text style={{ flex: 1, fontSize: 12, color: c.textSec, fontWeight: "500" }} numberOfLines={1}>{email}</Text>
          </View>
        ) : null}
        <TouchableOpacity
          onPress={signOut}
          activeOpacity={0.7}
          style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, backgroundColor: "#fef2f2" }}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#ef4444" }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Mobile bottom tab bar ──────────────────────
function MobileTabBar({ state, navigation }: TabBarFnProps) {
  const insets    = useSafeAreaInsets();
  const { colors } = useTheme();
  const bottomPad = Math.max(insets.bottom, Platform.OS === "ios" ? 16 : 8);

  return (
    <View style={{
      flexDirection: "row",
      backgroundColor: colors.headerBg,
      paddingTop: 10,
      paddingBottom: bottomPad,
      paddingHorizontal: 6,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
        },
        android: { elevation: 12 },
      }),
    }}>
      {NAV_ITEMS.map((item, index) => {
        const focused = state.index === index;
        return (
          <TouchableOpacity
            key={item.name}
            onPress={() => navigation.navigate(item.name)}
            activeOpacity={0.7}
            style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 3 }}
          >
            <View style={{
              alignItems: "center", justifyContent: "center",
              width: 48, height: 30, borderRadius: 15,
              backgroundColor: focused ? colors.accentBg : "transparent",
            }}>
              <Ionicons
                name={focused ? item.activeIcon : item.icon}
                size={22}
                color={focused ? colors.accent : colors.textMuted}
              />
            </View>
            <Text style={{
              fontSize: 10.5,
              fontWeight: focused ? "700" : "500",
              color: focused ? colors.accent : colors.textMuted,
            }}>
              {item.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────
export default function TabsLayout() {
  const { session, loading } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop  = Platform.OS === "web" && width >= BREAKPOINT;

  // Not authenticated → redirect to auth screens
  if (!loading && !session) return <Redirect href="/(auth)" />;

  return (
    <View style={{ flex: 1, flexDirection: isDesktop ? "row" : "column" }}>
      {isDesktop && <SidebarNav />}
      <View style={{ flex: 1 }}>
        <Tabs
          tabBar={(props) => isDesktop ? null : <MobileTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          {NAV_ITEMS.map((item) => (
            <Tabs.Screen key={item.name} name={item.name} options={{ title: item.title }} />
          ))}
        </Tabs>
      </View>
    </View>
  );
}
