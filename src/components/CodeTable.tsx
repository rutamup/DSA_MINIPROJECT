import React, { useState, useMemo } from 'react';
import type { SymbolTableEntry } from '../types/huffman';
import { Table, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

interface CodeTableProps {
  entries: SymbolTableEntry[];
  highlightedSymbol: string | null;
  onHoverSymbol: (sym: string | null) => void;
}

type SortField = 'symbol' | 'frequency' | 'percentage' | 'codeLength' | 'totalBits';
type SortDirection = 'asc' | 'desc';

export const CodeTable: React.FC<CodeTableProps> = ({
  entries,
  highlightedSymbol,
  onHoverSymbol,
}) => {
  const [sortField, setSortField] = useState<SortField>('frequency');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'symbol') {
        comparison = a.symbol.localeCompare(b.symbol);
      } else {
        comparison = (a[sortField] as number) - (b[sortField] as number);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [entries, sortField, sortDirection]);

  if (entries.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-500" />
            Symbol Codebook Table
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click table columns to sort. Hover any row to trace its path in the tree diagram.
          </p>
        </div>
        <div className="text-xs text-slate-400">
          Total Symbols: <strong className="text-slate-700 dark:text-slate-200">{entries.length}</strong>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-850/80 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th
                onClick={() => handleSort('symbol')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Symbol</span>
                  {sortField === 'symbol' ? (
                    sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-indigo-500" /> : <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('frequency')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Frequency</span>
                  {sortField === 'frequency' ? (
                    sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-indigo-500" /> : <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('percentage')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Weight (%)</span>
                  {sortField === 'percentage' ? (
                    sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-indigo-500" /> : <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>
              <th className="py-3 px-4">
                <span>Huffman Prefix Code</span>
              </th>
              <th
                onClick={() => handleSort('codeLength')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Code Length</span>
                  {sortField === 'codeLength' ? (
                    sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-indigo-500" /> : <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('totalBits')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Bits Contributed</span>
                  {sortField === 'totalBits' ? (
                    sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-indigo-500" /> : <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedEntries.map((row) => {
              const isHl = highlightedSymbol === row.symbol;

              return (
                <tr
                  key={row.symbol}
                  onMouseEnter={() => onHoverSymbol(row.symbol)}
                  onMouseLeave={() => onHoverSymbol(null)}
                  className={`transition-colors cursor-pointer ${
                    isHl
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <td className="py-2.5 px-4 font-mono font-bold flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {row.displaySymbol}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ASCII #{row.charCode}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold">
                    {row.frequency.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                    {row.percentage.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                    {row.code}
                  </td>
                  <td className="py-2.5 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                      {row.codeLength} {row.codeLength === 1 ? 'bit' : 'bits'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-right font-semibold text-slate-900 dark:text-white">
                    {row.totalBits.toLocaleString()} b
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
