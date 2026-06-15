import React, { useState, useCallback } from 'react'
import { Step } from '../../types/step'
import StepPlayer from '../../components/common/StepPlayer'
import PseudocodePanel from '../../components/common/PseudocodePanel'
import ExplanationPanel from '../../components/common/ExplanationPanel'
import {
  HashTable, DictEntry,
  makeTable, hashFn,
  hashInsert, hashSearch, hashDelete,
  HASH_INSERT_PSEUDO, HASH_SEARCH_PSEUDO, HASH_DELETE_PSEUDO,
} from './algorithms'

type Operation = 'insert' | 'search' | 'delete'

const PSEUDO_MAP: Record<Operation, string[]> = {
  insert: HASH_INSERT_PSEUDO,
  search: HASH_SEARCH_PSEUDO,
  delete: HASH_DELETE_PSEUDO,
}

const PSEUDO_TITLES: Record<Operation, string> = {
  insert: 'insertar(T, k, v)',
  search: 'buscar(T, k)',
  delete: 'eliminar(T, k)',
}

export default function DictionaryPage() {
  const [tableSize, setTableSize] = useState(7)
  const [table, setTable] = useState<HashTable>(makeTable(7))
  const [keyInput, setKeyInput] = useState('')
  const [valInput, setValInput] = useState('')
  const [searchKey, setSearchKey] = useState('')
  const [deleteKey, setDeleteKey] = useState('')
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [operation, setOperation] = useState<Operation>('insert')

  const resetTable = (m: number) => {
    setTableSize(m)
    setTable(makeTable(m))
    setSteps([])
    setCurrentStep(0)
  }

  const doInsert = () => {
    const k = parseInt(keyInput)
    if (isNaN(k)) return
    const result = hashInsert(table, k, valInput || String(k))
    setTable(result.table)
    setSteps(result.steps)
    setCurrentStep(0)
    setIsPlaying(false)
    setOperation('insert')
    setKeyInput('')
    setValInput('')
  }

  const doSearch = () => {
    const k = parseInt(searchKey)
    if (isNaN(k)) return
    const result = hashSearch(table, k)
    setSteps(result.steps)
    setCurrentStep(0)
    setIsPlaying(false)
    setOperation('search')
  }

  const doDelete = () => {
    const k = parseInt(deleteKey)
    if (isNaN(k)) return
    const result = hashDelete(table, k)
    setTable(result.table)
    setSteps(result.steps)
    setCurrentStep(0)
    setIsPlaying(false)
    setOperation('delete')
    setDeleteKey('')
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
  const extra = currentStepData?.extra as { table?: DictEntry[][]; highlightedSlot?: number; highlightedKey?: number } | undefined
  const displayTable = extra?.table ?? table
  const highlightedSlot = extra?.highlightedSlot

  const totalEntries = table.reduce((acc, s) => acc + s.length, 0)
  const loadFactor = totalEntries / tableSize

  return (
    <div className="flex flex-col h-full bg-surface-50 dark:bg-surface-950">
      {/* Header */}
      <div className="border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-6 py-4">
        <h1 className="text-xl font-bold text-surface-900 dark:text-white">Diccionarios — Tabla Dispersa 📖</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">Tema 4 — Tabla hash con encadenamiento (resolución de colisiones)</p>

        <div className="flex flex-wrap items-end gap-3 mt-3">
          {/* Table size */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-600 dark:text-surface-400">M =</span>
            {[5, 7, 11, 13].map(m => (
              <button
                key={m}
                onClick={() => resetTable(m)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${tableSize === m ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'}`}
              >
                {m}
              </button>
            ))}
            <span className="text-xs text-surface-400 ml-1">h(k) = k mod M</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-2">
          {/* Insert */}
          <div className="flex gap-2 items-center">
            <input
              className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-20"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="Clave"
              onKeyDown={e => e.key === 'Enter' && doInsert()}
            />
            <input
              className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-28"
              value={valInput}
              onChange={e => setValInput(e.target.value)}
              placeholder="Valor"
              onKeyDown={e => e.key === 'Enter' && doInsert()}
            />
            <button onClick={doInsert} className="px-3 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
              Insertar
            </button>
          </div>

          {/* Search */}
          <div className="flex gap-2 items-center">
            <input
              className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-20"
              value={searchKey}
              onChange={e => setSearchKey(e.target.value)}
              placeholder="Clave"
              onKeyDown={e => e.key === 'Enter' && doSearch()}
            />
            <button onClick={doSearch} className="px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
              Buscar
            </button>
          </div>

          {/* Delete */}
          <div className="flex gap-2 items-center">
            <input
              className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-20"
              value={deleteKey}
              onChange={e => setDeleteKey(e.target.value)}
              placeholder="Clave"
              onKeyDown={e => e.key === 'Enter' && doDelete()}
            />
            <button onClick={doDelete} className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* Stats */}
            <div className="flex gap-4 text-sm">
              <div className="bg-white dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700 px-4 py-2">
                <span className="text-surface-500 dark:text-surface-400">Entradas: </span>
                <span className="font-bold text-surface-900 dark:text-white">{totalEntries}</span>
              </div>
              <div className="bg-white dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700 px-4 py-2">
                <span className="text-surface-500 dark:text-surface-400">Factor de carga (λ = n/M): </span>
                <span className={`font-bold ${loadFactor > 1 ? 'text-red-500' : loadFactor > 0.7 ? 'text-amber-500' : 'text-green-500'}`}>
                  {loadFactor.toFixed(2)}
                </span>
              </div>
              <div className="bg-white dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700 px-4 py-2">
                <span className="text-surface-500 dark:text-surface-400">Tamaño M: </span>
                <span className="font-bold text-surface-900 dark:text-white">{tableSize}</span>
              </div>
            </div>

            {/* Hash table visualization */}
            <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-3">
                Tabla dispersa (encadenamiento externo)
              </p>
              <div className="space-y-2">
                {displayTable.map((chain, slot) => {
                  const isHighlighted = highlightedSlot === slot
                  return (
                    <div key={slot} className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${isHighlighted ? 'bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-300 dark:ring-primary-700' : ''}`}>
                      {/* Slot index */}
                      <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg text-sm font-bold border-2 ${isHighlighted ? 'border-primary-500 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300' : 'border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800 text-surface-500 dark:text-surface-400'}`}>
                        {slot}
                      </div>
                      {/* Arrow */}
                      <span className="text-surface-400 text-sm">→</span>
                      {/* Chain */}
                      {chain.length === 0 ? (
                        <span className="text-xs text-surface-300 dark:text-surface-600 italic">vacía</span>
                      ) : (
                        <div className="flex items-center gap-1 flex-wrap">
                          {chain.map((entry: DictEntry, idx: number) => (
                            <React.Fragment key={idx}>
                              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border ${isHighlighted ? 'bg-primary-100 dark:bg-primary-900/40 border-primary-300 dark:border-primary-700 text-primary-800 dark:text-primary-200' : 'bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300'}`}>
                                <span className="font-bold">{entry.key}</span>
                                <span className="text-surface-400">:</span>
                                <span className="text-xs">{entry.value}</span>
                              </div>
                              {idx < chain.length - 1 && (
                                <span className="text-surface-400 text-sm">→</span>
                              )}
                            </React.Fragment>
                          ))}
                          <span className="text-surface-300 dark:text-surface-600 text-xs">→ ∅</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Hash function info */}
            <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-3">
                Función hash y colisiones
              </p>
              <div className="space-y-1 text-sm text-surface-600 dark:text-surface-400">
                <p>• <strong>h(k) = k mod M</strong> → slot entre 0 y M−1</p>
                <p>• <strong>Colisión</strong>: dos claves distintas con el mismo hash. Se resuelve por <strong>encadenamiento</strong>: lista enlazada en cada cubeta.</p>
                <p>• <strong>Factor de carga λ = n/M</strong>: coste medio de búsqueda = 1 + λ/2 (búsqueda con éxito)</p>
                <p>• M primo reduce las colisiones para distribuciones uniformes</p>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1 text-xs">
                {Array.from({ length: tableSize }, (_, k) => k).map(k => (
                  <div key={k} className="flex justify-between bg-surface-50 dark:bg-surface-800 px-2 py-1 rounded text-surface-500 dark:text-surface-400">
                    <span>h({k})</span><span className="font-mono">{hashFn(k, tableSize)}</span>
                  </div>
                ))}
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
