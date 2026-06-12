import React, { useState, useCallback } from 'react'
import { BinaryTreeNode, Step } from '../../types/step'
import TreeSVG from '../../components/trees/TreeSVG'
import StepPlayer from '../../components/common/StepPlayer'
import PseudocodePanel from '../../components/common/PseudocodePanel'
import ExplanationPanel from '../../components/common/ExplanationPanel'
import { useAppStore } from '../../store/useAppStore'
import { bstInsert, bstSearch, bstDelete, bstInorder, BST_INSERT_PSEUDO, BST_SEARCH_PSEUDO, BST_DELETE_PSEUDO } from './algorithms'

type Operation = 'insertar' | 'buscar' | 'eliminar' | 'ninguna'

const PSEUDOS: Record<Operation, string[]> = {
  insertar: BST_INSERT_PSEUDO,
  buscar: BST_SEARCH_PSEUDO,
  eliminar: BST_DELETE_PSEUDO,
  ninguna: [],
}

export default function BSTPage() {
  const { lastInputs, setLastInput } = useAppStore()
  const [root, setRoot] = useState<BinaryTreeNode | null>(null)
  const [sequenceInput, setSequenceInput] = useState(lastInputs['bst'] || '50, 30, 70, 20, 40, 60, 80')
  const [singleInput, setSingleInput] = useState('')
  const [operation, setOperation] = useState<Operation>('ninguna')
  const [deleteMode, setDeleteMode] = useState<'max-left' | 'min-right'>('max-left')
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  const buildTree = () => {
    const vals = sequenceInput.split(/[\s,]+/).filter(Boolean).map(Number).filter(n => !isNaN(n))
    if (!vals.length) return
    let r: BinaryTreeNode | null = null
    for (const v of vals) {
      const res = bstInsert(r, v)
      r = res.root
    }
    setRoot(r)
    setSteps([])
    setCurrentStep(0)
    setOperation('ninguna')
    setLastInput('bst', sequenceInput)
  }

  const runInsert = () => {
    const val = parseInt(singleInput)
    if (isNaN(val)) return
    const { root: newRoot, steps: newSteps } = bstInsert(root, val)
    setRoot(newRoot)
    setSteps(newSteps)
    setCurrentStep(0)
    setOperation('insertar')
    setIsPlaying(false)
  }

  const runSearch = () => {
    const val = parseInt(singleInput)
    if (isNaN(val) || !root) return
    const newSteps = bstSearch(root, val)
    setSteps(newSteps)
    setCurrentStep(0)
    setOperation('buscar')
    setIsPlaying(false)
  }

  const runDelete = () => {
    const val = parseInt(singleInput)
    if (isNaN(val) || !root) return
    const { root: newRoot, steps: newSteps } = bstDelete(root, val, deleteMode)
    setRoot(newRoot)
    setSteps(newSteps)
    setCurrentStep(0)
    setOperation('eliminar')
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

  const currentStepData = steps[currentStep]
  const inorder = bstInorder(root)
  const currentTree = currentStepData?.treeSnapshot.root ?? root

  return (
    <div className="flex flex-col h-full bg-surface-50 dark:bg-surface-950">
      {/* Header */}
      <div className="border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-6 py-4">
        <h1 className="text-xl font-bold text-surface-900 dark:text-white">Árbol Binario de Búsqueda (ABB)</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">Tema 3 — Inserción, búsqueda y eliminación con los 3 casos</p>
        <div className="flex gap-2 mt-3">
          <input
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={sequenceInput}
            onChange={e => setSequenceInput(e.target.value)}
            placeholder="Secuencia de inserción, ej: 50, 30, 70, 20, 40"
          />
          <button onClick={buildTree} className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
            Construir ABB
          </button>
        </div>
      </div>

      {/* Operations */}
      {root && (
        <div className="border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-6 py-3">
          <div className="flex flex-wrap gap-2 items-center">
            <input
              className="px-3 py-1.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-24"
              value={singleInput}
              onChange={e => setSingleInput(e.target.value)}
              placeholder="Valor"
              onKeyDown={e => e.key === 'Enter' && runInsert()}
            />
            <button onClick={runInsert} className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">+ Insertar</button>
            <button onClick={runSearch} className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">🔍 Buscar</button>
            <div className="flex items-center gap-1">
              <button onClick={runDelete} className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">✕ Eliminar</button>
              <select
                className="px-2 py-1.5 text-xs rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300"
                value={deleteMode}
                onChange={e => setDeleteMode(e.target.value as 'max-left' | 'min-right')}
              >
                <option value="max-left">Máx. izq</option>
                <option value="min-right">Mín. der</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6 space-y-4">
            <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4 min-h-64 flex items-start justify-center">
              <TreeSVG
                root={currentTree}
                highlightedNodes={currentStepData?.highlightedNodes}
                currentNode={currentStepData?.highlightedNodes?.[0]}
              />
            </div>

            {/* Inorder */}
            <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-2">
                Recorrido inorden (prueba de orden)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {inorder.map((v, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-mono font-semibold border border-green-200 dark:border-green-800">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {operation !== 'ninguna' && currentStepData && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 px-4 py-2">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Fase: {currentStepData.phase}</p>
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

        {steps.length > 0 && (
          <div className="w-80 flex flex-col border-l border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
            <div className="flex-1 overflow-hidden p-4 flex flex-col gap-4">
              <div className="flex-1 overflow-hidden">
                <PseudocodePanel
                  lines={PSEUDOS[operation]}
                  highlightedLines={currentStepData?.pseudocodeLines ?? []}
                  title={`ABB: ${operation}`}
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
