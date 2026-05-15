'use client';
import { useEffect, useRef } from 'react';
import type { NormalizedTrade } from '@/types/trade';
import { TradeList } from './TradeList';

function formatDate(dateKey: string) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatPnL(pnl: number) {
  const sign = pnl >= 0 ? '+' : '';
  return `${sign}$${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface TradePanelProps {
  dateKey: string | null;
  trades: NormalizedTrade[];
  dayPnL: number;
  onClose: () => void;
}

export function TradePanel({ dateKey, trades, dayPnL, onClose }: TradePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isOpen = dateKey !== null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black transition-opacity duration-250 ${
          isOpen ? 'opacity-40 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 bottom-0 z-40 w-[360px] max-w-[92vw] bg-gray-950 border-l border-gray-800 flex flex-col shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          transitionTimingFunction: isOpen
            ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'cubic-bezier(0.4, 0, 1, 1)',
        }}
        aria-modal={isOpen}
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">
              Trading session
            </p>
            <h3 className="text-base font-bold text-white">
              {dateKey ? formatDate(dateKey) : ''}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-lg font-bold tabular-nums ${
                dayPnL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {dateKey ? formatPnL(dayPnL) : ''}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all duration-150"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Trade list */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {dateKey && <TradeList trades={trades} />}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-600 text-center">
          {trades.length} trade{trades.length !== 1 ? 's' : ''}
          {trades.length > 0 && ' · click elsewhere to close'}
        </div>
      </div>
    </>
  );
}
