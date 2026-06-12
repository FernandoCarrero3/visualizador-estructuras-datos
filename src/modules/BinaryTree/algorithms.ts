import { BinaryTreeNode, Step, TreeState } from '../../types/step'

let nodeCounter = 0
export function newId(): string {
  return `n${++nodeCounter}`
}

export function cloneTree(node: BinaryTreeNode | null | undefined): BinaryTreeNode | null {
  if (!node) return null
  return {
    ...node,
    left: cloneTree(node.left) ?? undefined,
    right: cloneTree(node.right) ?? undefined,
  }
}

export function snapshot(root: BinaryTreeNode | null): TreeState {
  return { root: cloneTree(root) }
}

export function fromLevelArray(arr: (number | null)[]): BinaryTreeNode | null {
  if (!arr.length || arr[0] === null) return null
  const root: BinaryTreeNode = { id: newId(), value: arr[0] }
  const queue: BinaryTreeNode[] = [root]
  let i = 1
  while (queue.length && i < arr.length) {
    const node = queue.shift()!
    if (i < arr.length && arr[i] !== null) {
      node.left = { id: newId(), value: arr[i]! }
      queue.push(node.left)
    }
    i++
    if (i < arr.length && arr[i] !== null) {
      node.right = { id: newId(), value: arr[i]! }
      queue.push(node.right)
    }
    i++
  }
  return root
}

// ─── PSEUDOCODES ────────────────────────────────────────────────────
export const PREORDER_PSEUDO = [
  'procedimiento preOrden(nodo)',
  '  inicio',
  '    si nodo ≠ nulo entonces',
  '      visitar(nodo)',
  '      preOrden(nodo.izq)',
  '      preOrden(nodo.der)',
  '    fsi',
  '  fin',
]

export const INORDER_PSEUDO = [
  'procedimiento inOrden(nodo)',
  '  inicio',
  '    si nodo ≠ nulo entonces',
  '      inOrden(nodo.izq)',
  '      visitar(nodo)',
  '      inOrden(nodo.der)',
  '    fsi',
  '  fin',
]

export const POSTORDER_PSEUDO = [
  'procedimiento postOrden(nodo)',
  '  inicio',
  '    si nodo ≠ nulo entonces',
  '      postOrden(nodo.izq)',
  '      postOrden(nodo.der)',
  '      visitar(nodo)',
  '    fsi',
  '  fin',
]

export const BREADTH_PSEUDO = [
  'procedimiento anchura(raíz)',
  '  inicio',
  '    cola ← vacía',
  '    encolar(cola, raíz)',
  '    mientras cola ≠ vacía hacer',
  '      nodo ← desencolar(cola)',
  '      visitar(nodo)',
  '      si nodo.izq ≠ nulo entonces encolar(cola, nodo.izq) fsi',
  '      si nodo.der ≠ nulo entonces encolar(cola, nodo.der) fsi',
  '    fmientras',
  '  fin',
]

