import React, { useState, useCallback } from 'react'
import { BinaryTreeNode, Step } from '../../types/step'
import TreeSVG from '../../components/trees/TreeSVG'
import StepPlayer from '../../components/common/StepPlayer'
import PseudocodePanel from '../../components/common/PseudocodePanel'
import ExplanationPanel from '../../components/common/ExplanationPanel'
import { useAppStore } from '../../store/useAppStore'
import {
  fromLevelArray, newId, snapshot,
  generatePreorderSteps, generateInorderSteps,
  generatePostorderSteps, generateBreadthSteps,
  generateFrontierSteps,
  computeHeights, computeLevels,
  PREORDER_PSEUDO, INORDER_PSEUDO, POSTORDER_PSEUDO, BREADTH_PSEUDO,
  getFrontier,
} from './algorithms'

type TraversalType = 'preorden' | 'inorden' | 'postorden' | 'anchura' | 'frontera' | 'ninguno'

const PSEUDOS: Record<TraversalType, string[]> = {
  preorden: PREORDER_PSEUDO,
  inorden: INORDER_PSEUDO,
  postorden: POSTORDER_PSEUDO,
  anchura: BREADTH_PSEUDO,
  frontera: ['// Recorrido por subárboles', '// Si nodo es hoja → añadir a frontera', '// Si no → recurrir en hijos'],
  ninguno: [],
}

