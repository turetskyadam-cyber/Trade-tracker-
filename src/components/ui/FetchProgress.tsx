'use client';
import { useEffect, useState } from 'react';

interface FetchProgressProps {
  isLoading: boolean;
  stage: string;
}

export function FetchProgress({ isLoading, stage }: FetchProgressProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(0);
      // Animate toward 90% while loading (never hits 100 until done)
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 88) return p;
          return p + (88 - p) * 0.05;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
      const timer = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div
        className="h-[3px] bg-indigo-500 transition-all duration-300 ease-out shadow-[0_0_8px_theme(colors.indigo.500)]"
        style={{ width: `${progress}%` }}
      />
      {stage && isLoading && (
        <div className="absolute top-2 right-4 text-xs text-gray-400 animate-pulse">
          {stage}
        </div>
      )}
    </div>
  );
}
