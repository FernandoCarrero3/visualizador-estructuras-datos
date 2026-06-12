import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'

const modules = [
  {
    path: '/',
    label: 'Inicio',
    icon: '⌂',
    exact: true,
  },
  {
    path: '/arboles-binarios',
    label: 'Árboles Binarios',
    icon: '🌳',
    tema: 'Tema 2',
  },
  {
    path: '/abb',
    label: 'ABB',
    icon: '🔍',
    tema: 'Tema 3',
    full: 'Árbol Binario de Búsqueda',
  },
  {
    path: '/avl',
    label: 'AVL',
    icon: '⚖',
    tema: 'Tema 3',
    full: 'Árbol AVL',
    priority: true,
  },
  {
    path: '/arn',
    label: 'ARN',
    icon: '🔴',
    tema: 'Tema 3',
    full: 'Árbol Rojo-Negro',
    priority: true,
  },
  {
    path: '/diccionarios',
    label: 'Diccionarios',
    icon: '📖',
    tema: 'Tema 4',
  },
  {
    path: '/grafos',
    label: 'Grafos',
    icon: '🕸',
    tema: 'Tema 5',
    full: 'Dijkstra & Floyd',
  },
  {
    path: '/monticulos',
    label: 'Montículos',
    icon: '🏔',
    tema: 'Tema 6',
    full: 'Heap & Heapsort',
  },
]

export default function Sidebar() {
  const { darkMode, toggleDarkMode } = useAppStore()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`flex flex-col h-screen sticky top-0 bg-surface-950 border-r border-surface-800 transition-all duration-300 ${
        collapsed ? 'w-14' : 'w-56'
      } shrink-0`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-surface-800">
        {!collapsed && (
          <div>
            <p className="text-xs font-semibold text-primary-400 uppercase tracking-widest">EDII</p>
            <p className="text-white font-bold text-sm leading-tight">Visualizador</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {collapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            }
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2 space-y-0.5 px-1">
        {modules.map((m) => (
          <NavLink
            key={m.path}
            to={m.path}
            end={m.exact}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary-700/30 text-primary-300 border border-primary-700/50'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800'
              }`
            }
          >
            <span className="text-base shrink-0">{m.icon}</span>
            {!collapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium truncate">{m.label}</span>
                  {m.priority && (
                    <span className="text-yellow-400 text-xs">★</span>
                  )}
                </div>
                {m.tema && (
                  <span className="text-xs text-surface-600">{m.tema}</span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-surface-800 p-2">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
        >
          <span className="text-base shrink-0">{darkMode ? '☀' : '🌙'}</span>
          {!collapsed && <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>}
        </button>
      </div>
    </aside>
  )
}
