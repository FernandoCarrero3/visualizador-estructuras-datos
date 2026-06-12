import React from 'react'

export default function DictionaryPage() {
  return (
    <div className="flex items-center justify-center h-full bg-surface-50 dark:bg-surface-950">
      <div className="text-center p-8 max-w-md">
        <div className="text-5xl mb-4">📖</div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Diccionarios</h2>
        <p className="text-surface-500 dark:text-surface-400">Tema 4 — Próximamente</p>
        <p className="text-sm text-surface-400 dark:text-surface-600 mt-3">
          Implementación con ARN (clave-valor) y tabla dispersa con encadenamiento.
        </p>
      </div>
    </div>
  )
}
