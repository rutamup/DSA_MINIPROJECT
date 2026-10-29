import type { HuffmanMetrics } from '../types/huffman';
import { Info, Gauge, BarChart2, Hash, Layers } from 'lucide-react';

interface MetricsDashboardProps {
  metrics: HuffmanMetrics;
  uniqueSymbols: number;
  includeOverhead: boolean;
  setIncludeOverhead: (val: boolean) => void;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  metrics,
  uniqueSymbols,
  includeOverhead,
  setIncludeOverhead,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-indigo-500" />
            Compression & Information Theory Metrics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Theoretical entropy limits vs empirical Huffman efficiency
          </p>
        </div>

        {/* Overhead Toggle with Tooltip */}
        <div className="relative group flex items-center">
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={includeOverhead}
              onChange={(e) => setIncludeOverhead(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>Include Code-Table Overhead</span>
            <Info className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
          </label>
          <div className="absolute right-0 top-full mt-2 hidden group-hover:block w-80 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-20 pointer-events-none">
            <div className="font-bold text-emerald-400 mb-1">Code Table Serialization Overhead</div>
            In practical compression, the decoder must know the code mapping. We estimate overhead as:
            <div className="font-mono bg-slate-800 p-1.5 rounded my-1 text-[11px] text-amber-200">
              8 bits (count) + Σ [8 bits (char) + 5 bits (len) + L bits (code)]
            </div>
            Total overhead: <strong>{metrics.codeTableOverheadBits} bits</strong>.
          </div>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1: Compression Ratio */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {includeOverhead ? 'Effective Ratio' : 'Compression Ratio'}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white my-1 font-mono">
            {includeOverhead
              ? `${metrics.effectiveRatioWithOverhead.toFixed(2)}:1`
              : `${metrics.compressionRatio.toFixed(2)}:1`}
          </div>
          <div className="text-[11px] text-slate-500">
            {includeOverhead ? 'With tree header' : 'Original / Compressed'}
          </div>
        </div>

        {/* Metric 2: Space Savings */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Space Savings
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 my-1 font-mono">
            {includeOverhead
              ? `${metrics.effectiveSavingsWithOverhead.toFixed(1)}%`
              : `${metrics.spaceSavingsPercent.toFixed(1)}%`}
          </div>
          <div className="text-[11px] text-slate-500">
            (1 - compressed / original)
          </div>
        </div>

        {/* Metric 3: Average Code Length */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Avg Code Length
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 my-1 font-mono">
            {metrics.avgCodeLength.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500">
            bits / symbol
          </div>
        </div>

        {/* Metric 4: Shannon Entropy */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Entropy (H)</span>
            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1 rounded">Limit</span>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 my-1 font-mono">
            {metrics.entropy.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500">
            theoretical min bits/sym
          </div>
        </div>

        {/* Metric 5: Coding Efficiency */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Efficiency
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 my-1 font-mono">
            {(metrics.codingEfficiency * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500">
            Entropy / Avg length
          </div>
        </div>

        {/* Metric 6: Redundancy */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Redundancy (R)
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 my-1 font-mono">
            {metrics.redundancy.toFixed(3)}
          </div>
          <div className="text-[11px] text-slate-500">
            L_avg - H (excess bits)
          </div>
        </div>
      </div>

      {/* Secondary Comparison: Fixed-Length vs Huffman */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
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
          <BarChart2 className="w-4 h-4 text-emerald-500" />
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Huffman vs Fixed-length: </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
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
