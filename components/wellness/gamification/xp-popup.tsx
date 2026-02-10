"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface XPPopupProps {
  xpAmount: number;
  multiplier?: number;
  show: boolean;
  onComplete?: () => void;
}

export function XPPopup({ xpAmount, multiplier, show, onComplete }: XPPopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 pointer-events-none",
        "animate-in slide-in-from-bottom-4 fade-in duration-300",
        !show && "animate-out fade-out duration-300"
      )}
    >
      <div className="bg-yellow-500 text-white rounded-lg px-4 py-2 shadow-lg">
        <p className="text-lg font-bold">+{xpAmount} XP</p>
        {multiplier && multiplier > 1 && (
          <p className="text-sm opacity-90">x{multiplier}</p>
        )}
      </div>
    </div>
  );
}
