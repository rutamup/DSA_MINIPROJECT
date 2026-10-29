import React, { useMemo } from 'react';
import type { HuffmanNodeData } from '../types/huffman';

interface HuffmanTreeVisualizerProps {
  tree: HuffmanNodeData | null;
  highlightedSymbol: string | null;
  onHoverSymbol?: (symbol: string | null) => void;
  isSingleChar?: boolean;
}

interface RenderNode {
  data: HuffmanNodeData;
  x: number;
  y: number;
  isLeaf: boolean;
  pathFromRoot: string;
}

interface RenderEdge {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  label: '0' | '1';
  isHighlighted: boolean;
}

export const HuffmanTreeVisualizer: React.FC<HuffmanTreeVisualizerProps> = ({
  tree,
  highlightedSymbol,
  onHoverSymbol,
}) => {
  if (!tree) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        No tree data to render. Enter some text above.
      </div>
    );
  }

  // Pre-calculate positions using tree layout
  const { nodes, edges, width, height } = useMemo(() => {
    const calculatedNodes: RenderNode[] = [];
    const calculatedEdges: RenderEdge[] = [];

    // Calculate depth and leaf positions
    let leafCounter = 0;
    const leafXMap = new Map<number, number>();

    // First pass: assign leaf X coordinates based on in-order traversal
    const assignLeafPositions = (node: HuffmanNodeData | null) => {
      if (!node) return;
      if (node.isLeaf) {
        leafXMap.set(node.id, leafCounter++);
        return;
      }
      assignLeafPositions(node.left);
      assignLeafPositions(node.right);
    };

    assignLeafPositions(tree);

    // If single leaf
    if (leafCounter === 0 && tree.isLeaf) {
      leafXMap.set(tree.id, 0);
      leafCounter = 1;
    }

    const nodeSpacingX = Math.max(50, Math.min(80, 800 / Math.max(leafCounter, 1)));
    const nodeSpacingY = 70;
    const totalWidth = Math.max(400, leafCounter * nodeSpacingX + 100);

    // Second pass: compute X and Y coordinates
    const layout = (
      node: HuffmanNodeData | null,
      depth: number,
      path: string
    ): { x: number; y: number } => {
      if (!node) return { x: 0, y: 0 };

      const y = 45 + depth * nodeSpacingY;
      let x = 0;

      if (node.isLeaf) {
        const leafIndex = leafXMap.get(node.id) ?? 0;
        x = 50 + leafIndex * nodeSpacingX;
      } else {
        const leftPos = layout(node.left, depth + 1, path + '0');
        const rightPos = layout(node.right, depth + 1, path + '1');

        if (node.left && node.right) {
          x = (leftPos.x + rightPos.x) / 2;
        } else if (node.left) {
          x = leftPos.x;
        } else if (node.right) {
          x = rightPos.x;
        }

        // Add edges
        if (node.left) {
          calculatedEdges.push({
            fromX: x,
            fromY: y,
            toX: leftPos.x,
            toY: leftPos.y,
            label: '0',
            isHighlighted: false,
          });
        }
        if (node.right) {
          calculatedEdges.push({
            fromX: x,
            fromY: y,
            toX: rightPos.x,
            toY: rightPos.y,
            label: '1',
            isHighlighted: false,
          });
        }
      }

      calculatedNodes.push({
        data: node,
        x,
        y,
        isLeaf: node.isLeaf,
        pathFromRoot: path,
      });

      return { x, y };
    };

    layout(tree, 0, '');

    // Max height calculation
    let maxY = 150;
    for (const n of calculatedNodes) {
      if (n.y > maxY) maxY = n.y;
    }

    return {
      nodes: calculatedNodes,
      edges: calculatedEdges,
      width: totalWidth,
      height: maxY + 60,
    };
  }, [tree]);

  // Check which nodes and edges are on the highlighted path
  const highlightedNodeIds = useMemo(() => {
    const ids = new Set<number>();
    if (!highlightedSymbol) return ids;

    // Find the leaf with matching symbol
    const targetLeaf = nodes.find((n) => n.isLeaf && n.data.symbol === highlightedSymbol);
    if (!targetLeaf) return ids;

    // Follow path from root down
    const path = targetLeaf.pathFromRoot;
    let curr: HuffmanNodeData | null = tree;
    if (curr) ids.add(curr.id);

    for (let i = 0; i < path.length; i++) {
      if (!curr) break;
      curr = path[i] === '0' ? curr.left : curr.right;
      if (curr) ids.add(curr.id);
    }

    return ids;
  }, [nodes, tree, highlightedSymbol]);

  return (
    <div className="w-full overflow-x-auto bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-inner">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-emerald-300" />
            <span>Leaf node (char : freq)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 border border-indigo-400" />
            <span>Internal node (sum freq)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-mono font-bold">0 / 1</span>
            <span>Binary branch</span>
          </div>
        </div>
        {highlightedSymbol && (
          <span className="text-emerald-400 font-medium">
            Highlighting: <strong className="text-white">'{highlightedSymbol}'</strong>
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[500px] h-auto select-none"
        style={{ minHeight: '320px', maxHeight: '550px' }}
      >
        <defs>
          <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Draw Edges */}
        {edges.map((edge, idx) => {
          const midX = (edge.fromX + edge.toX) / 2;
          const midY = (edge.fromY + edge.toY) / 2;

          return (
            <g key={`edge-${idx}`}>
              <line
                x1={edge.fromX}
                y1={edge.fromY}
                x2={edge.toX}
                y2={edge.toY}
                stroke="#475569"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Edge label pill */}
              <circle cx={midX} cy={midY - 2} r="9" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              <text
                x={midX}
                y={midY + 2}
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="10"
                fontFamily="ui-monospace, monospace"
                fontWeight="bold"
              >
                {edge.label}
              </text>
            </g>
          );
        })}

        {/* Draw Nodes */}
        {nodes.map((node) => {
          const isHighlighted = highlightedNodeIds.has(node.data.id);
          const isTargetLeaf = isHighlighted && node.isLeaf;

          let displayChar = node.data.symbol;
          if (displayChar === ' ') displayChar = '␣';
          else if (displayChar === '\n') displayChar = '↵';

          return (
            <g
              key={`node-${node.data.id}`}
              className="cursor-pointer transition-transform duration-150"
              onMouseEnter={() => node.isLeaf && onHoverSymbol?.(node.data.symbol)}
              onMouseLeave={() => node.isLeaf && onHoverSymbol?.(null)}
            >
              {node.isLeaf ? (
                // Leaf Node
                <>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isTargetLeaf ? 22 : 19}
                    fill={isTargetLeaf ? '#059669' : '#047857'}
                    stroke={isTargetLeaf ? '#34d399' : '#10b981'}
                    strokeWidth={isTargetLeaf ? 3 : 2}
                    filter={isTargetLeaf ? 'url(#nodeGlow)' : undefined}
                  />
                  {/* Symbol */}
                  <text
                    x={node.x}
                    y={node.y - 3}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={displayChar && displayChar.length > 1 ? '10' : '13'}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {displayChar}
                  </text>
                  {/* Frequency badge below */}
                  <text
                    x={node.x}
                    y={node.y + 10}
                    textAnchor="middle"
                    fill="#a7f3d0"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {node.data.freq}
                  </text>
                </>
              ) : (
                // Internal Node
                <>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isHighlighted ? 18 : 16}
                    fill={isHighlighted ? '#4338ca' : '#1e1b4b'}
                    stroke={isHighlighted ? '#818cf8' : '#6366f1'}
                    strokeWidth={isHighlighted ? 2.5 : 1.5}
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill="#e0e7ff"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {node.data.freq}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
