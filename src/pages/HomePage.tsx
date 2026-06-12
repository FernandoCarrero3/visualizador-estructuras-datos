import React from 'react'
import { Link } from 'react-router-dom'

const modules = [
  {
    path: '/arboles-binarios',
    title: 'Árboles Binarios',
    subtitle: 'Tema 2',
    description: 'Recorridos preorden, inorden, postorden y anchura. Frontera, alturas y niveles. Árboles generales.',
    icon: '🌳',
    color: 'from-green-500 to-emerald-600',
    available: true,
  },
  {
    path: '/abb',
    title: 'ABB',
    subtitle: 'Tema 3 — Árbol Binario de Búsqueda',
    description: 'Inserción, búsqueda y eliminación con los 3 casos. Inorden siempre ordenado. Antecesores.',
    icon: '🔍',
    color: 'from-blue-500 to-cyan-600',
    available: true,
  },
  {
    path: '/avl',
    title: 'AVL ★',
    subtitle: 'Tema 3 — Árbol equilibrado',
    description: 'Factores de equilibrio, rotaciones simples y dobles animadas paso a paso. Tabla de casos. Pivote.',
    icon: '⚖',
    color: 'from-primary-500 to-violet-600',
    available: true,
    priority: true,
  },
  {
    path: '/arn',
    title: 'ARN ★',
    subtitle: 'Tema 3 — Árbol Rojo-Negro',
    description: 'Propiedades, recoloración y rotaciones. Casos 1, 2, 3.1, 3.2A/B. Nodos NIL visibles.',
    icon: '🔴',
    color: 'from-red-500 to-rose-600',
    available: true,
    priority: true,
  },
  {
    path: '/diccionarios',
    title: 'Diccionarios',
    subtitle: 'Tema 4',
    description: 'TAD Diccionario con ARN (clave-valor) y tabla dispersa (hash + encadenamiento).',
    icon: '📖',
    color: 'from-amber-500 to-orange-600',
    available: true,
  },
  {
    path: '/grafos',
    title: 'Grafos',
    subtitle: 'Tema 5 — Dijkstra & Floyd',
    description: 'Editor de grafos dirigidos y valorados. Dijkstra con tabla completa. Floyd con matrices D y A.',
    icon: '🕸',
    color: 'from-teal-500 to-cyan-600',
    available: true,
  },
  {
    path: '/monticulos',
    title: 'Montículos',
    subtitle: 'Tema 6 — Heap & Heapsort',
    description: 'Flotar y hundir. Representación doble (array + árbol). Heapsort completo con fases.',
    icon: '🏔',
    color: 'from-indigo-500 to-blue-600',
    available: true,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-full bg-surface-50 dark:bg-surface-950 p-8">
      {/* Hero */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-widest mb-4">
            Estructuras de Datos II · UHU
          </div>
          <h1 className="text-4xl font-bold text-surface-900 dark:text-white mb-3 tracking-tight">
            Visualizador Interactivo
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-xl mx-auto">
            Aprende paso a paso cada estructura de datos del temario. Construye, inserta,
            busca y elimina viendo <strong className="text-surface-700 dark:text-surface-300">qué pasa y por qué</strong>.
          </p>
        </div>

        {/* Features strip */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-surface-600 dark:text-surface-400">
          {[
            '▶ Reproducción animada paso a paso',
            '📋 Pseudocódigo resaltado',
            '💡 Explicaciones en español',
            '⌨ Atajos de teclado',
          ].map(f => (
            <span key={f} className="flex items-center gap-1 px-3 py-1 rounded-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Module cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((m) => (
          <Link
            key={m.path}
            to={m.path}
            className={`group relative bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-200 ${!m.available ? 'opacity-60 pointer-events-none' : ''}`}
          >
            {m.priority && (
              <span className="absolute top-3 right-3 text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-2 py-0.5 rounded-full">
                Prioridad ★
              </span>
            )}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-2xl mb-4 shadow-md`}>
              {m.icon}
            </div>
            <div className="text-xs text-surface-500 dark:text-surface-400 font-medium mb-1">{m.subtitle}</div>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {m.title}
            </h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
              {m.description}
            </p>
            {!m.available && (
              <span className="mt-3 inline-block text-xs text-surface-400">Próximamente</span>
            )}
          </Link>
        ))}
      </div>

      {/* Footer hint */}
      <p className="text-center text-xs text-surface-400 dark:text-surface-600 mt-12">
        Usa ← → para navegar entre pasos · Espacio para play/pausa · Hecho para EDII, UHU
      </p>
    </div>
  )
}
