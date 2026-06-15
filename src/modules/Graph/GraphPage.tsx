import React, { useState, useCallback, useMemo } from 'react'
import { Step } from '../../types/step'
import StepPlayer from '../../components/common/StepPlayer'
import PseudocodePanel from '../../components/common/PseudocodePanel'
import ExplanationPanel from '../../components/common/ExplanationPanel'
import { dijkstra, floyd, INF, DijkstraExtra, FloydExtra, DIJKSTRA_PSEUDO, FLOYD_PSEUDO } from './algorithms'

type Operation = 'dijkstra' | 'floyd'

// ── Preset graphs ──────────────────────────────────────────────────────────
const PRESETS: { name: string; labels: string[]; adj: number[][] }[] = [
  {
    name: 'Ejemplo clásico (5 nodos)',
    labels: ['A', 'B', 'C', 'D', 'E'],
    adj: [
      [0, 10, INF, 30, 100],
      [INF, 0, 50, INF, INF],
      [INF, INF, 0, INF, 10],
      [INF, INF, 20, 0, 60],
      [INF, INF, INF, INF, 0],
    ],
  },
  {
    name: 'Grafo simple (4 nodos)',
    labels: ['1', '2', '3', '4'],
    adj: [
      [0, 5, INF, 10],
      [INF, 0, 3, INF],
      [INF, INF, 0, 1],
      [INF, INF, INF, 0],
    ],
  },
  {
    name: 'Grafo bidireccional (4 nodos)',
    labels: ['A', 'B', 'C', 'D'],
    adj: [
      [0, 4, 2, INF],
      [4, 0, 1, 5],
      [2, 1, 0, 8],
      [INF, 5, 8, 0],
    ],
  },
]

// ── GraphSVG ────────────────────────────────────────────────────────────────
interface GraphSVGProps {
  labels: string[]
  adj: number[][]
  highlightedNodes?: string[]
  highlightedEdge?: [number, number]
  visitedNodes?: boolean[]
  dist?: number[]
}

