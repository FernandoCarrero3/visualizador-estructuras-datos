import React from 'react'

interface ExplanationPanelProps {
  description: string
  phase?: string
  result?: string | null
  extra?: React.ReactNode
}

export default function ExplanationPanel({ description, phase, result, extra }: ExplanationPanelProps) {
  return (
    <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mt-0.5">
          <svg className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          {phase && (
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400 mb-1">
              {phase}
            </span>
          )}
          <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      {result != null && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">{result}</p>
        </div>
      )}
      {extra && <div>{extra}</div>}
    </div>
  )
}
