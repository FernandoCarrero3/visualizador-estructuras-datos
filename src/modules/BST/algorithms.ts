import { BinaryTreeNode, Step } from '../../types/step'
import { snapshot, newId } from '../BinaryTree/algorithms'

function nv(node: BinaryTreeNode): number { return node.value as number }

export const BST_INSERT_PSEUDO = [
  'procedimiento insertar(T, x)',
  '  inicio',
  '    si arbolVacio(T) entonces',
  '      T ← crearNodo(x)',
  '    sino si x < T.raiz entonces',
  '      T.izq ← insertar(T.izq, x)',
  '    sino si x > T.raiz entonces',
  '      T.der ← insertar(T.der, x)',
  '    sino  // x ya existe',
  '      // no se inserta duplicado',
  '    fsi',
  '  fin',
]

export const BST_SEARCH_PSEUDO = [
  'función buscar(T, x) → nodo',
  '  inicio',
  '    si arbolVacio(T) entonces',
  '      devolver NO_ENCONTRADO',
  '    sino si x = T.raiz entonces',
  '      devolver T.raiz',
  '    sino si x < T.raiz entonces',
  '      devolver buscar(T.izq, x)',
  '    sino',
  '      devolver buscar(T.der, x)',
  '    fsi',
  '  fin',
]

export const BST_DELETE_PSEUDO = [
  'procedimiento eliminar(T, x)',
  '  inicio',
  '    si x < T.raiz entonces T ← eliminar(T.izq, x)',
  '    sino si x > T.raiz entonces T ← eliminar(T.der, x)',
  '    sino  // x = T.raiz, eliminar este nodo',
  '      si es hoja entonces',
  '        T ← nulo',
  '      sino si T.izq = nulo entonces',
  '        T ← T.der  // sólo hijo derecho',
  '      sino si T.der = nulo entonces',
  '        T ← T.izq  // sólo hijo izquierdo',
  '      sino  // dos hijos',
  '        sucesor ← máximo(T.izq)  // o mínimo(T.der)',
  '        T.raiz ← sucesor',
  '        T.izq ← eliminar(T.izq, sucesor)',
  '      fsi',
  '    fsi',
  '  fin',
]

function cloneNode(n: BinaryTreeNode): BinaryTreeNode {
  return { ...n, left: n.left ? cloneNode(n.left) : undefined, right: n.right ? cloneNode(n.right) : undefined }
}

export function bstInsert(root: BinaryTreeNode | null, val: number): {
  root: BinaryTreeNode
  steps: Step[]
} {
  const steps: Step[] = []
  let id = 0
  const path: string[] = []

  function push(s: Omit<Step, 'id'>) {
    steps.push({ ...s, id: id++ })
  }

  function insert(node: BinaryTreeNode | null): BinaryTreeNode {
    if (!node) {
      const newNode: BinaryTreeNode = { id: newId(), value: val }
      push({
        description: `Posición vacía encontrada → insertamos el nodo con valor ${val} aquí.`,
        pseudocodeLines: [2, 3],
        highlightedNodes: [...path],
        treeSnapshot: { root: null },
        phase: 'Inserción',
      })
      return newNode
    }

    const nval = nv(node)
    push({
      description: `Comparamos ${val} con ${nval}: ${val < nval ? `${val} < ${nval} → vamos al subárbol IZQUIERDO` : val > nval ? `${val} > ${nval} → vamos al subárbol DERECHO` : `${val} = ${nval} → duplicado, no se inserta`}`,
      pseudocodeLines: val < nval ? [4, 5] : val > nval ? [6, 7] : [8],
      highlightedNodes: [node.id, ...path],
      treeSnapshot: { root: null },
      phase: 'Comparación',
    })

    if (val < nval) {
      path.push(node.id)
      const newLeft = insert(node.left ?? null)
      path.pop()
      return { ...node, left: newLeft }
    } else if (val > nval) {
      path.push(node.id)
      const newRight = insert(node.right ?? null)
      path.pop()
      return { ...node, right: newRight }
    }
    return node
  }

  push({
    description: `Iniciamos la inserción de ${val} en el ABB. Buscaremos su posición correcta comparando en cada nodo.`,
    pseudocodeLines: [0],
    highlightedNodes: root ? [root.id] : [],
    treeSnapshot: snapshot(root),
    phase: 'Inicio inserción',
  })

  const newRoot = insert(root)

  // Fix snapshots
  steps.forEach(s => { if (!s.treeSnapshot.root) s.treeSnapshot = snapshot(newRoot) })

  push({
    description: `Inserción de ${val} completada.`,
    pseudocodeLines: [],
    highlightedNodes: [],
    treeSnapshot: snapshot(newRoot),
    result: `${val} insertado correctamente`,
    phase: 'Fin',
  })

  return { root: newRoot, steps }
}