function GraphSVG({ labels, adj, highlightedNodes = [], highlightedEdge, visitedNodes, dist }: GraphSVGProps) {
  const n = labels.length
  const cx = 200
  const cy = 200
  const r = 140
  const nr = 22

  const positions = useMemo(() =>
    labels.map((_, i) => ({
      x: cx + r * Math.cos((2 * Math.PI * i) / n - Math.PI / 2),
      y: cy + r * Math.sin((2 * Math.PI * i) / n - Math.PI / 2),
    })), [n, labels])

  return (
    <svg viewBox="0 0 400 400" width="100%" style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}>
      <defs>
        <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#6d28d9" />
        </marker>
        <marker id="arrowGray" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#64748b" />
        </marker>
        <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#16a34a" />
        </marker>
      </defs>

      {/* Edges */}
      {labels.map((_, i) =>
        labels.map((_, j) => {
          if (i === j) return null
          const w = adj[i][j]
          if (!w || w === INF) return null

          const from = positions[i]
          const to = positions[j]

          // Offset to avoid overlap with reverse edge
          const hasReverse = adj[j]?.[i] && adj[j][i] !== INF
          const dx = to.x - from.x
          const dy = to.y - from.y
          const len = Math.sqrt(dx * dx + dy * dy)
          const ox = hasReverse ? (-dy / len) * 8 : 0
          const oy = hasReverse ? (dx / len) * 8 : 0

          const x1 = from.x + ox
          const y1 = from.y + oy
          const x2 = to.x + ox
          const y2 = to.y + oy

          // Shorten line so arrowhead doesn't overlap node
          const nx = (x2 - x1) / len
          const ny = (y2 - y1) / len
          const ex = x2 - nx * (nr + 8)
          const ey = y2 - ny * (nr + 8)
          const sx = x1 + nx * nr
          const sy = y1 + ny * nr

          const isHighlighted = highlightedEdge?.[0] === i && highlightedEdge?.[1] === j
          const midX = (sx + ex) / 2
          const midY = (sy + ey) / 2

          const color = isHighlighted ? '#6d28d9' : '#64748b'
          const marker = isHighlighted ? 'url(#arrowBlue)' : 'url(#arrowGray)'

          return (
            <g key={`${i}-${j}`}>
              <line
                x1={sx} y1={sy} x2={ex} y2={ey}
                stroke={color}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                markerEnd={marker}
                className="transition-all duration-300"
              />
              <text
                x={midX + ox * 0.5}
                y={midY + oy * 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={11}
                fontWeight="600"
                fill={isHighlighted ? '#7c3aed' : '#94a3b8'}
                fontFamily="'Inter', sans-serif"
              >
                {w}
              </text>
            </g>
          )
        })
      )}

      {/* Nodes */}
      {positions.map(({ x, y }, i) => {
        const label = labels[i]
        const isHighlighted = highlightedNodes.includes(String(i))
        const isVisited = visitedNodes?.[i]
        const d = dist?.[i]

        const fill = isHighlighted ? '#6d28d9' : isVisited ? '#16a34a' : '#334155'
        const stroke = isHighlighted ? '#a78bfa' : isVisited ? '#4ade80' : '#475569'

        return (
          <g key={i} transform={`translate(${x},${y})`}>
            {isHighlighted && (
              <circle r={nr + 6} fill="none" stroke="#7c3aed" strokeWidth={2} opacity={0.4} />
            )}
            <circle r={nr} fill={fill} stroke={stroke} strokeWidth={2} className="transition-all duration-300" />
            <text fill="white" fontSize={13} fontWeight="700" textAnchor="middle" dominantBaseline="middle" fontFamily="'Inter', sans-serif">
              {label}
            </text>
            {d !== undefined && (
              <text
                x={nr + 4}
                y={-nr + 2}
                fill={d === INF ? '#94a3b8' : '#fbbf24'}
                fontSize={10}
                fontWeight="700"
                fontFamily="'Inter', sans-serif"
              >
                {d === INF ? '∞' : d}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function GraphPage() {
  const [preset, setPreset] = useState(0)
  const [labels, setLabels] = useState(PRESETS[0].labels)
  const [adj, setAdj] = useState<number[][]>(PRESETS[0].adj)
  const [source, setSource] = useState(0)
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [operation, setOperation] = useState<Operation>('dijkstra')

  const n = labels.length

  const loadPreset = (idx: number) => {
    const p = PRESETS[idx]
    setPreset(idx)
    setLabels(p.labels)
    setAdj(p.adj.map(r => [...r]))
    setSteps([])
    setCurrentStep(0)
    setSource(0)
  }

  const updateEdge = (i: number, j: number, val: string) => {
    const v = val === '' || val === '∞' ? INF : Number(val)
    if (isNaN(v)) return
    const newAdj = adj.map(r => [...r])
    newAdj[i][j] = v <= 0 && i !== j ? INF : v
    setAdj(newAdj)
  }

  const runDijkstra = () => {
    const result = dijkstra(n, adj, source, labels)
    setSteps(result.steps)
    setCurrentStep(0)
    setIsPlaying(false)
    setOperation('dijkstra')
  }

  const runFloyd = () => {
    const result = floyd(n, adj, labels)
    setSteps(result.steps)
    setCurrentStep(0)
    setIsPlaying(false)
    setOperation('floyd')
  }

  const next = useCallback(() => {
    setCurrentStep(s => {
      if (s >= steps.length - 1) { setIsPlaying(false); return s }
      return s + 1
    })
  }, [steps.length])
  const prev = () => setCurrentStep(s => Math.max(0, s - 1))
  const reset = () => { setCurrentStep(0); setIsPlaying(false) }

  const speedIntervals = [1200, 600, 250]
  React.useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(next, speedIntervals[speed - 1])
    return () => clearInterval(interval)
  }, [isPlaying, speed, next])

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === ' ') { e.preventDefault(); setIsPlaying(p => !p) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next])

  const currentStepData = steps[currentStep]
  const dExtra = operation === 'dijkstra' ? currentStepData?.extra as DijkstraExtra | undefined : undefined
  const fExtra = operation === 'floyd' ? currentStepData?.extra as FloydExtra | undefined : undefined

  const fmt = (v: number) => v === INF ? '∞' : String(v)

  return (
    <div className="flex flex-col h-full bg-surface-50 dark:bg-surface-950">
      {/* Header */}
      <div className="border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-6 py-4">
        <h1 className="text-xl font-bold text-surface-900 dark:text-white">Grafos 🕸️</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">Tema 5 — Dijkstra (tabla de distancias) y Floyd-Warshall (matrices D y A)</p>

        <div className="flex flex-wrap items-center gap-3 mt-3">
          {/* Presets */}
          <div className="flex gap-2">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => loadPreset(i)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${preset === i ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200'}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-2">
          {/* Dijkstra */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-600 dark:text-surface-400">Origen:</span>
            <select
              className="px-3 py-1.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={source}
              onChange={e => setSource(Number(e.target.value))}
            >
              {labels.map((l, i) => <option key={i} value={i}>{l}</option>)}
            </select>
            <button onClick={runDijkstra} className="px-4 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
              ▶ Dijkstra
            </button>
          </div>
          <button onClick={runFloyd} className="px-4 py-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors">
            ▶ Floyd-Warshall
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Adjacency matrix editor */}
              <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-3">
                  Matriz de adyacencia (peso de aristas, 0 o ∞ = sin arista)
                </p>
                <div className="overflow-auto">
                  <table className="text-sm border-collapse">
                    <thead>
                      <tr>
                        <th className="w-8 h-8" />
                        {labels.map((l, j) => (
                          <th key={j} className="w-14 h-8 text-center text-xs font-bold text-primary-600 dark:text-primary-400">{l}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {labels.map((rowL, i) => (
                        <tr key={i}>
                          <td className="w-8 text-center text-xs font-bold text-primary-600 dark:text-primary-400">{rowL}</td>
                          {labels.map((_, j) => (
                            <td key={j} className="p-0.5">
                              <input
                                type="text"
                                className={`w-14 h-8 text-center text-sm rounded border transition-colors focus:outline-none focus:ring-1 focus:ring-primary-500
                                  ${i === j
                                    ? 'bg-surface-100 dark:bg-surface-700 border-surface-200 dark:border-surface-600 text-surface-400 dark:text-surface-500'
                                    : adj[i][j] === INF
                                      ? 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-400 dark:text-surface-500'
                                      : 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-surface-900 dark:text-white'
                                  }`}
                                value={i === j ? '0' : adj[i][j] === INF ? '∞' : String(adj[i][j])}
                                disabled={i === j}
                                onChange={e => updateEdge(i, j, e.target.value)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-surface-400 mt-2">Edita las celdas. ∞ o 0 = sin arista.</p>
              </div>

              {/* Graph SVG */}
              <div className="flex-1 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4 min-w-64">
                <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-3">
                  Grafo dirigido ponderado
                </p>
                <GraphSVG
                  labels={labels}
                  adj={adj}
                  highlightedNodes={currentStepData?.highlightedNodes}
                  highlightedEdge={dExtra?.highlightedEdge}
                  visitedNodes={dExtra?.visited}
                  dist={dExtra?.dist}
                />
              </div>
            </div>

            {/* Dijkstra table */}
            {operation === 'dijkstra' && dExtra && (
              <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-3">
                  Tabla Dijkstra — D (distancia mínima desde {labels[source]})
                </p>
                <div className="overflow-auto">
                  <table className="text-sm border-collapse w-full">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs text-surface-500 font-medium border-b border-surface-200 dark:border-surface-700" />
                        {labels.map((l, i) => (
                          <th key={i} className={`px-3 py-2 text-center text-xs font-bold border-b border-surface-200 dark:border-surface-700 ${dExtra.current === i ? 'text-primary-600 dark:text-primary-400' : 'text-surface-600 dark:text-surface-400'}`}>
                            {l}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-3 py-2 text-xs text-surface-500 dark:text-surface-400 font-medium">D[v]</td>
                        {dExtra.dist.map((d, i) => (
                          <td key={i} className={`px-3 py-2 text-center text-sm font-bold rounded transition-colors ${dExtra.current === i ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : dExtra.visited[i] ? 'text-green-600 dark:text-green-400' : 'text-surface-700 dark:text-surface-300'}`}>
                            {fmt(d)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-xs text-surface-500 dark:text-surface-400 font-medium">Visitado</td>
                        {dExtra.visited.map((v, i) => (
                          <td key={i} className={`px-3 py-2 text-center text-xs ${v ? 'text-green-600 dark:text-green-400 font-bold' : 'text-surface-400'}`}>
                            {v ? '✓' : '—'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-xs text-surface-500 dark:text-surface-400 font-medium">Ant[v]</td>
                        {dExtra.prev.map((p, i) => (
                          <td key={i} className="px-3 py-2 text-center text-xs text-surface-600 dark:text-surface-400">
                            {p !== null ? labels[p] : '—'}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Floyd matrices */}
            {operation === 'floyd' && fExtra && (
              <div className="space-y-4">
                {/* D matrix */}
                <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-3">
                    Matriz D — Distancias mínimas {fExtra.k >= 0 ? `(k=${fExtra.k}, intermedio: ${labels[fExtra.k]})` : '(inicial)'}
                  </p>
                  <div className="overflow-auto">
                    <table className="text-sm border-collapse">
                      <thead>
                        <tr>
                          <th className="w-8 h-8" />
                          {labels.map((l, j) => (
                            <th key={j} className={`w-14 h-8 text-center text-xs font-bold ${fExtra.j === j ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500 dark:text-surface-400'}`}>{l}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {fExtra.D.map((row, i) => (
                          <tr key={i}>
                            <td className={`w-8 text-center text-xs font-bold ${fExtra.i === i ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500 dark:text-surface-400'}`}>{labels[i]}</td>
                            {row.map((v, j) => {
                              const isActive = fExtra.i === i && fExtra.j === j
                              const isK = fExtra.k === i || fExtra.k === j
                              return (
                                <td key={j} className={`w-14 h-8 text-center text-sm font-bold rounded transition-colors
                                  ${isActive && fExtra.updated ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                    isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' :
                                    isK ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400' :
                                    'text-surface-700 dark:text-surface-300'}`}>
                                  {fmt(v)}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* A matrix */}
                <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-3">
                    Matriz A — Siguiente nodo en el camino mínimo
                  </p>
                  <div className="overflow-auto">
                    <table className="text-sm border-collapse">
                      <thead>
                        <tr>
                          <th className="w-8 h-8" />
                          {labels.map((l, j) => (
                            <th key={j} className="w-14 h-8 text-center text-xs font-bold text-surface-500 dark:text-surface-400">{l}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {fExtra.A.map((row, i) => (
                          <tr key={i}>
                            <td className="w-8 text-center text-xs font-bold text-surface-500 dark:text-surface-400">{labels[i]}</td>
                            {row.map((v, j) => {
                              const isActive = fExtra.i === i && fExtra.j === j
                              return (
                                <td key={j} className={`w-14 h-8 text-center text-sm font-medium transition-colors
                                  ${isActive && fExtra.updated ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                    isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' :
                                    'text-surface-600 dark:text-surface-400'}`}>
                                  {v !== null ? labels[v] : '—'}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-surface-400 mt-2">A[i][j] = primer nodo en el camino mínimo de i a j</p>
                </div>
              </div>
            )}
          </div>

          {steps.length > 0 && (
            <div className="p-4 border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
              <StepPlayer
                totalSteps={steps.length}
                currentStep={currentStep}
                isPlaying={isPlaying}
                speed={speed}
                onPrev={prev}
                onNext={next}
                onPlayPause={() => setIsPlaying(p => !p)}
                onReset={reset}
                onSpeedChange={setSpeed}
                onSeek={setCurrentStep}
              />
            </div>
          )}
        </div>

        {/* Right panel */}
        {steps.length > 0 && (
          <div className="w-80 flex flex-col border-l border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
            <div className="flex-1 overflow-hidden p-4 flex flex-col gap-4">
              <div className="flex-1 overflow-hidden">
                <PseudocodePanel
                  lines={operation === 'dijkstra' ? DIJKSTRA_PSEUDO : FLOYD_PSEUDO}
                  highlightedLines={currentStepData?.pseudocodeLines ?? []}
                  title={operation === 'dijkstra' ? 'Dijkstra(G, s)' : 'Floyd-Warshall(G)'}
                />
              </div>
              <ExplanationPanel
                description={currentStepData?.description ?? ''}
                phase={currentStepData?.phase}
                result={currentStepData?.result as string | null}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