// ─── PREORDER ────────────────────────────────────────────────────────
export function generatePreorderSteps(root: BinaryTreeNode | null): Step[] {
  const steps: Step[] = []
  const visited: (number | string)[] = []
  const callStack: string[] = []
  let id = 0

  function push(s: Omit<Step, 'id'>) {
    steps.push({ ...s, id: id++ })
  }

  function traverse(node: BinaryTreeNode | null): void {
    if (!node) {
      push({
        description: 'Nodo nulo — retornamos (caso base de la recursión).',
        pseudocodeLines: [2],
        highlightedNodes: [],
        treeSnapshot: snapshot(root),
        traversalSoFar: [...visited],
        callStack: [...callStack],
      })
      return
    }

    callStack.push(node.id)

    push({
      description: `Llamada preOrden(${node.value}) — primero VISITAMOS el nodo actual antes de ir a sus hijos.`,
      pseudocodeLines: [3],
      highlightedNodes: [node.id],
      treeSnapshot: snapshot(root),
      traversalSoFar: [...visited],
      callStack: [...callStack],
    })

    visited.push(node.value)
    push({
      description: `Visitamos ${node.value} → añadido al resultado. Preorden: primero la raíz, después izquierda, después derecha.`,
      pseudocodeLines: [3],
      highlightedNodes: [node.id],
      treeSnapshot: snapshot(root),
      traversalSoFar: [...visited],
      callStack: [...callStack],
      result: `Resultado: [${visited.join(', ')}]`,
    })

    push({
      description: `Bajamos al subárbol IZQUIERDO de ${node.value}.`,
      pseudocodeLines: [4],
      highlightedNodes: node.left ? [node.left.id] : [],
      treeSnapshot: snapshot(root),
      traversalSoFar: [...visited],
      callStack: [...callStack],
    })
    traverse(node.left ?? null)

    push({
      description: `Volvemos a ${node.value}. Ahora bajamos al subárbol DERECHO.`,
      pseudocodeLines: [5],
      highlightedNodes: node.right ? [node.right.id] : [],
      treeSnapshot: snapshot(root),
      traversalSoFar: [...visited],
      callStack: [...callStack],
    })
    traverse(node.right ?? null)

    callStack.pop()
  }

  push({
    description: 'Iniciamos el recorrido en PREORDEN: Raíz → Izquierda → Derecha.',
    pseudocodeLines: [0],
    highlightedNodes: root ? [root.id] : [],
    treeSnapshot: snapshot(root),
    traversalSoFar: [],
    callStack: [],
  })

  traverse(root)

  push({
    description: `Recorrido PREORDEN completado. Secuencia: [${visited.join(', ')}]`,
    pseudocodeLines: [],
    highlightedNodes: [],
    treeSnapshot: snapshot(root),
    traversalSoFar: [...visited],
    callStack: [],
    result: `Preorden: [${visited.join(', ')}]`,
  })

  return steps
}

// ─── INORDER ────────────────────────────────────────────────────────
export function generateInorderSteps(root: BinaryTreeNode | null): Step[] {
  const steps: Step[] = []
  const visited: (number | string)[] = []
  const callStack: string[] = []
  let id = 0

  function push(s: Omit<Step, 'id'>) {
    steps.push({ ...s, id: id++ })
  }

  function traverse(node: BinaryTreeNode | null): void {
    if (!node) {
      push({
        description: 'Nodo nulo — caso base de la recursión, retornamos.',
        pseudocodeLines: [2],
        highlightedNodes: [],
        treeSnapshot: snapshot(root),
        traversalSoFar: [...visited],
        callStack: [...callStack],
      })
      return
    }

    callStack.push(node.id)

    push({
      description: `Llamada inOrden(${node.value}) — primero iremos al subárbol IZQUIERDO antes de visitar este nodo.`,
      pseudocodeLines: [2],
      highlightedNodes: [node.id],
      treeSnapshot: snapshot(root),
      traversalSoFar: [...visited],
      callStack: [...callStack],
    })

    push({
      description: `Bajamos al subárbol IZQUIERDO de ${node.value}.`,
      pseudocodeLines: [3],
      highlightedNodes: node.left ? [node.left.id] : [],
      treeSnapshot: snapshot(root),
      traversalSoFar: [...visited],
      callStack: [...callStack],
    })
    traverse(node.left ?? null)

    visited.push(node.value)
    push({
      description: `Visitamos ${node.value} → añadido al resultado. Inorden produce los nodos en orden (útil en ABB: quedan ordenados).`,
      pseudocodeLines: [4],
      highlightedNodes: [node.id],
      treeSnapshot: snapshot(root),
      traversalSoFar: [...visited],
      callStack: [...callStack],
      result: `Resultado: [${visited.join(', ')}]`,
    })

    push({
      description: `Bajamos al subárbol DERECHO de ${node.value}.`,
      pseudocodeLines: [5],
      highlightedNodes: node.right ? [node.right.id] : [],
      treeSnapshot: snapshot(root),
      traversalSoFar: [...visited],
      callStack: [...callStack],
    })
    traverse(node.right ?? null)

    callStack.pop()
  }

  push({
    description: 'Iniciamos el recorrido en INORDEN: Izquierda → Raíz → Derecha.',
    pseudocodeLines: [0],
    highlightedNodes: root ? [root.id] : [],
    treeSnapshot: snapshot(root),
    traversalSoFar: [],
    callStack: [],
  })

  traverse(root)

  push({
    description: `Recorrido INORDEN completado. Secuencia: [${visited.join(', ')}]`,
    pseudocodeLines: [],
    highlightedNodes: [],
    treeSnapshot: snapshot(root),
    traversalSoFar: [...visited],
    callStack: [],
    result: `Inorden: [${visited.join(', ')}]`,
  })

  return steps
}

