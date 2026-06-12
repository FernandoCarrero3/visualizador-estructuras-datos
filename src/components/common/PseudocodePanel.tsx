import React from 'react'

interface PseudocodePanelProps {
  title?: string
  lines: string[]
  highlightedLines?: number[]
}

export default function PseudocodePanel({
  title = 'Pseudocódigo',
  lines,
  highlightedLines = [],
}: PseudocodePanelProps) {
  return (
    <div className="bg-surface-950 dark:bg-black rounded-xl border border-surface-700 overflow-hidden h-full flex flex-col">
      <div className="px-3 py-2 bg-surface-800 dark:bg-surface-900 border-b border-surface-700 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="text-xs text-surface-400 font-mono ml-1">{title}</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {lines.map((line, i) => {
          const isHighlighted = highlightedLines.includes(i)
          const indent = (line.match(/^(\s+)/) || ['', ''])[1].length
          const trimmed = line.trimStart()
          return (
            <div
              key={i}
              className={`flex items-start gap-2 px-2 py-0.5 rounded text-xs font-mono transition-colors duration-200 ${
                isHighlighted
                  ? 'bg-primary-600/30 text-primary-200 border-l-2 border-primary-400'
                  : 'text-surface-400 dark:text-surface-500 border-l-2 border-transparent'
              }`}
            >
              <span className="text-surface-600 dark:text-surface-700 select-none w-5 text-right shrink-0">
                {i + 1}
              </span>
              <span style={{ paddingLeft: `${indent * 8}px` }}>
                {colorize(trimmed)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function colorize(line: string): React.ReactNode {
  const keywords = ['inicio', 'fin', 'si', 'entonces', 'sino', 'fsi', 'mientras', 'hacer',
    'fmientras', 'para', 'fpara', 'devolver', 'retornar', 'procedimiento', 'función',
    'función', 'llamar', 'repetir', 'hasta', 'funcion', 'proc']
  const parts = line.split(/(\s+)/)
  return parts.map((part, i) => {
    if (keywords.includes(part.toLowerCase())) {
      return <span key={i} className="text-primary-400 font-semibold">{part}</span>
    }
    if (/^[0-9]+$/.test(part)) {
      return <span key={i} className="text-yellow-400">{part}</span>
    }
    if (/^["']/.test(part)) {
      return <span key={i} className="text-green-400">{part}</span>
    }
    if (/^[+\-*/=<>!]+$/.test(part.trim()) && part.trim() !== '') {
      return <span key={i} className="text-orange-400">{part}</span>
    }
    return <span key={i}>{part}</span>
  })
}
