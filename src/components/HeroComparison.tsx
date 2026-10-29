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
      <div className="py-8 text-center">
        <Database className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Ready to compress</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">Enter text above to compare the original and encoded bit sizes.</p>
      </div>
    );
  }

  const compressedWidth = metrics.originalBits > 0
    ? Math.min(100, Math.max(2, metrics.compressedBits / metrics.originalBits * 100))
    : 0;

  return (
    <div className="my-6">
      {isSingleChar && (
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs sm:text-sm">
          <strong>Single-symbol input:</strong> the symbol is encoded with one bit per occurrence.
        </div>
      )}

      <div className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x divide-slate-700">
          <div className="px-2 sm:px-3 pb-4 md:pb-0 md:pr-3">
            <div className="h-full px-5 py-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-orange-400" />
                <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-orange-300">Original bits</h3>
              </div>
              <div className="text-4xl font-black text-white tracking-tight">
                <AnimatedCounter value={metrics.originalBits} />
                <span className="text-base font-semibold text-slate-400 ml-2">bits</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">{charCount.toLocaleString()} characters • {(metrics.originalBits / 8).toFixed(1)} bytes</p>
              <div className="mt-5 h-3 rounded-full bg-slate-700 overflow-hidden"><div className="h-full bg-orange-400 rounded-full" style={{ width: '100%' }} /></div>
            </div>
          </div>

          <div className="px-2 sm:px-3 py-4 md:py-0">
            <div className="h-full px-5 py-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-blue-400" />
                <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-blue-300">Huffman encoded bits</h3>
              </div>
              <div className="text-4xl font-black text-white tracking-tight">
                <AnimatedCounter value={metrics.compressedBits} />
                <span className="text-base font-semibold text-slate-400 ml-2">bits</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">Average {metrics.avgCodeLength.toFixed(2)} bits/symbol • {(metrics.compressedBits / 8).toFixed(1)} bytes</p>
              <div className="mt-5 h-3 rounded-full bg-slate-700 overflow-hidden"><div className="h-full bg-blue-400 rounded-full transition-all duration-700" style={{ width: compressedWidth + '%' }} /></div>
            </div>
          </div>

          <div className="px-2 sm:px-3 pt-4 md:pt-0">
            <div className="h-full px-5 py-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-amber-300">Bits saved</h3>
              </div>
              <div className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <Zap className="w-7 h-7 text-amber-400" />
                {metrics.bitsSaved >= 0 ? '+' : ''}<AnimatedCounter value={metrics.bitsSaved} />
              </div>
              <p className="text-xs text-slate-300 mt-2">{metrics.spaceSavingsPercent.toFixed(1)}% saved • {metrics.compressionRatio.toFixed(2)}x ratio</p>
              <div className="mt-5 h-3 rounded-full bg-slate-700 overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: Math.max(0, Math.min(100, metrics.spaceSavingsPercent)) + '%' }} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