// ─── POSTORDER ────────────────────────────────────────────────────────
export function generatePostorderSteps(root: BinaryTreeNode | null): Step[] {
  const steps: Step[] = []
  const visited: (number | string)[] = []
  const callStack: string[] = []
  let id = 0

  function push(s: Omit<Step, 'id'>) {
    steps.push({ ...s, id: id++ })
  }

  function traverse(node: BinaryTreeNode | null): void {
    if (!node) {
      push({
        description: 'Nodo nulo — caso base de la recursión, retornamos.',
        pseudocodeLines: [2],
        highlightedNodes: [],
        treeSnapshot: snapshot(root),
        traversalSoFar: [...visited],
        callStack: [...callStack],
      })
      return
    }

    callStack.push(node.id)

    push({
      description: `Llamada postOrden(${node.value}) — visitaremos este nodo SÓLO después de procesar sus hijos.`,
      pseudocodeLines: [2],
      highlightedNodes: [node.id],
      treeSnapshot: snapshot(root),
      traversalSoFar: [...visited],
      callStack: [...callStack],
    })

    traverse(node.left ?? null)
    traverse(node.right ?? null)

    visited.push(node.value)
    push({
      description: `Visitamos ${node.value} → ambos subárboles ya procesados. PostOrden: útil para borrar/liberar árboles (primero los hijos).`,
      pseudocodeLines: [5],
      highlightedNodes: [node.id],
      treeSnapshot: snapshot(root),
      traversalSoFar: [...visited],
      callStack: [...callStack],
      result: `Resultado: [${visited.join(', ')}]`,
    })

    callStack.pop()
  }

  push({
    description: 'Iniciamos el recorrido en POSTORDEN: Izquierda → Derecha → Raíz.',
    pseudocodeLines: [0],
    highlightedNodes: root ? [root.id] : [],
    treeSnapshot: snapshot(root),
    traversalSoFar: [],
    callStack: [],
  })

  traverse(root)

  push({
    description: `Recorrido POSTORDEN completado. Secuencia: [${visited.join(', ')}]`,
    pseudocodeLines: [],
    highlightedNodes: [],
    treeSnapshot: snapshot(root),
    traversalSoFar: [...visited],
    callStack: [],
    result: `Postorden: [${visited.join(', ')}]`,
  })

  return steps
}

// ─── BREADTH FIRST ──────────────────────────────────────────────────
export function generateBreadthSteps(root: BinaryTreeNode | null): Step[] {
  const steps: Step[] = []
  const visited: (number | string)[] = []
  let id = 0

  function push(s: Omit<Step, 'id'>) {
    steps.push({ ...s, id: id++ })
  }

  push({
    description: 'Iniciamos el recorrido en ANCHURA (por niveles / BFS). Usamos una cola FIFO.',
    pseudocodeLines: [0],
    highlightedNodes: root ? [root.id] : [],
    treeSnapshot: snapshot(root),
    traversalSoFar: [],
    queue: root ? [root.id] : [],
  })

  if (!root) return steps

  const queue: BinaryTreeNode[] = [root]

  push({
    description: `Encolamos la raíz (${root.value}). Cola: [${root.value}]`,
    pseudocodeLines: [2, 3],
    highlightedNodes: [root.id],
    treeSnapshot: snapshot(root),
    traversalSoFar: [],
    queue: [root.id],
  })

  while (queue.length > 0) {
    const node = queue.shift()!

    push({
      description: `Desencolamos ${node.value}. La cola funciona FIFO: primero en entrar, primero en salir.`,
      pseudocodeLines: [4, 5],
      highlightedNodes: [node.id],
      treeSnapshot: snapshot(root),
      traversalSoFar: [...visited],
      queue: queue.map(n => n.id),
    })

    visited.push(node.value)
    push({
      description: `Visitamos ${node.value} → añadido al resultado. Procesamos todos los nodos nivel a nivel.`,
      pseudocodeLines: [6],
      highlightedNodes: [node.id],
      treeSnapshot: snapshot(root),
      traversalSoFar: [...visited],
      queue: queue.map(n => n.id),
      result: `Resultado: [${visited.join(', ')}]`,
    })

    if (node.left) {
      queue.push(node.left)
      push({
        description: `Encolamos hijo izquierdo: ${node.left.value}. Cola: [${queue.map(n => n.value).join(', ')}]`,
        pseudocodeLines: [7],
        highlightedNodes: [node.left.id],
        treeSnapshot: snapshot(root),
        traversalSoFar: [...visited],
        queue: queue.map(n => n.id),
      })
    }
    if (node.right) {
      queue.push(node.right)
      push({
        description: `Encolamos hijo derecho: ${node.right.value}. Cola: [${queue.map(n => n.value).join(', ')}]`,
        pseudocodeLines: [7],
        highlightedNodes: [node.right.id],
        treeSnapshot: snapshot(root),
        traversalSoFar: [...visited],
        queue: queue.map(n => n.id),
      })
    }
  }

  push({
    description: `Recorrido en ANCHURA completado. Secuencia: [${visited.join(', ')}]`,
    pseudocodeLines: [],
    highlightedNodes: [],
    treeSnapshot: snapshot(root),
    traversalSoFar: [...visited],
    queue: [],
    result: `Anchura: [${visited.join(', ')}]`,
  })

  return steps
}

