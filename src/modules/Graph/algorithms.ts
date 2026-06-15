import { Step } from '../../types/step'

export const INF = Infinity

export interface GraphNode {
  id: number
  label: string
}

export interface DijkstraExtra {
  dist: number[]
  visited: boolean[]
  prev: (number | null)[]
  current: number | null
  highlightedEdge?: [number, number]
}

export interface FloydExtra {
  D: number[][]
  A: (number | null)[][]
  k: number
  i: number
  j: number
  updated: boolean
}

export const DIJKSTRA_PSEUDO = [
  'procedimiento Dijkstra(G, s)',
  '  inicio',
  '    para todo v ∈ V hacer',
  '      D[v] ← ∞ ;  visitado[v] ← false',
  '    fpara',
  '    D[s] ← 0',
  '    repetir',
  '      u ← vértice no visitado con D[u] mínimo',
  '      visitado[u] ← true',
  '      para todo vecino v de u hacer',
  '        si D[u] + w(u,v) < D[v] entonces',
  '          D[v] ← D[u] + w(u,v)  // relajar arista',
  '          ant[v] ← u',
  '        fsi',
  '      fpara',
  '    hastaque todos visitados o D[u] = ∞',
  '  fin',
]

export const FLOYD_PSEUDO = [
  'procedimiento Floyd(G)',
  '  inicio',
  '    D ← matriz de adyacencia W de G',
  '    A[i][j] ← j  si existe arista i→j, sino -1',
  '    para k ← 0 hasta n-1 hacer  // vértice intermedio',
  '      para i ← 0 hasta n-1 hacer',
  '        para j ← 0 hasta n-1 hacer',
  '          si D[i][k] + D[k][j] < D[i][j] entonces',
  '            D[i][j] ← D[i][k] + D[k][j]',
  '            A[i][j] ← A[i][k]  // actualizar camino',
  '          fsi',
  '        fpara',
  '      fpara',
  '    fpara',
  '  fin',
]

function cloneD(dist: number[]) { return [...dist] }
function clone2D<T>(m: T[][]): T[][] { return m.map(r => [...r]) }

export function dijkstra(
  n: number,
  adj: number[][],
  source: number,
  labels: string[]
): { steps: Step[] } {
  const steps: Step[] = []
  let id = 0

  const dist = Array(n).fill(INF)
  const visited = Array(n).fill(false)
  const prev: (number | null)[] = Array(n).fill(null)

  function push(desc: string, lines: number[], extra: DijkstraExtra, phase: string, result?: string) {
    steps.push({
      id: id++,
      description: desc,
      pseudocodeLines: lines,
      treeSnapshot: { root: null },
      phase,
      result,
      extra,
      highlightedNodes: extra.current !== null ? [String(extra.current)] : [],
    })
  }

  // Init
  push(
    `Inicializamos D[v]=∞ para todos los vértices y D[${labels[source]}]=0.`,
    [2, 3, 5],
    { dist: cloneD(dist), visited: [...visited], prev: [...prev], current: null },
    'Inicialización'
  )

  dist[source] = 0

  push(
    `Origen: ${labels[source]}. D[${labels[source]}] = 0. Todos los demás: ∞.`,
    [5],
    { dist: cloneD(dist), visited: [...visited], prev: [...prev], current: source },
    'Inicialización'
  )

  for (let iter = 0; iter < n; iter++) {
    // Find unvisited with min dist
    let u = -1
    for (let v = 0; v < n; v++) {
      if (!visited[v] && dist[v] < INF) {
        if (u === -1 || dist[v] < dist[u]) u = v
      }
    }

    if (u === -1) {
      push(
        `No quedan vértices alcanzables no visitados. Algoritmo terminado.`,
        [15],
        { dist: cloneD(dist), visited: [...visited], prev: [...prev], current: null },
        'Fin'
      )
      break
    }

    push(
      `Seleccionamos el no visitado con menor D: ${labels[u]} (D=${dist[u]}). Lo marcamos como VISITADO.`,
      [7, 8],
      { dist: cloneD(dist), visited: [...visited], prev: [...prev], current: u },
      `Visitar ${labels[u]}`
    )

    visited[u] = true

    // Relax edges
    for (let v = 0; v < n; v++) {
      if (v === u || visited[v]) continue
      const w = adj[u][v]
      if (w === INF || w <= 0) continue

      const newDist = dist[u] + w

      push(
        `Examinamos arista ${labels[u]} → ${labels[v]} (peso ${w}). D[${labels[u]}]+w = ${dist[u]}+${w} = ${newDist} ${newDist < dist[v] ? '<' : '≥'} D[${labels[v]}]=${dist[v] === INF ? '∞' : dist[v]}.`,
        [9, 10],
        { dist: cloneD(dist), visited: [...visited], prev: [...prev], current: u, highlightedEdge: [u, v] },
        `Relajar ${labels[u]}→${labels[v]}`
      )

      if (newDist < dist[v]) {
        const oldDist = dist[v]
        dist[v] = newDist
        prev[v] = u
        push(
          `MEJORA: D[${labels[v]}] ← ${newDist} (antes: ${oldDist === INF ? '∞' : oldDist}). Antecesor de ${labels[v]} ← ${labels[u]}.`,
          [11, 12],
          { dist: cloneD(dist), visited: [...visited], prev: [...prev], current: u, highlightedEdge: [u, v] },
          `Actualizar D[${labels[v]}]`
        )
      }
    }
  }

  // Summary
  const result = labels.map((l, i) => `D[${l}]=${dist[i] === INF ? '∞' : dist[i]}`).join('  ')
  push(
    `Dijkstra completado desde ${labels[source]}. Distancias mínimas: ${result}`,
    [],
    { dist: cloneD(dist), visited: [...visited], prev: [...prev], current: null },
    'Resumen',
    result
  )

  return { steps }
}

