import React, { useEffect, useRef, useCallback } from 'react'

interface StepPlayerProps {
  totalSteps: number
  currentStep: number
  isPlaying: boolean
  speed: number
  onPrev: () => void
  onNext: () => void
  onPlayPause: () => void
  onReset: () => void
  onSpeedChange: (speed: number) => void
  onSeek: (step: number) => void
}

export default function StepPlayer({
  totalSteps,
  currentStep,
  isPlaying,
  speed,
  onPrev,
  onNext,
  onPlayPause,
  onReset,
  onSpeedChange,
  onSeek,
}: StepPlayerProps) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const intervalMs = speed === 1 ? 1200 : speed === 2 ? 600 : 250

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        onNext()
      }, intervalMs)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, intervalMs, onNext])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight') onNext()
      else if (e.key === 'ArrowLeft') onPrev()
      else if (e.key === ' ') { e.preventDefault(); onPlayPause() }
    },
    [onNext, onPrev, onPlayPause]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0

  return (
    <div className="bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-3 space-y-3">
      {/* Scrubber */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-surface-500 dark:text-surface-400 w-12 text-right">
          {currentStep + 1}/{totalSteps}
        </span>
        <div className="relative flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-full cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const ratio = Math.max(0, Math.min(1, x / rect.width))
            onSeek(Math.round(ratio * (totalSteps - 1)))
          }}
        >
          <div
            className="absolute left-0 top-0 h-full bg-primary-500 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-primary-500 rounded-full shadow transition-all duration-200"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            title="Reiniciar (inicio)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </button>
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className="p-1.5 rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-30 transition-colors"
            title="Paso anterior (←)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </button>
          <button
            onClick={onPlayPause}
            className="p-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors shadow-sm"
            title="Play/Pausa (Espacio)"
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <button
            onClick={onNext}
            disabled={currentStep >= totalSteps - 1}
            className="p-1.5 rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-30 transition-colors"
            title="Siguiente paso (→)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />
            </svg>
          </button>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500 dark:text-surface-400">Velocidad:</span>
          <div className="flex gap-1">
            {[
              { v: 1, label: '1x' },
              { v: 2, label: '2x' },
              { v: 3, label: '3x' },
            ].map(({ v, label }) => (
              <button
                key={v}
                onClick={() => onSpeedChange(v)}
                className={`px-2 py-0.5 text-xs rounded font-mono transition-colors ${
                  speed === v
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-300 dark:hover:bg-surface-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-surface-400 dark:text-surface-500 text-center">
        ← → para navegar · Espacio para play/pausa
      </p>
    </div>
  )
}
