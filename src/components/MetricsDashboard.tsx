import type { HuffmanMetrics } from '../types/huffman';
import { Gauge, BarChart2, Hash, Layers } from 'lucide-react';

interface MetricsDashboardProps {
  metrics: HuffmanMetrics;
  uniqueSymbols: number;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  metrics,
  uniqueSymbols,
}) => {
  return (
    <div className="py-8 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-rose-600" />
            Compression & Information Theory Metrics
          </h2>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1: Compression Ratio */}
        <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 shadow-lg shadow-slate-950/10 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Compression Ratio
          </div>
          <div className="text-2xl font-black text-white my-1 font-mono">
            {metrics.compressionRatio.toFixed(2)}:1
          </div>
          <div className="text-[11px] text-slate-400">
            Original / Compressed
          </div>
        </div>

        {/* Metric 2: Space Savings */}
        <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 shadow-lg shadow-slate-950/10 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Space Savings
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 my-1 font-mono">
            {metrics.spaceSavingsPercent.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400">
            (1 - compressed / original)
          </div>
        </div>

        {/* Metric 3: Average Code Length */}
        <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 shadow-lg shadow-slate-950/10 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Avg Code Length
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 my-1 font-mono">
            {metrics.avgCodeLength.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400">
            bits / symbol
          </div>
        </div>

      </div>

      {/* Secondary Comparison: Fixed-Length vs Huffman */}
      <div className="mt-4 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50">
          <Hash className="w-4 h-4 text-slate-400" />
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Unique Symbols: </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{uniqueSymbols}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50">
          <Layers className="w-4 h-4 text-slate-400" />
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Fixed-Length Code: </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {metrics.fixedLengthBitsPerChar} bits/char
            </span>
            <span className="text-slate-400 ml-1">({metrics.fixedLengthTotalBits} bits)</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50">
          <BarChart2 className="w-4 h-4 text-blue-500" />
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Huffman vs Fixed-length: </span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {metrics.fixedLengthTotalBits > 0
                ? `${(((metrics.fixedLengthTotalBits - metrics.compressedBits) / metrics.fixedLengthTotalBits) * 100).toFixed(1)}% tighter`
                : '0%'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