export function floyd(
  n: number,
  adj: number[][],
  labels: string[]
): { steps: Step[] } {
  const steps: Step[] = []
  let id = 0

  // Init D and A
  const D: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      if (i === j) return 0
      return adj[i][j] > 0 ? adj[i][j] : INF
    })
  )
  const A: (number | null)[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      if (i === j) return null
      return adj[i][j] > 0 ? j : null
    })
  )

  function push(desc: string, lines: number[], extra: FloydExtra, phase: string, result?: string) {
    steps.push({
      id: id++,
      description: desc,
      pseudocodeLines: lines,
      treeSnapshot: { root: null },
      phase,
      result,
      extra,
    })
  }

  push(
    `Inicializamos D = matriz de adyacencia (D[i][i]=0, ∞ donde no hay arista). A[i][j] = j si hay arista i→j, sino null.`,
    [2, 3],
    { D: clone2D(D), A: clone2D(A), k: -1, i: -1, j: -1, updated: false },
    'Inicialización'
  )

  for (let k = 0; k < n; k++) {
    push(
      `Iteración k=${k} (${labels[k]} como vértice intermedio): ¿Pasar por ${labels[k]} mejora algún camino?`,
      [4],
      { D: clone2D(D), A: clone2D(A), k, i: -1, j: -1, updated: false },
      `k=${k} — Intermedio: ${labels[k]}`
    )

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue
        const newVal = D[i][k] === INF || D[k][j] === INF ? INF : D[i][k] + D[k][j]
        const improved = newVal < D[i][j]

        if (D[i][k] !== INF && D[k][j] !== INF) {
          push(
            `D[${labels[i]}][${labels[j]}]: ruta directa=${D[i][j] === INF ? '∞' : D[i][j]}, pasando por ${labels[k]}: ${D[i][k]}+${D[k][j]}=${newVal}. ${improved ? '✓ MEJORA → actualizar.' : 'No mejora.'}`,
            improved ? [7, 8, 9] : [7],
            { D: clone2D(D), A: clone2D(A), k, i, j, updated: improved },
            `D[${labels[i]}][${labels[j]}]`
          )
        }

        if (improved) {
          D[i][j] = newVal
          A[i][j] = A[i][k]
        }
      }
    }
  }

  push(
    `Floyd completado. D contiene las distancias mínimas entre todos los pares. A permite reconstruir los caminos.`,
    [],
    { D: clone2D(D), A: clone2D(A), k: n, i: -1, j: -1, updated: false },
    'Resumen'
  )

  return { steps }
}
