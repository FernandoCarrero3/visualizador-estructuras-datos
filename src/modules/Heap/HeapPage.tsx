import React, { useState, useCallback } from 'react'
import { Step } from '../../types/step'
import TreeSVG from '../../components/trees/TreeSVG'
import StepPlayer from '../../components/common/StepPlayer'
import PseudocodePanel from '../../components/common/PseudocodePanel'
import ExplanationPanel from '../../components/common/ExplanationPanel'
import { useAppStore } from '../../store/useAppStore'
import {
  heapInsert, heapExtractMax, heapsort, buildHeap, arrayToTree,
  HEAP_INSERT_PSEUDO, HEAP_FLOAT_PSEUDO, HEAP_SINK_PSEUDO,
  HEAP_EXTRACT_PSEUDO, HEAPSORT_PSEUDO,
} from './algorithms'

type Operation = 'insert' | 'extract' | 'build' | 'heapsort'

const PSEUDO_MAP: Record<Operation, string[]> = {
  insert: HEAP_INSERT_PSEUDO,
  extract: HEAP_EXTRACT_PSEUDO,
  build: HEAP_FLOAT_PSEUDO,
  heapsort: HEAPSORT_PSEUDO,
}

const PSEUDO_TITLES: Record<Operation, string> = {
  insert: 'insertar + flotar',
  extract: 'extraerMáximo + hundir',
  build: 'flotar',
  heapsort: 'heapsort',
}

