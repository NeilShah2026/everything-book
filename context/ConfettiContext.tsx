/**
 * ConfettiContext — call triggerConfetti() from anywhere in the app and
 * confetti bursts on top of everything (rendered at root level).
 */
import React, { createContext, useContext, useState, useCallback } from "react";
import ConfettiOverlay from "../components/ConfettiOverlay";

interface ConfettiContextValue {
  triggerConfetti: () => void;
}

const ConfettiContext = createContext<ConfettiContextValue>({
  triggerConfetti: () => {},
});

export function ConfettiProvider({ children }: { children: React.ReactNode }) {
  const [key, setKey] = useState<number | null>(null); // null = hidden, number = remount key

  const triggerConfetti = useCallback(() => {
    const k = Date.now();
    setKey(k);
    // Auto-hide after 3.5 s (animation finishes by then)
    setTimeout(() => setKey(null), 3500);
  }, []);

  return (
    <ConfettiContext.Provider value={{ triggerConfetti }}>
      {children}
      {/* Rendered outside all Modals, on top of everything */}
      {key !== null && <ConfettiOverlay key={key} />}
    </ConfettiContext.Provider>
  );
}

export function useConfetti() {
  return useContext(ConfettiContext);
}