export function bstSearch(root: BinaryTreeNode | null, val: number): Step[] {
  const steps: Step[] = []
  let id = 0
  const path: string[] = []

  function push(s: Omit<Step, 'id'>) {
    steps.push({ ...s, id: id++ })
  }

  push({
    description: `Buscamos ${val} en el ABB. Comenzamos desde la raíz.`,
    pseudocodeLines: [0],
    highlightedNodes: root ? [root.id] : [],
    treeSnapshot: snapshot(root),
    phase: 'Inicio búsqueda',
  })

  function search(node: BinaryTreeNode | null): void {
    if (!node) {
      push({
        description: `Llegamos a un nodo nulo → ${val} NO está en el árbol.`,
        pseudocodeLines: [2, 3],
        highlightedNodes: [],
        treeSnapshot: snapshot(root),
        result: `${val} NO encontrado`,
        phase: 'No encontrado',
      })
      return
    }

    const nval = nv(node)
    path.push(node.id)
    if (val === nval) {
      push({
        description: `${val} = ${nval} → ¡ENCONTRADO! El elemento está en este nodo.`,
        pseudocodeLines: [4, 5],
        highlightedNodes: [node.id],
        treeSnapshot: snapshot(root),
        result: `${val} ENCONTRADO`,
        phase: 'Encontrado',
      })
    } else if (val < nval) {
      push({
        description: `${val} < ${nval} → el elemento está en el subárbol IZQUIERDO (si existe).`,
        pseudocodeLines: [6, 7],
        highlightedNodes: [...path],
        treeSnapshot: snapshot(root),
        phase: 'Comparación',
      })
      search(node.left ?? null)
    } else {
      push({
        description: `${val} > ${nval} → el elemento está en el subárbol DERECHO (si existe).`,
        pseudocodeLines: [8, 9],
        highlightedNodes: [...path],
        treeSnapshot: snapshot(root),
        phase: 'Comparación',
      })
      search(node.right ?? null)
    }
  }

  search(root)
  return steps
}

function findMax(node: BinaryTreeNode): BinaryTreeNode {
  if (!node.right) return node
  return findMax(node.right)
}

export function bstDelete(root: BinaryTreeNode | null, val: number, useSuccessor: 'max-left' | 'min-right' = 'max-left'): {
  root: BinaryTreeNode | null
  steps: Step[]
} {
  const steps: Step[] = []
  let id = 0
  const path: string[] = []

  function push(s: Omit<Step, 'id'>) {
    steps.push({ ...s, id: id++ })
  }

  push({
    description: `Iniciamos la eliminación de ${val} del ABB.`,
    pseudocodeLines: [0],
    highlightedNodes: root ? [root.id] : [],
    treeSnapshot: snapshot(root),
    phase: 'Inicio eliminación',
  })

  function del(node: BinaryTreeNode | null): BinaryTreeNode | null {
    if (!node) {
      push({ description: `${val} no encontrado.`, pseudocodeLines: [], highlightedNodes: [], treeSnapshot: snapshot(root), phase: 'No encontrado' })
      return null
    }

    const dnval = nv(node)
    if (val < dnval) {
      push({ description: `${val} < ${dnval} → buscamos en subárbol izquierdo.`, pseudocodeLines: [2], highlightedNodes: [node.id], treeSnapshot: snapshot(root), phase: 'Búsqueda' })
      return { ...node, left: del(node.left ?? null) ?? undefined }
    } else if (val > dnval) {
      push({ description: `${val} > ${dnval} → buscamos en subárbol derecho.`, pseudocodeLines: [3], highlightedNodes: [node.id], treeSnapshot: snapshot(root), phase: 'Búsqueda' })
      return { ...node, right: del(node.right ?? null) ?? undefined }
    } else {
      // Found
      if (!node.left && !node.right) {
        push({ description: `CASO 1: ${node.value} es hoja (sin hijos) → se elimina directamente.`, pseudocodeLines: [5, 6], highlightedNodes: [node.id], treeSnapshot: snapshot(root), phase: 'Caso 1: nodo hoja' })
        return null
      } else if (!node.left) {
        push({ description: `CASO 2: ${node.value} tiene sólo hijo DERECHO → lo sustituye directamente.`, pseudocodeLines: [7, 8], highlightedNodes: [node.id, node.right!.id], treeSnapshot: snapshot(root), phase: 'Caso 2: un hijo' })
        return node.right ?? null
      } else if (!node.right) {
        push({ description: `CASO 2: ${node.value} tiene sólo hijo IZQUIERDO → lo sustituye directamente.`, pseudocodeLines: [9, 10], highlightedNodes: [node.id, node.left.id], treeSnapshot: snapshot(root), phase: 'Caso 2: un hijo' })
        return node.left
      } else {
        // Two children
        const successor = useSuccessor === 'max-left' ? findMax(node.left) : findMin(node.right!)
        push({
          description: `CASO 3: ${node.value} tiene DOS hijos. Usamos el ${useSuccessor === 'max-left' ? 'MÁXIMO del subárbol izquierdo' : 'MÍNIMO del subárbol derecho'} → ${successor.value}. Lo ponemos en su lugar y eliminamos el sucesor.`,
          pseudocodeLines: [11, 12, 13, 14],
          highlightedNodes: [node.id, successor.id],
          treeSnapshot: snapshot(root),
          phase: 'Caso 3: dos hijos',
        })
        if (useSuccessor === 'max-left') {
          return { ...node, value: successor.value, left: del(node.left) ?? undefined }
        } else {
          return { ...node, value: successor.value, right: del(node.right!) ?? undefined }
        }
      }
    }
  }

  const newRoot = del(root)

  steps.forEach(s => { s.treeSnapshot = snapshot(newRoot) })

  push({
    description: `Eliminación de ${val} completada.`,
    pseudocodeLines: [],
    highlightedNodes: [],
    treeSnapshot: snapshot(newRoot),
    result: `${val} eliminado del árbol`,
    phase: 'Fin',
  })

  return { root: newRoot, steps }
}

function findMin(node: BinaryTreeNode): BinaryTreeNode {
  if (!node.left) return node
  return findMin(node.left)
}

export function bstInorder(root: BinaryTreeNode | null): (number | string)[] {
  const result: (number | string)[] = []
  function dfs(n: BinaryTreeNode | null) {
    if (!n) return
    dfs(n.left ?? null)
    result.push(n.value)
    dfs(n.right ?? null)
  }
  dfs(root)
  return result
}
