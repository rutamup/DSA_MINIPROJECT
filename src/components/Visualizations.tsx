import React, { useState } from 'react';
import type { SymbolTableEntry, HuffmanMetrics, HuffmanNodeData } from '../types/huffman';
import { HuffmanTreeVisualizer } from './HuffmanTreeVisualizer';
import { BarChart3, GitFork, Activity } from 'lucide-react';

interface VisualizationsProps {
  tree: HuffmanNodeData | null;
  tableData: SymbolTableEntry[];
  metrics: HuffmanMetrics;
  highlightedSymbol: string | null;
  setHighlightedSymbol: (sym: string | null) => void;
  isSingleChar: boolean;
}

export const Visualizations: React.FC<VisualizationsProps> = ({
  tree,
  tableData,
  metrics,
  highlightedSymbol,
  setHighlightedSymbol,
  isSingleChar,
}) => {
  const [activeTab, setActiveTab] = useState<'tree' | 'frequencies' | 'comparison'>('tree');

  if (tableData.length === 0) return null;

  // Max frequency for bar scaling
  const maxFreq = Math.max(...tableData.map((d) => d.frequency), 1);
  const maxCodeLen = Math.max(...tableData.map((d) => d.codeLength), 1);

  // For Bit comparison chart
  const maxBits = Math.max(metrics.originalBits, metrics.fixedLengthTotalBits, metrics.compressedBits, 1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm my-6">
      {/* Navigation tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Visualizations & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive tree layout and symbol distribution charts
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('tree')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'tree'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            Huffman Tree Diagram
          </button>
          <button
            onClick={() => setActiveTab('frequencies')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'frequencies'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Frequency & Code Lengths
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'comparison'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Bit Footprint Comparison
          </button>
        </div>
      </div>

      {/* Tab 1: Tree Diagram */}
      {activeTab === 'tree' && (
        <div>
          <HuffmanTreeVisualizer
            tree={tree}
            highlightedSymbol={highlightedSymbol}
            onHoverSymbol={setHighlightedSymbol}
            isSingleChar={isSingleChar}
          />
        </div>
      )}

      {/* Tab 2: Frequency & Code Lengths Charts */}
      {activeTab === 'frequencies' && (
        <div className="space-y-6">
          {/* Chart 1: Symbol Frequencies */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Symbol Occurrences (Frequencies)
              </span>
              <span className="text-xs text-slate-400">Higher count = priority in tree merge</span>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
              {tableData.slice(0, 15).map((entry) => {
                const widthPercent = (entry.frequency / maxFreq) * 100;
                const isHl = highlightedSymbol === entry.symbol;

                return (
                  <div
                    key={entry.symbol}
                    onMouseEnter={() => setHighlightedSymbol(entry.symbol)}
                    onMouseLeave={() => setHighlightedSymbol(null)}
                    className={`flex items-center gap-3 text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isHl ? 'bg-indigo-50 dark:bg-indigo-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="w-16 font-mono font-bold text-slate-700 dark:text-slate-300 truncate">
                      {entry.displaySymbol}
                    </span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-5 rounded-md overflow-hidden relative">
                      <div
                        className="bg-indigo-500 dark:bg-indigo-600 h-full rounded-md transition-all duration-500 flex items-center justify-end px-2"
                        style={{ width: `${Math.max(widthPercent, 5)}%` }}
                      >
                        <span className="text-[10px] text-white font-bold">{entry.frequency}</span>
                      </div>
                    </div>
                    <span className="w-12 text-right text-slate-400 font-mono">
                      {entry.percentage.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
            {tableData.length > 15 && (
              <div className="text-[11px] text-slate-400 mt-2 text-center">
                Showing top 15 of {tableData.length} unique symbols. View full list in the Code Table below.
              </div>
            )}
          </div>

          {/* Chart 2: Code Length per Symbol */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Code Length vs Frequency (Information Principle)
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Frequent symbols get shorter codes
              </span>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
              {tableData.slice(0, 15).map((entry) => {
                const lenPercent = (entry.codeLength / maxCodeLen) * 100;
                const isHl = highlightedSymbol === entry.symbol;

                return (
                  <div
                    key={`len-${entry.symbol}`}
                    onMouseEnter={() => setHighlightedSymbol(entry.symbol)}
                    onMouseLeave={() => setHighlightedSymbol(null)}
                    className={`flex items-center gap-3 text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isHl ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="w-16 font-mono font-bold text-slate-700 dark:text-slate-300 truncate">
                      {entry.displaySymbol}
                    </span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-5 rounded-md overflow-hidden relative">
                      <div
                        className="bg-emerald-500 h-full rounded-md transition-all duration-500 flex items-center justify-end px-2"
                        style={{ width: `${Math.max(lenPercent, 6)}%` }}
                      >
                        <span className="text-[10px] text-white font-bold">{entry.codeLength}b</span>
                      </div>
                    </div>
                    <span className="w-20 text-right text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold truncate">
                      {entry.code}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Footprint Comparison */}
      {activeTab === 'comparison' && (
        <div className="space-y-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total bit cost comparison between uncompressed ASCII/UTF-8 byte baseline, fixed-length block encoding, and optimal Huffman variable-length coding:
          </p>

          <div className="space-y-4 pt-2">
            {/* Original */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Original (8 bits/char)
                </span>
                <span className="font-mono">{metrics.originalBits.toLocaleString()} bits (100%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-7 rounded-xl overflow-hidden p-0.5">
                <div
                  className="bg-blue-500 h-full rounded-lg transition-all duration-700 flex items-center px-3"
                  style={{ width: `${(metrics.originalBits / maxBits) * 100}%` }}
                >
                  <span className="text-white text-xs font-bold font-mono">
                    {metrics.originalBits.toLocaleString()} bits
                  </span>
                </div>
              </div>
            </div>

            {/* Fixed-length */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  Fixed-Length (ceil(log2({metrics.fixedLengthBitsPerChar > 0 ? Math.pow(2, metrics.fixedLengthBitsPerChar) : 1})) = {metrics.fixedLengthBitsPerChar} bits/char)
                </span>
                <span className="font-mono">
                  {metrics.fixedLengthTotalBits.toLocaleString()} bits ({((metrics.fixedLengthTotalBits / (metrics.originalBits || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-7 rounded-xl overflow-hidden p-0.5">
                <div
                  className="bg-purple-500 h-full rounded-lg transition-all duration-700 flex items-center px-3"
                  style={{ width: `${(metrics.fixedLengthTotalBits / maxBits) * 100}%` }}
                >
                  <span className="text-white text-xs font-bold font-mono">
                    {metrics.fixedLengthTotalBits.toLocaleString()} bits
                  </span>
                </div>
              </div>
            </div>

            {/* Huffman */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Optimal Huffman Variable-Length
                </span>
                <span className="font-mono font-bold">
                  {metrics.compressedBits.toLocaleString()} bits ({((metrics.compressedBits / (metrics.originalBits || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-7 rounded-xl overflow-hidden p-0.5">
                <div
                  className="bg-emerald-500 h-full rounded-lg transition-all duration-700 flex items-center px-3"
                  style={{ width: `${(metrics.compressedBits / maxBits) * 100}%` }}
                >
                  <span className="text-white text-xs font-bold font-mono">
                    {metrics.compressedBits.toLocaleString()} bits
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