export default function HeapPage() {
  const { lastInputs, setLastInput } = useAppStore()
  const [heap, setHeap] = useState<number[]>([])
  const [seqInput, setSeqInput] = useState(lastInputs['heap'] || '40, 20, 30, 10, 15, 25, 5')
  const [insertInput, setInsertInput] = useState('')
  const [sortInput, setSortInput] = useState(lastInputs['heapsort'] || '4, 10, 3, 5, 1, 9, 2, 7')
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [operation, setOperation] = useState<Operation>('insert')

  const buildFromSeq = () => {
    const vals = seqInput.split(/[\s,]+/).filter(Boolean).map(Number).filter(n => !isNaN(n))
    if (!vals.length) return
    const result = buildHeap(vals)
    setHeap(result.heap)
    setSteps(result.steps)
    setCurrentStep(0)
    setIsPlaying(false)
    setOperation('build')
    setLastInput('heap', seqInput)
  }

  const doInsert = () => {
    const val = parseInt(insertInput)
    if (isNaN(val)) return
    const result = heapInsert(heap, val)
    setHeap(result.heap)
    setSteps(result.steps)
    setCurrentStep(0)
    setIsPlaying(false)
    setOperation('insert')
    setInsertInput('')
  }

  const doExtract = () => {
    if (!heap.length) return
    const result = heapExtractMax(heap)
    setHeap(result.heap)
    setSteps(result.steps)
    setCurrentStep(0)
    setIsPlaying(false)
    setOperation('extract')
  }

  const doHeapsort = () => {
    const vals = sortInput.split(/[\s,]+/).filter(Boolean).map(Number).filter(n => !isNaN(n))
    if (!vals.length) return
    const result = heapsort(vals)
    setHeap(result.sorted)
    setSteps(result.steps)
    setCurrentStep(0)
    setIsPlaying(false)
    setOperation('heapsort')
    setLastInput('heapsort', sortInput)
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
  const extra = currentStepData?.extra as { array?: number[]; heapSize?: number } | undefined
  const displayArray = extra?.array ?? heap
  const heapSize = extra?.heapSize ?? displayArray.length
  const treeRoot = currentStepData
    ? (currentStepData.treeSnapshot.root)
    : arrayToTree(heap)
  const highlightedNodes = currentStepData?.highlightedNodes ?? []

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

  return (
    <div className="flex flex-col h-full bg-surface-50 dark:bg-surface-950">
      {/* Header */}
      <div className="border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-6 py-4">
        <h1 className="text-xl font-bold text-surface-900 dark:text-white">Montículos y Heapsort 🏔️</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">Tema 6 — Flotar, hundir, representación array+árbol, Heapsort completo</p>

        <div className="flex flex-wrap gap-3 mt-3">
          {/* Build from sequence */}
          <div className="flex gap-2">
            <input
              className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-56"
              value={seqInput}
              onChange={e => setSeqInput(e.target.value)}
              placeholder="Secuencia, ej: 40, 20, 30, 10"
            />
            <button onClick={buildFromSeq} className="px-3 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap">
              Construir montículo
            </button>
          </div>

          {/* Insert */}
          {heap.length > 0 && (
            <div className="flex gap-2">
              <input
                className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-24"
                value={insertInput}
                onChange={e => setInsertInput(e.target.value)}
                placeholder="Insertar"
                onKeyDown={e => e.key === 'Enter' && doInsert()}
              />
              <button onClick={doInsert} className="px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                + Flotar
              </button>
              <button onClick={doExtract} className="px-3 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors">
                ↑ Extraer máx
              </button>
            </div>
          )}
        </div>

        {/* Heapsort row */}
        <div className="flex gap-2 mt-2">
          <input
            className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-56"
            value={sortInput}
            onChange={e => setSortInput(e.target.value)}
            placeholder="Array a ordenar con Heapsort"
          />
          <button onClick={doHeapsort} className="px-3 py-2 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap">
            ▶ Heapsort completo
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* Array display */}
            {displayArray.length > 0 && (
              <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-3">
                  Representación array
                </p>
                <div className="flex flex-wrap gap-1">
                  {displayArray.map((val, idx) => {
                    const isHighlighted = highlightedNodes.includes(String(idx))
                    const isSorted = idx >= heapSize
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className={`
                          w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-colors
                          ${isHighlighted
                            ? 'bg-primary-600 text-white ring-2 ring-primary-400'
                            : isSorted
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-1 ring-green-300 dark:ring-green-700'
                              : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300'
                          }
                        `}>
                          {val}
                        </div>
                        <span className="text-xs text-surface-400 mt-0.5">{idx}</span>
                      </div>
                    )
                  })}
                </div>
                {heapSize < displayArray.length && (
                  <p className="text-xs text-surface-400 dark:text-surface-600 mt-2">
                    <span className="inline-block w-3 h-3 bg-green-200 dark:bg-green-900/50 rounded mr-1" />
                    Verde = posición ya ordenada (fuera del montículo activo)
                  </p>
                )}
              </div>
            )}

            {/* Tree */}
            <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4 min-h-48 flex items-start justify-center">
              {heapSize > 0 && treeRoot ? (
                <TreeSVG
                  root={treeRoot}
                  highlightedNodes={highlightedNodes}
                  currentNode={highlightedNodes?.[0]}
                />
              ) : heap.length === 0 && !currentStepData ? (
                <div className="flex items-center justify-center h-40 text-surface-400 text-sm">
                  Construye un montículo o lanza Heapsort para visualizar
                </div>
              ) : null}
            </div>

            {/* Legend */}
            <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-3">
                Propiedades del montículo máximo
              </p>
              <div className="space-y-1 text-sm text-surface-600 dark:text-surface-400">
                <p>• <strong>Propiedad de forma</strong>: árbol binario completo (se rellena nivel a nivel de izquierda a derecha)</p>
                <p>• <strong>Propiedad de orden</strong>: H[padre] ≥ H[hijo] en todo subárbol</p>
                <p>• <strong>Raíz</strong> = elemento <strong>máximo</strong> del conjunto</p>
                <p>• <strong>Padre de i</strong> = ⌊(i−1)/2⌋ &nbsp;&nbsp; <strong>Hijo izq de i</strong> = 2i+1 &nbsp;&nbsp; <strong>Hijo der de i</strong> = 2i+2</p>
              </div>
            </div>
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
                  lines={PSEUDO_MAP[operation]}
                  highlightedLines={currentStepData?.pseudocodeLines ?? []}
                  title={PSEUDO_TITLES[operation]}
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
