<div align="center">

# 🌳 Visualizador Interactivo de Estructuras de Datos II

**Herramienta educativa que visualiza, anima y explica estructuras de datos paso a paso**

[![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[🚀 Demo en vivo](#) · [📖 Documentación](#módulos-disponibles) · [🐛 Reportar bug](../../issues)

</div>

---

## ¿Qué es?

Una aplicación web que permite **construir estructuras de datos a partir de tus propios datos** y observar cada operación paso a paso, viendo simultáneamente:

- 📋 El **pseudocódigo resaltado** línea a línea
- 💡 Una **explicación en español** de qué pasa y por qué en cada paso
- 🌳 El **dibujo de la estructura** con nodos resaltados
- ▶️ Un **reproductor** con play/pausa, velocidad y atajos de teclado

Creada para estudiar la asignatura de Estructuras de Datos II (Ingeniería Informática, Universidad de Huelva).

---

## Módulos disponibles

| Módulo | Operaciones |
|--------|-------------|
| 🌳 **Árboles Binarios** | Preorden · Inorden · Postorden · Anchura (con cola) · Frontera · Alturas · Niveles · Modo manual |
| 🔍 **ABB** — Árbol Binario de Búsqueda | Inserción · Búsqueda · Eliminación (3 casos) · Inorden como prueba de orden |
| ⚖️ **AVL** ⭐ | Factores de equilibrio · Pivote · Rotaciones simples y dobles animadas · Tabla de 4 casos · Comparación ABB vs AVL |
| 🔴 **ARN** — Árbol Rojo-Negro ⭐ | Inserción con casos 1/2/3.1/3.2A/3.2B · Recoloración · Rotaciones · Checklist 5 propiedades |
| 📖 **Diccionarios** | *Próximamente* — ARN clave-valor + tabla hash con encadenamiento |
| 🕸️ **Grafos** | *Próximamente* — Dijkstra (tabla) + Floyd (matrices D y A) |
| 🏔️ **Montículos** | *Próximamente* — Flotar/Hundir · Representación doble array+árbol · Heapsort completo |

---

## Características técnicas destacadas

### Motor de pasos genérico

Cada algoritmo genera un array de objetos `Step[]`. Cada paso contiene el estado completo de la estructura, qué línea del pseudocódigo está activa, qué nodos resaltar y una explicación en lenguaje natural. Esto hace el sistema **completamente extensible** a cualquier algoritmo nuevo.

```typescript
interface Step {
  id: number
  description: string        // explicación en español
  pseudocodeLines?: number[] // líneas del pseudocódigo a resaltar
  highlightedNodes?: string[] // nodos a resaltar en el SVG
  treeSnapshot: TreeState    // estado completo de la estructura
  phase?: string             // "Inserción", "Rotación Simple", etc.
  result?: string            // resultado final del paso
}
```

### Reproductor interactivo

- `◀ Anterior` / `Siguiente ▶` con atajos `←` `→`
- `▶ Reproducir` / `⏸ Pausa` con `Espacio`
- Velocidades: 1× · 2× · 3×
- Scrubber para saltar a cualquier paso directamente

### Renderizado SVG dinámico

Los árboles se dibujan con **SVG puro generado por React**, sin librerías de gráficos pesadas. El layout se calcula recursivamente distribuyendo el espacio horizontal a cada nivel. Los nodos tienen transiciones CSS suaves en color y posición.

### AVL — Visualización completa del reequilibrado

El módulo AVL es el más detallado: muestra el recorrido ascendente desde el punto de inserción hasta el pivote, resalta la fila activa en la tabla de los 4 casos de rotación, y anima las rotaciones simples y dobles con dos movimientos diferenciados.

---

## Instalación

```bash
git clone https://github.com/TU_USUARIO/NOMBRE_REPO.git
cd NOMBRE_REPO
npm install
npm run dev          # desarrollo → http://localhost:5173
npm run build        # build de producción
```

---

## Stack

| | Tecnología | Por qué |
|--|-----------|---------|
| ⚛️ | React 18 + TypeScript | Componentes funcionales con tipos estrictos en toda la lógica de algoritmos |
| ⚡ | Vite 6 | HMR instantáneo, build rápido |
| 🎨 | Tailwind CSS 3 | Paleta de colores propia (violeta + neutros), modo oscuro con `dark:` |
| 🗺️ | React Router 7 | Una ruta por módulo, estado independiente por página |
| 🐻 | Zustand | Store global mínimo: modo oscuro y última entrada de cada módulo (persistido en localStorage) |
| 📐 | SVG nativo | Control total del dibujo sin dependencias externas |

---

## Estructura del proyecto

```
src/
├── components/
│   ├── common/          # StepPlayer · PseudocodePanel · ExplanationPanel
│   ├── layout/          # Sidebar colapsable · Layout
│   └── trees/           # TreeSVG — renderizador SVG reutilizable
├── modules/
│   ├── BinaryTree/      # algorithms.ts + BinaryTreePage.tsx
│   ├── BST/             # algorithms.ts + BSTPage.tsx
│   ├── AVL/             # algorithms.ts + AVLPage.tsx
│   ├── RBT/             # algorithms.ts + RBTPage.tsx
│   ├── Dictionary/      # (WIP)
│   ├── Graph/           # (WIP)
│   └── Heap/            # (WIP)
├── pages/               # HomePage con tarjetas de módulos
├── store/               # useAppStore (Zustand)
└── types/               # Step · BinaryTreeNode · TreeState
```

---

## Roadmap

- [x] Motor de pasos + reproductor universal
- [x] Árboles Binarios (recorridos, frontera, alturas, modo manual)
- [x] ABB (inserción, búsqueda, eliminación 3 casos)
- [x] AVL (reequilibrado completo, tabla de rotaciones, comparación AVL/ABB)
- [x] ARN (5 casos, recoloración, 5 propiedades)
- [ ] Diccionarios (ARN clave-valor + tabla hash)
- [ ] Grafos (Dijkstra + Floyd con tablas/matrices)
- [ ] Montículos + Heapsort
- [ ] Modo quiz (pregunta la rotación antes de mostrarla)
- [ ] Exportar árbol como PNG/SVG
- [ ] Generador de secuencias aleatorias

---

## Licencia

MIT © 2025

---

<div align="center">
Hecho con ❤️ para el estudio de <strong>Estructuras de Datos II</strong> — Universidad de Huelva
</div>
