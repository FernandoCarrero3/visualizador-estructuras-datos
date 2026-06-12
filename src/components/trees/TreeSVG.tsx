import React, { useMemo } from 'react'
import { BinaryTreeNode } from '../../types/step'

interface LayoutNode {
  node: BinaryTreeNode
  x: number
  y: number
  id: string
}

interface LayoutEdge {
  from: string
  to: string
  x1: number
  y1: number
  x2: number
  y2: number
}

interface TreeSVGProps {
  root: BinaryTreeNode | null
  highlightedNodes?: string[]
  pivotNodes?: string[]
  currentNode?: string
  showBalance?: boolean
  showLevels?: boolean
  nodeRadius?: number
  levelHeight?: number
  minWidth?: number
  onNodeClick?: (id: string) => void
  className?: string
}

function buildLayout(
  node: BinaryTreeNode | null,
  x: number,
  y: number,
  spread: number,
  levelHeight: number,
  result: { nodes: LayoutNode[]; edges: LayoutEdge[] }
): void {
  if (!node) return
  result.nodes.push({ node, x, y, id: node.id })

  if (node.left) {
    result.edges.push({ from: node.id, to: node.left.id, x1: x, y1: y, x2: x - spread, y2: y + levelHeight })
    buildLayout(node.left, x - spread, y + levelHeight, spread / 2, levelHeight, result)
  }
  if (node.right) {
    result.edges.push({ from: node.id, to: node.right.id, x1: x, y1: y, x2: x + spread, y2: y + levelHeight })
    buildLayout(node.right, x + spread, y + levelHeight, spread / 2, levelHeight, result)
  }
}

function treeDepth(node: BinaryTreeNode | null): number {
  if (!node) return 0
  return 1 + Math.max(treeDepth(node.left ?? null), treeDepth(node.right ?? null))
}

function countNodes(node: BinaryTreeNode | null): number {
  if (!node) return 0
  return 1 + countNodes(node.left ?? null) + countNodes(node.right ?? null)
}

export default function TreeSVG({
  root,
  highlightedNodes = [],
  pivotNodes = [],
  currentNode,
  showBalance = false,
  nodeRadius = 22,
  levelHeight = 60,
  onNodeClick,
  className = '',
}: TreeSVGProps) {
  const layout = useMemo(() => {
    if (!root) return { nodes: [], edges: [] }
    const depth = treeDepth(root)
    const initialSpread = Math.pow(2, depth - 1) * (nodeRadius * 1.4)
    const result = { nodes: [] as LayoutNode[], edges: [] as LayoutEdge[] }
    buildLayout(root, 0, 0, initialSpread, levelHeight, result)
    return result
  }, [root, nodeRadius, levelHeight])

  if (!root) {
    return (
      <div className={`flex items-center justify-center h-40 text-surface-400 dark:text-surface-600 text-sm ${className}`}>
        Árbol vacío
      </div>
    )
  }

  const xs = layout.nodes.map(n => n.x)
  const ys = layout.nodes.map(n => n.y)
  const minX = Math.min(...xs) - nodeRadius * 2
  const maxX = Math.max(...xs) + nodeRadius * 2
  const minY = Math.min(...ys) - nodeRadius * 2
  const maxY = Math.max(...ys) + nodeRadius * 2

  const vw = maxX - minX
  const vh = maxY - minY

  const nodeColor = (node: BinaryTreeNode, isHighlighted: boolean, isPivot: boolean, isCurrent: boolean) => {
    if (node.isNil) return { fill: '#1e293b', stroke: '#475569', text: '#64748b' }
    if (node.color === 'red') {
      if (isPivot) return { fill: '#dc2626', stroke: '#f87171', text: '#fff' }
      if (isCurrent) return { fill: '#ef4444', stroke: '#fca5a5', text: '#fff' }
      if (isHighlighted) return { fill: '#f87171', stroke: '#fca5a5', text: '#fff' }
      return { fill: '#dc2626', stroke: '#b91c1c', text: '#fff' }
    }
    if (isPivot) return { fill: '#f97316', stroke: '#fb923c', text: '#fff' }
    if (isCurrent) return { fill: '#7c3aed', stroke: '#a78bfa', text: '#fff' }
    if (isHighlighted) return { fill: '#6d28d9', stroke: '#a78bfa', text: '#fff' }
    if (node.color === 'black') return { fill: '#1e293b', stroke: '#334155', text: '#e2e8f0' }
    return { fill: '#334155', stroke: '#475569', text: '#e2e8f0' }
  }

  return (
    <div className={`overflow-auto scrollbar-thin ${className}`}>
      <svg
        viewBox={`${minX} ${minY} ${vw} ${vh}`}
        width={vw}
        height={vh}
        style={{ minWidth: Math.max(vw, 200), display: 'block', margin: '0 auto' }}
      >
        {/* Edges */}
        {layout.edges.map((e, i) => (
          <line
            key={i}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke="#475569"
            strokeWidth={1.5}
            className="transition-all duration-300"
          />
        ))}

        {/* Nodes */}
        {layout.nodes.map(({ node, x, y }) => {
          const isHighlighted = highlightedNodes.includes(node.id)
          const isPivot = pivotNodes.includes(node.id)
          const isCurrent = currentNode === node.id
          const colors = nodeColor(node, isHighlighted, isPivot, isCurrent)

          if (node.isNil) {
            return (
              <g key={node.id} transform={`translate(${x},${y})`}>
                <rect
                  x={-8} y={-8} width={16} height={16}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={1}
                  rx={2}
                />
                <text fill={colors.text} fontSize={8} textAnchor="middle" dominantBaseline="middle">
                  NIL
                </text>
              </g>
            )
          }

          const r = nodeRadius
          return (
            <g
              key={node.id}
              transform={`translate(${x},${y})`}
              onClick={() => onNodeClick?.(node.id)}
              className={onNodeClick ? 'cursor-pointer' : ''}
            >
              {(isCurrent || isPivot) && (
                <circle
                  r={r + 6}
                  fill="none"
                  stroke={isPivot ? '#f97316' : '#7c3aed'}
                  strokeWidth={2}
                  opacity={0.4}
                  className="animate-pulse-soft"
                />
              )}
              <circle
                r={r}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={isCurrent || isPivot ? 2.5 : 1.5}
                className="transition-all duration-300"
              />
              <text
                fill={colors.text}
                fontSize={r > 18 ? 13 : 11}
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="'Inter', sans-serif"
              >
                {String(node.value)}
              </text>
              {showBalance && node.balance !== undefined && (
                <text
                  x={r + 4}
                  y={-r + 2}
                  fill={Math.abs(node.balance) >= 2 ? '#f97316' : '#a78bfa'}
                  fontSize={10}
                  fontWeight="700"
                  fontFamily="'Inter', sans-serif"
                >
                  {node.balance > 0 ? `+${node.balance}` : node.balance}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
