import React, { useState, useCallback } from 'react'
import { Step } from '../../types/step'
import TreeSVG from '../../components/trees/TreeSVG'
import StepPlayer from '../../components/common/StepPlayer'
import PseudocodePanel from '../../components/common/PseudocodePanel'
import ExplanationPanel from '../../components/common/ExplanationPanel'
import { useAppStore } from '../../store/useAppStore'
import { RBTNode, rbtInsert, checkRBTProperties, RBTCase } from './algorithms'

const RBT_PSEUDO = [
  'procedimiento insertar_ARN(T, x)',
  '  inicio',
  '    N ← crearNodo(x, ROJO, NIL, NIL)',
  '    insertar_ABB(T, N)',
  '    // Casos:',
  '    si padre(N) = negro entonces  // Caso 1',
  '      // OK, no violación',
  '    sino si N = raíz entonces  // Caso 2',
  '      N.color ← NEGRO',
  '    sino  // padre rojo → Caso 3',
  '      si tío(N) = rojo entonces  // Caso 3.1',
  '        padre(N).color ← NEGRO',
  '        tío(N).color ← NEGRO',
  '        abuelo(N).color ← ROJO',
  '        // Seguir comprobando desde abuelo(N)',
  '      sino si mismo_lado(N, padre) entonces  // Caso 3.2A',
  '        rotaciónSimple(abuelo(N))',
  '        intercambiarColores(padre(N), abuelo(N))',
  '      sino  // Caso 3.2B',
  '        rotaciónDoble(padre(N), abuelo(N))',
  '        intercambiarColores(N, abuelo(N))',
  '      fsi',
  '    fsi',
  '    raíz(T).color ← NEGRO  // siempre',
  '  fin',
]

const CASE_DESCRIPTIONS: Record<RBTCase, string> = {
  'none': '',
  '1': 'Caso 1: El padre es NEGRO → no hay violación. El árbol ya es válido.',
  '2': 'Caso 2: El nodo es LA RAÍZ → se pinta de negro.',
  '3.1': 'Caso 3.1: Tío ROJO → recoloración (padre y tío → negro, abuelo → rojo). Hay que seguir comprobando desde el abuelo.',
  '3.2A': 'Caso 3.2A: Tío NEGRO y N del MISMO LADO que su padre respecto al abuelo → rotación SIMPLE sobre el abuelo + recoloración (padre ↔ abuelo). FIN.',
  '3.2B': 'Caso 3.2B: Tío NEGRO y N del LADO CONTRARIO → rotación DOBLE + recoloración (N ↔ abuelo). FIN.',
}

export default function RBTPage() {
  const { lastInputs, setLastInput } = useAppStore()
  const [rbtRoot, setRbtRoot] = useState<RBTNode | null>(null)
  const [sequenceInput, setSequenceInput] = useState(lastInputs['rbt'] || '10, 20, 30, 15, 25, 5')
  const [singleInput, setSingleInput] = useState('')
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [lastCase, setLastCase] = useState<RBTCase>('none')

  const buildFromSequence = () => {
    const vals = sequenceInput.split(/[\s,]+/).filter(Boolean).map(Number).filter(n => !isNaN(n))
    if (!vals.length) return
    let r: RBTNode | null = null
    for (const v of vals) {
      r = rbtInsert(r, v).root
    }
    setRbtRoot(r)
    setSteps([])
    setCurrentStep(0)
    setLastInput('rbt', sequenceInput)
  }

  const insertSingle = () => {
    const val = parseInt(singleInput)
    if (isNaN(val)) return
    const result = rbtInsert(rbtRoot, val)
    setRbtRoot(result.root)
    setSteps(result.steps)
    setCurrentStep(0)
    setIsPlaying(false)
    setLastCase(result.caseApplied)
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
  const currentTree = (currentStepData?.treeSnapshot.root as RBTNode | null) ?? rbtRoot
  const props = checkRBTProperties(rbtRoot)

  const activeCase = (currentStepData?.extra?.case as RBTCase) ?? 'none'

  return (
    <div className="flex flex-col h-full bg-surface-50 dark:bg-surface-950">
      <div className="border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-6 py-4">
        <h1 className="text-xl font-bold text-surface-900 dark:text-white">Árbol Rojo-Negro (ARN) ⭐</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">Tema 3 — Propiedades, recoloración y rotaciones con 5 casos</p>
        <div className="flex gap-2 mt-3">
          <input
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={sequenceInput}
            onChange={e => setSequenceInput(e.target.value)}
            placeholder="Secuencia, ej: 10, 20, 30, 15, 25, 5"
          />
          <button onClick={buildFromSequence} className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
            Construir ARN
          </button>
        </div>
        {rbtRoot && (
          <div className="flex gap-2 mt-2">
            <input
              className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-28"
              value={singleInput}
              onChange={e => setSingleInput(e.target.value)}
              placeholder="Insertar"
              onKeyDown={e => e.key === 'Enter' && insertSingle()}
            />
            <button onClick={insertSingle} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
              + Insertar
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* Tree */}
            <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4 min-h-64 flex items-start justify-center">
              <TreeSVG
                root={currentTree}
                highlightedNodes={currentStepData?.highlightedNodes}
                currentNode={currentStepData?.highlightedNodes?.[0]}
              />
            </div>

            {/* Properties checklist */}
            {rbtRoot && (
              <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-3">
                  Propiedades ARN
                </p>
                <div className="space-y-1.5">
                  {[
                    { ok: props.rootIsBlack, text: 'La raíz es negra' },
                    { ok: props.allNodesRedOrBlack, text: 'Todo nodo es rojo o negro' },
                    { ok: props.nilNodesBlack, text: 'Todo nodo externo (NIL) es negro' },
                    { ok: props.redNodeChildrenBlack, text: 'Condición roja: nodo rojo → hijos negros' },
                    { ok: props.sameBlackHeight, text: 'Condición negra: mismo nº negros en todos los caminos a NIL' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={p.ok ? 'text-green-500' : 'text-red-500'}>{p.ok ? '✓' : '✗'}</span>
                      <span className={p.ok ? 'text-surface-700 dark:text-surface-300' : 'text-red-600 dark:text-red-400 font-medium'}>
                        {i + 1}. {p.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cases */}
            <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400 mb-3">Casos de inserción ARN</p>
              <div className="space-y-2">
                {(['1', '2', '3.1', '3.2A', '3.2B'] as RBTCase[]).map(c => {
                  const isActive = activeCase === c || (lastCase === c && steps.length === 0)
                  return (
                    <div key={c} className={`flex gap-2 p-2 rounded-lg transition-colors ${isActive ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : ''}`}>
                      <span className={`text-xs font-bold w-12 shrink-0 ${isActive ? 'text-red-600 dark:text-red-400' : 'text-surface-500'}`}>Caso {c}</span>
                      <p className="text-xs text-surface-600 dark:text-surface-400">{CASE_DESCRIPTIONS[c]}</p>
                    </div>
                  )
                })}
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
                  lines={RBT_PSEUDO}
                  highlightedLines={currentStepData?.pseudocodeLines ?? []}
                  title="ARN: insertar"
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
