import React, { useState, useCallback } from 'react'
import { Step } from '../../types/step'
import TreeSVG from '../../components/trees/TreeSVG'
import StepPlayer from '../../components/common/StepPlayer'
import PseudocodePanel from '../../components/common/PseudocodePanel'
import ExplanationPanel from '../../components/common/ExplanationPanel'
import { useAppStore } from '../../store/useAppStore'
import { AVLNode, avlInsert, avlFromSequence, AVL_INSERT_PSEUDO, RotationType } from './algorithms'
import { bstInsert } from '../BST/algorithms'
import { BinaryTreeNode } from '../../types/step'

const ROTATION_TABLE = [
  { pivotEq: '+2', childEq: '+1', rotation: 'Simple Izquierda (I)', id: 'SI' },
  { pivotEq: '+2', childEq: '−1', rotation: 'Doble Der-Izq (DI)',  id: 'DDI' },
  { pivotEq: '−2', childEq: '−1', rotation: 'Simple Derecha (D)',  id: 'SD' },
  { pivotEq: '−2', childEq: '+1', rotation: 'Doble Izq-Der (ID)',  id: 'DID' },
]

export default function AVLPage() {
  const { lastInputs, setLastInput } = useAppStore()
  const [avlRoot, setAvlRoot] = useState<AVLNode | null>(null)
  const [bstRoot, setBstRoot] = useState<BinaryTreeNode | null>(null)
  const [sequenceInput, setSequenceInput] = useState(lastInputs['avl'] || '40, 20, 60, 10, 30, 50, 70, 45')
  const [singleInput, setSingleInput] = useState('')
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [lastRotation, setLastRotation] = useState<RotationType>('none')
  const [lastPivot, setLastPivot] = useState<number | string | undefined>(undefined)
  const [compareMode, setCompareMode] = useState(false)

  const buildFromSequence = () => {
    const vals = sequenceInput.split(/[\s,]+/).filter(Boolean).map(Number).filter(n => !isNaN(n))
    if (!vals.length) return
    let avl: AVLNode | null = null
    for (const v of vals) {
      avl = avlInsert(avl, v).root
    }
    setAvlRoot(avl)
    // Build BST for comparison
    let bst: BinaryTreeNode | null = null
    for (const v of vals) {
      bst = bstInsert(bst, v).root
    }
    setBstRoot(bst)
    setSteps([])
    setCurrentStep(0)
    setLastInput('avl', sequenceInput)
    setLastRotation('none')
    setLastPivot(undefined)
  }

  const insertSingle = () => {
    const val = parseInt(singleInput)
    if (isNaN(val)) return
    const result = avlInsert(avlRoot, val)
    setAvlRoot(result.root)
    setBstRoot(bstInsert(bstRoot, val).root)
    setSteps(result.steps)
    setCurrentStep(0)
    setIsPlaying(false)
    setLastRotation(result.rotationApplied)
    setLastPivot(result.pivotValue)
    setSingleInput('')
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
  const currentTree = (currentStepData?.treeSnapshot.root as AVLNode | null) ?? avlRoot

  // Determine active rotation for table highlight
  const activeRotation = currentStepData?.extra?.rotation as string | undefined

  const pivotNodes = currentStepData?.phase?.toLowerCase().includes('pivote')
    ? currentStepData.highlightedNodes?.slice(0, 1) ?? []
    : []

  return (
    <div className="flex flex-col h-full bg-surface-50 dark:bg-surface-950">
      {/* Header */}
      <div className="border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-white">Árbol AVL ⭐</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">Tema 3 — Factores de equilibrio, pivote y rotaciones animadas</p>
          </div>
          <button
            onClick={() => setCompareMode(c => !c)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${compareMode ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300'}`}
          >
            {compareMode ? '▣ Modo comparación ON' : '◫ Comparar con ABB'}
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <input
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={sequenceInput}
            onChange={e => setSequenceInput(e.target.value)}
            placeholder="Secuencia, ej: 40, 20, 60, 10, 30, 50, 70"
          />
          <button onClick={buildFromSequence} className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
            Construir AVL
          </button>
        </div>
        {avlRoot && (
          <div className="flex gap-2 mt-2">
            <input
              className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-28"
              value={singleInput}
              onChange={e => setSingleInput(e.target.value)}
              placeholder="Insertar"
              onKeyDown={e => e.key === 'Enter' && insertSingle()}
            />
            <button onClick={insertSingle} className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
              + Insertar
            </button>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tree area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {compareMode && avlRoot && bstRoot ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-2">ABB sin reequilibrar</p>
                  <TreeSVG root={bstRoot} />
                </div>
                <div className="bg-white dark:bg-surface-900 rounded-xl border border-primary-200 dark:border-primary-800 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400 mb-2">AVL equilibrado</p>
                  <TreeSVG root={avlRoot} showBalance />
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4 min-h-64 flex items-start justify-center">
                <TreeSVG
                  root={currentTree}
                  highlightedNodes={currentStepData?.highlightedNodes}
                  pivotNodes={pivotNodes}
                  showBalance
                />
              </div>
            )}

            {/* Rotation table */}
            <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-3">
                Tabla de rotaciones AVL
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-700">
                    <th className="text-left pb-2 text-xs text-surface-500 dark:text-surface-400 font-medium">eq(Pivote)</th>
                    <th className="text-left pb-2 text-xs text-surface-500 dark:text-surface-400 font-medium">eq(Hijo)</th>
                    <th className="text-left pb-2 text-xs text-surface-500 dark:text-surface-400 font-medium">Rotación</th>
                  </tr>
                </thead>
                <tbody>
                  {ROTATION_TABLE.map(row => {
                    const isActive = activeRotation === row.id ||
                      (lastRotation === row.id && steps.length === 0)
                    return (
                      <tr key={row.id} className={`border-b border-surface-100 dark:border-surface-800 transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                        <td className={`py-1.5 font-mono font-bold ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-surface-700 dark:text-surface-300'}`}>{row.pivotEq}</td>
                        <td className={`py-1.5 font-mono font-bold ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-surface-700 dark:text-surface-300'}`}>{row.childEq}</td>
                        <td className={`py-1.5 ${isActive ? 'text-primary-700 dark:text-primary-300 font-semibold' : 'text-surface-600 dark:text-surface-400'}`}>
                          {isActive && <span className="mr-1">→</span>}{row.rotation}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            {lastRotation !== 'none' && (
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800 p-4">
                <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 uppercase tracking-wide mb-1">Resumen última operación</p>
                <p className="text-sm text-primary-800 dark:text-primary-300">
                  Pivote en <strong>{lastPivot}</strong> → Rotación aplicada: <strong>{lastRotation}</strong>
                </p>
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
                  lines={AVL_INSERT_PSEUDO}
                  highlightedLines={currentStepData?.pseudocodeLines ?? []}
                  title="AVL: insertar"
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