// ─── FRONTIER ───────────────────────────────────────────────────────
export function getFrontier(root: BinaryTreeNode | null): string[] {
  const leaves: string[] = []
  function dfs(node: BinaryTreeNode | null) {
    if (!node) return
    if (!node.left && !node.right) { leaves.push(node.id); return }
    dfs(node.left ?? null)
    dfs(node.right ?? null)
  }
  dfs(root)
  return leaves
}

export function generateFrontierSteps(root: BinaryTreeNode | null): Step[] {
  const steps: Step[] = []
  const frontier: string[] = []
  let id = 0

  function push(s: Omit<Step, 'id'>) {
    steps.push({ ...s, id: id++ })
  }

  push({
    description: 'Buscamos la FRONTERA del árbol: los nodos hoja (nodos sin hijos), recorridos de izquierda a derecha.',
    pseudocodeLines: [],
    highlightedNodes: [],
    treeSnapshot: snapshot(root),
  })

  function dfs(node: BinaryTreeNode | null) {
    if (!node) return
    if (!node.left && !node.right) {
      frontier.push(node.id)
      push({
        description: `${node.value} es una HOJA (sin hijos izquierdo ni derecho) → se añade a la frontera.`,
        highlightedNodes: [...frontier],
        treeSnapshot: snapshot(root),
        result: `Frontera hasta ahora: [${frontier.map(id => {
          const n = findNode(root, id)
          return n ? n.value : id
        }).join(', ')}]`,
      })
    } else {
      push({
        description: `${node.value} tiene hijos → no es hoja, continuamos recursivamente.`,
        highlightedNodes: [node.id],
        treeSnapshot: snapshot(root),
      })
    }
    dfs(node.left ?? null)
    dfs(node.right ?? null)
  }

  dfs(root)

  push({
    description: `FRONTERA completada: los nodos hoja de izquierda a derecha.`,
    highlightedNodes: [...frontier],
    treeSnapshot: snapshot(root),
    result: `Frontera: [${frontier.map(id => {
      const n = findNode(root, id)
      return n ? n.value : id
    }).join(', ')}]`,
  })

  return steps
}

function findNode(root: BinaryTreeNode | null, id: string): BinaryTreeNode | null {
  if (!root) return null
  if (root.id === id) return root
  return findNode(root.left ?? null, id) || findNode(root.right ?? null, id)
}

// ─── HEIGHT + LEVELS ────────────────────────────────────────────────
export function computeHeights(root: BinaryTreeNode | null): Map<string, number> {
  const map = new Map<string, number>()
  function h(node: BinaryTreeNode | null): number {
    if (!node) return -1
    const lh = h(node.left ?? null)
    const rh = h(node.right ?? null)
    const height = 1 + Math.max(lh, rh)
    map.set(node.id, height)
    return height
  }
  h(root)
  return map
}

export function computeLevels(root: BinaryTreeNode | null): Map<string, number> {
  const map = new Map<string, number>()
  function bfs(node: BinaryTreeNode | null, level: number) {
    if (!node) return
    map.set(node.id, level)
    bfs(node.left ?? null, level + 1)
    bfs(node.right ?? null, level + 1)
  }
  bfs(root, 0)
  return map
}
