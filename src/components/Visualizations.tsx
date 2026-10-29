import React from 'react';
import type { HuffmanNodeData } from '../types/huffman';
import { HuffmanTreeVisualizer } from './HuffmanTreeVisualizer';
import { GitFork } from 'lucide-react';

interface VisualizationsProps {
  tree: HuffmanNodeData | null;
}

export const Visualizations: React.FC<VisualizationsProps> = ({ tree }) => {
  return (
    <div className="py-8 my-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <GitFork className="w-5 h-5 text-rose-500" />
          Huffman Tree Representation
        </h2>
      </div>
      <HuffmanTreeVisualizer tree={tree} highlightedSymbol={null} />
    </div>
  );
};