export default function BinaryTreePage() {
  const { lastInputs, setLastInput } = useAppStore()

  const [root, setRoot] = useState<BinaryTreeNode | null>(null)
  const [inputValue, setInputValue] = useState(lastInputs['binarytree'] || '8, 4, 12, 2, 6, 10, 14')
  const [buildMode, setBuildMode] = useState<'array' | 'manual'>('array')

  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [traversal, setTraversal] = useState<TraversalType>('ninguno')

  // Manual build state
  const [manualInput, setManualInput] = useState('')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [addSide, setAddSide] = useState<'left' | 'right'>('left')

  const buildFromArray = () => {
    const parts = inputValue.split(/[\s,]+/).filter(Boolean).map(Number).filter(n => !isNaN(n))
    if (parts.length === 0) return
    const newRoot = fromLevelArray(parts)
    setRoot(newRoot)
    setSteps([])
    setCurrentStep(0)
    setTraversal('ninguno')
    setLastInput('binarytree', inputValue)
  }

  const runTraversal = (type: TraversalType) => {
    if (!root) return
    setTraversal(type)
    let newSteps: Step[] = []
    switch (type) {
      case 'preorden': newSteps = generatePreorderSteps(root); break
      case 'inorden': newSteps = generateInorderSteps(root); break
      case 'postorden': newSteps = generatePostorderSteps(root); break
      case 'anchura': newSteps = generateBreadthSteps(root); break
      case 'frontera': newSteps = generateFrontierSteps(root); break
    }
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const next = useCallback(() => {
    setCurrentStep(s => {
      if (s >= steps.length - 1) { setIsPlaying(false); return s }
      return s + 1
    })
  }, [steps.length])

  const prev = () => setCurrentStep(s => Math.max(0, s - 1))
  const reset = () => { setCurrentStep(0); setIsPlaying(false) }
  const seek = (n: number) => setCurrentStep(n)

  const currentStepData = steps[currentStep]
  const pseudo = PSEUDOS[traversal]

  const heights = computeHeights(root)
  const levels = computeLevels(root)
  const frontier = root ? getFrontier(root) : []

  // Add node manually
  const addNode = () => {
    const val = parseInt(manualInput)
    if (isNaN(val)) return
    const newNode: BinaryTreeNode = { id: newId(), value: val }

    if (!root) {
      setRoot(newNode)
      setManualInput('')
      return
    }
    if (!selectedNodeId) return

    function insert(node: BinaryTreeNode | null): BinaryTreeNode | null {
      if (!node) return null
      if (node.id === selectedNodeId) {
        if (addSide === 'left' && !node.left) return { ...node, left: newNode }
        if (addSide === 'right' && !node.right) return { ...node, right: newNode }
        return node
      }
      return { ...node, left: insert(node.left ?? null) ?? undefined, right: insert(node.right ?? null) ?? undefined }
    }

    setRoot(insert(root))
    setManualInput('')
    setSteps([])
    setCurrentStep(0)
  }

  const currentTree = currentStepData?.treeSnapshot.root ?? root
  const highlighted = currentStepData?.highlightedNodes ?? (traversal === 'frontera' ? frontier : [])

  return (
    <div className="flex flex-col h-full bg-surface-50 dark:bg-surface-950">
      {/* Header */}
      <div className="border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-white">Árboles Binarios</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">Tema 2 — Recorridos, frontera, alturas y niveles</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBuildMode('array')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${buildMode === 'array' ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'}`}
            >
              Por array
            </button>
            <button
              onClick={() => setBuildMode('manual')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${buildMode === 'manual' ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'}`}
            >
              Manual
            </button>
          </div>
        </div>

        {/* Build controls */}
        {buildMode === 'array' ? (
          <div className="flex gap-2 mt-3">
            <input
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ej: 8, 4, 12, 2, 6, 10, 14 (niveles de izq a der)"
              onKeyDown={e => e.key === 'Enter' && buildFromArray()}
            />
            <button onClick={buildFromArray} className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
              Construir
            </button>
          </div>
        ) : (
          <div className="flex gap-2 mt-3 flex-wrap">
            <input
              className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-24"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              placeholder="Valor"
            />
            <select
              className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
              value={addSide}
              onChange={e => setAddSide(e.target.value as 'left' | 'right')}
            >
              <option value="left">Hijo izquierdo</option>
              <option value="right">Hijo derecho</option>
            </select>
            <button onClick={addNode} className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
              Añadir nodo
            </button>
            {selectedNodeId && (
              <span className="px-3 py-2 text-sm text-surface-500 dark:text-surface-400">
                Nodo seleccionado activo
              </span>
            )}
            <button onClick={() => { setRoot(null); setSteps([]); setSelectedNodeId(null) }}
              className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Traversal buttons */}
      {root && (
        <div className="border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-6 py-3 flex flex-wrap gap-2">
          <span className="text-sm text-surface-500 dark:text-surface-400 self-center mr-1">Recorrido:</span>
          {(['preorden', 'inorden', 'postorden', 'anchura', 'frontera'] as TraversalType[]).map(t => (
            <button
              key={t}
              onClick={() => runTraversal(t)}
              className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ${
                traversal === t
                  ? 'bg-primary-600 text-white font-semibold'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-primary-100 dark:hover:bg-primary-900/30'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex gap-0 overflow-hidden">
        {/* Left: Tree visualization */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tree SVG */}
          <div className="flex-1 overflow-auto p-6 flex flex-col gap-4">
            <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4 min-h-64 flex items-start justify-center">
              <TreeSVG
                root={currentTree}
                highlightedNodes={highlighted}
                currentNode={currentStepData?.highlightedNodes?.[0]}
                onNodeClick={buildMode === 'manual' ? setSelectedNodeId : undefined}
              />
            </div>

            {/* Traversal result */}
            {steps.length > 0 && currentStepData?.traversalSoFar && (
              <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-2">
                  Resultado del recorrido
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentStepData.traversalSoFar.map((v, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-mono font-semibold">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Queue (for breadth) */}
            {traversal === 'anchura' && steps.length > 0 && currentStepData?.queue !== undefined && (
              <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-2">
                  Cola (FIFO) — frente → final
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-surface-400">frente →</span>
                  {(currentStepData.queue as string[]).length === 0 ? (
                    <span className="text-xs text-surface-400 italic">vacía</span>
                  ) : (
                    (currentStepData.queue as string[]).map((id, i) => {
                      const node = findInTree(currentTree, id)
                      return (
                        <span key={i} className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-mono font-semibold border border-amber-200 dark:border-amber-800">
                          {node?.value ?? id}
                        </span>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {/* Heights & Levels info */}
            {root && traversal === 'ninguno' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-3">Alturas por nodo</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                    {Array.from(heights.entries()).map(([id, h]) => {
                      const node = findInTree(root, id)
                      return (
                        <div key={id} className="flex items-center justify-between text-sm">
                          <span className="font-mono text-surface-700 dark:text-surface-300">{node?.value}</span>
                          <span className="px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-mono">h={h}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-3">Niveles (profundidad)</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                    {Array.from(levels.entries()).map(([id, lvl]) => {
                      const node = findInTree(root, id)
                      return (
                        <div key={id} className="flex items-center justify-between text-sm">
                          <span className="font-mono text-surface-700 dark:text-surface-300">{node?.value}</span>
                          <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-mono">nivel={lvl}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Player */}
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
                onSeek={seek}
              />
            </div>
          )}
        </div>

        {/* Right: Pseudocode + Explanation */}
        {steps.length > 0 && (
          <div className="w-80 flex flex-col border-l border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
            <div className="flex-1 overflow-hidden p-4 flex flex-col gap-4">
              <div className="flex-1 overflow-hidden">
                <PseudocodePanel
                  lines={pseudo}
                  highlightedLines={currentStepData?.pseudocodeLines ?? []}
                  title={`Algoritmo: ${traversal}`}
                />
              </div>
              <div>
                <ExplanationPanel
                  description={currentStepData?.description ?? ''}
                  result={currentStepData?.result as string | null}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function findInTree(root: BinaryTreeNode | null | undefined, id: string): BinaryTreeNode | null {
  if (!root) return null
  if (root.id === id) return root
  return findInTree(root.left, id) || findInTree(root.right, id)
}
