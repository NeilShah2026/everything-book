/**
 * ConfettiOverlay — fullscreen confetti burst using React Native's built-in
 * Animated API (no extra packages needed). Renders as a pointer-events-none
 * overlay so it doesn't block touches.
 */
import React, { useEffect, useRef, useMemo } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

const COLORS = [
  "#6366f1", "#818cf8", // indigo
  "#f59e0b", "#fbbf24", // amber
  "#22c55e", "#4ade80", // green
  "#ef4444", "#f87171", // red
  "#ec4899", "#f472b6", // pink
  "#06b6d4", "#22d3ee", // cyan
  "#8b5cf6", "#a78bfa", // violet
  "#f97316", "#fb923c", // orange
];

interface ParticleProps {
  x: number;
  color: string;
  size: number;
  width: number;
  height: number;
  drift: number;
  delay: number;
  duration: number;
  isCircle: boolean;
  spinFactor: number; // +1 or -1
}

function Particle({ x, color, size, width: w, height: h, drift, delay, duration, isCircle, spinFactor }: ParticleProps) {
  const yAnim    = useRef(new Animated.Value(-40)).current;
  const xAnim    = useRef(new Animated.Value(0)).current;
  const rotAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Create interpolation once so it doesn't re-calculate on every render
  const spin = useRef(
    rotAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", `${spinFactor * 540}deg`],
    })
  ).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(yAnim, {
          toValue: h + 60,
          duration,
          easing: Easing.in(Easing.quad), // gravity feel
          useNativeDriver: true,
        }),
        Animated.timing(xAnim, {
          toValue: drift,
          duration,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        // Start fading at 65% of the fall
        Animated.sequence([
          Animated.delay(duration * 0.65),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: duration * 0.35,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: 0,
        width: w,
        height: h,
        borderRadius: isCircle ? w / 2 : 3,
        backgroundColor: color,
        opacity: fadeAnim,
        transform: [{ translateY: yAnim }, { translateX: xAnim }, { rotate: spin }],
      }}
    />
  );
}

const N = 55; // particle count

export default function ConfettiOverlay() {
  // Generate particle data once when this component mounts
  const particles = useMemo<ParticleProps[]>(() =>
    Array.from({ length: N }, (_, i) => {
      const isCircle = Math.random() > 0.45;
      const baseSize = 6 + Math.random() * 9;
      return {
        x:          Math.random() * width,
        color:      COLORS[Math.floor(Math.random() * COLORS.length)],
        size:       baseSize,
        width:      baseSize,
        height:     isCircle ? baseSize : baseSize * (0.4 + Math.random() * 0.8),
        drift:      (Math.random() - 0.5) * 160,
        delay:      i * 20 + Math.random() * 80,
        duration:   1600 + Math.random() * 1000,
        isCircle,
        spinFactor: Math.random() > 0.5 ? 1 : -1,
      };
    }),
  []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}
    </View>
  );
}
