import React from 'react';
import type { HuffmanMetrics } from '../types/huffman';
import { AnimatedCounter } from './AnimatedCounter';
import { Zap, Database } from 'lucide-react';

interface HeroComparisonProps {
  metrics: HuffmanMetrics;
  charCount: number;
  empty: boolean;
  isSingleChar: boolean;
}

export const HeroComparison: React.FC<HeroComparisonProps> = ({
  metrics,
  charCount,
  empty,
  isSingleChar,
}) => {
  if (empty) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center my-6">
        <Database className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Ready to compress</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
          Enter text above or click any sample to see side-by-side Huffman bit encoding in real-time.
        </p>
      </div>
    );
  }

  // Calculate percentage width for visual bars
  const originalWidthPercent = 100;
  const huffmanWidthPercent = metrics.originalBits > 0
    ? Math.min(100, Math.max(2, (metrics.compressedBits / metrics.originalBits) * 100))
    : 0;

  const isSaving = metrics.bitsSaved >= 0;

  return (
    <div className="my-6">
      {/* Degenerate case alert if single unique character */}
      {isSingleChar && (
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs sm:text-sm flex items-start gap-2.5">
          <span className="font-bold text-amber-600 dark:text-amber-400 text-base leading-none">ℹ</span>
          <div>
            <strong>Degenerate Case: Single Unique Character.</strong> In accordance with the algorithm specification, all occurrences are assigned code <code className="bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono text-xs font-bold">"0"</code> (1 bit per symbol).
          </div>
        </div>
      )}

      {/* Main Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Card: Original Size */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-900/50 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <h3 className="font-bold text-sm tracking-wide uppercase text-blue-600 dark:text-blue-400">
                  Original (Uncompressed)
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
                8 bits/char
              </span>
            </div>

            <div className="my-3">
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                <AnimatedCounter value={metrics.originalBits} />
                <span className="text-base sm:text-lg font-semibold text-slate-400 ml-2">bits</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                <span>{charCount.toLocaleString()} {charCount === 1 ? 'character' : 'characters'}</span>
                <span>•</span>
                <span>{(metrics.originalBits / 8).toFixed(1)} bytes</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
              <span>Standard Baseline</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${originalWidthPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center Indicator: Bits Saved & Savings */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 dark:from-slate-800 dark:to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-700/50">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 mb-2">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 text-center">
            Bits Saved
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight my-1 text-center">
            {isSaving ? '+' : ''}
            <AnimatedCounter value={metrics.bitsSaved} />
          </div>
          <div className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 mt-1 border border-emerald-500/30">
            {metrics.spaceSavingsPercent.toFixed(1)}% Saved
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <span>{metrics.compressionRatio.toFixed(2)}x</span>
            <span className="text-slate-500">ratio</span>
          </div>
        </div>

        {/* Right Card: Huffman Encoded */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-900/50 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-sm tracking-wide uppercase text-emerald-600 dark:text-emerald-400">
                  Huffman Encoded
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300">
                Variable-length prefix code
              </span>
            </div>

            <div className="my-3">
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                <AnimatedCounter value={metrics.compressedBits} />
                <span className="text-base sm:text-lg font-semibold text-slate-400 ml-2">bits</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                <span>avg {metrics.avgCodeLength.toFixed(2)} bits/symbol</span>
                <span>•</span>
                <span>{(metrics.compressedBits / 8).toFixed(1)} bytes</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
              <span>Relative Footprint</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {((metrics.compressedBits / (metrics.originalBits || 1)) * 100).toFixed(1)}% of original
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${huffmanWidthPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
