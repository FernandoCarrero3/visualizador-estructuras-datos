import { BinaryTreeNode, Step } from '../../types/step'
import { newId } from '../BinaryTree/algorithms'

export interface AVLNode extends BinaryTreeNode {
  height: number
  balance: number
  left?: AVLNode
  right?: AVLNode
}

export const AVL_INSERT_PSEUDO = [
  'procedimiento insertar(T, x)',
  '  inicio',
  '    // 1. Inserción normal como ABB',
  '    si arbolVacio(T) entonces',
  '      T ← crearNodo(x)  // altura=0, eq=0',
  '    sino si x < T.raiz entonces',
  '      T.izq ← insertar(T.izq, x)',
  '    sino si x > T.raiz entonces',
  '      T.der ← insertar(T.der, x)',
  '    fsi',
  '    // 2. Actualizar altura y equilibrio',
  '    T.altura ← 1 + max(altura(T.izq), altura(T.der))',
  '    T.eq ← altura(T.der) - altura(T.izq)',
  '    // 3. Reequilibrar si eq = ±2',
  '    si T.eq = +2 entonces',
  '      si T.der.eq ≥ 0 entonces  // +1 o 0',
  '        T ← rotaciónSimpleIzquierda(T)  // caso +2/+1',
  '      sino  // T.der.eq = -1',
  '        T ← rotaciónDobleDerechaIzquierda(T)  // caso +2/-1',
  '      fsi',
  '    sino si T.eq = -2 entonces',
  '      si T.izq.eq ≤ 0 entonces  // -1 o 0',
  '        T ← rotaciónSimpleDerecha(T)  // caso -2/-1',
  '      sino  // T.izq.eq = +1',
  '        T ← rotaciónDobleIzquierdaDerecha(T)  // caso -2/+1',
  '      fsi',
  '    fsi',
  '    devolver T',
  '  fin',
]

export const AVL_ROTATION_I_PSEUDO = [
  'función rotaciónSimpleIzquierda(P)',
  '  inicio',
  '    // P es el pivote (eq=+2), H=P.der (eq=+1)',
  '    H ← P.der',
  '    P.der ← H.izq',
  '    H.izq ← P',
  '    actualizarAltura(P)',
  '    actualizarAltura(H)',
  '    devolver H  // H es la nueva raíz',
  '  fin',
]

export const AVL_ROTATION_D_PSEUDO = [
  'función rotaciónSimpleDerecha(P)',
  '  inicio',
  '    // P es el pivote (eq=-2), H=P.izq (eq=-1)',
  '    H ← P.izq',
  '    P.izq ← H.der',
  '    H.der ← P',
  '    actualizarAltura(P)',
  '    actualizarAltura(H)',
  '    devolver H  // H es la nueva raíz',
  '  fin',
]

function height(node: AVLNode | null | undefined): number {
  return node?.height ?? -1
}

function updateHeight(node: AVLNode): AVLNode {
  const h = 1 + Math.max(height(node.left), height(node.right))
  const b = height(node.right) - height(node.left)
  return { ...node, height: h, balance: b }
}

function cloneAVL(node: AVLNode | null | undefined): AVLNode | null {
  if (!node) return null
  return { ...node, left: cloneAVL(node.left) ?? undefined, right: cloneAVL(node.right) ?? undefined }
}

function snapshotAVL(root: AVLNode | null) {
  return { root: cloneAVL(root) }
}

function rotateLeft(p: AVLNode): AVLNode {
  const h = p.right!
  const newP = updateHeight({ ...p, right: h.left })
  const newH = updateHeight({ ...h, left: newP })
  return newH
}

function rotateRight(p: AVLNode): AVLNode {
  const h = p.left!
  const newP = updateHeight({ ...p, left: h.right })
  const newH = updateHeight({ ...h, right: newP })
  return newH
}

export type RotationType = 'SI' | 'SD' | 'DID' | 'DDI' | 'none'

interface InsertResult {
  root: AVLNode
  steps: Step[]
  rotationApplied: RotationType
  pivotValue?: number | string
}

export function avlInsert(root: AVLNode | null, val: number): InsertResult {
  const steps: Step[] = []
  let id = 0
  let rotationApplied: RotationType = 'none'
  let pivotValue: number | string | undefined

  function push(s: Omit<Step, 'id'>) {
    steps.push({ ...s, id: id++ })
  }

  function insert(node: AVLNode | null, ancestors: string[]): AVLNode {
    if (!node) {
      const newNode: AVLNode = { id: newId(), value: val, height: 0, balance: 0 }
      push({
        description: `Nodo vacío → insertamos ${val}. Altura=0, equilibrio=0. Comenzamos a SUBIR actualizando los equilibrios.`,
        pseudocodeLines: [3, 4],
        highlightedNodes: [...ancestors],
        treeSnapshot: snapshotAVL(root),
        phase: 'Inserción ABB',
      })
      return newNode
    }

    const nval = node.value as number
    push({
      description: `En nodo ${nval} (eq=${node.balance > 0 ? '+' : ''}${node.balance}): ${val < nval ? `${val} < ${nval} → vamos a la IZQUIERDA` : val > nval ? `${val} > ${nval} → vamos a la DERECHA` : 'duplicado'}`,
      pseudocodeLines: val < nval ? [5, 6] : [7, 8],
      highlightedNodes: [node.id, ...ancestors],
      treeSnapshot: snapshotAVL(root),
      phase: 'Comparación',
    })

    let updated: AVLNode
    if (val < nval) {
      const newLeft = insert(node.left ?? null, [node.id, ...ancestors])
      updated = updateHeight({ ...node, left: newLeft })
    } else if (val > nval) {
      const newRight = insert(node.right ?? null, [node.id, ...ancestors])
      updated = updateHeight({ ...node, right: newRight })
    } else {
      return node
    }

    push({
      description: `Subiendo de ${val}: actualizamos altura de ${updated.value}. Nueva altura=${updated.height}, nuevo eq=${updated.balance > 0 ? '+' : ''}${updated.balance}`,
      pseudocodeLines: [11, 12],
      highlightedNodes: [updated.id],
      treeSnapshot: snapshotAVL(updated),
      phase: 'Actualizar equilibrio',
    })

    // Check balance
    if (Math.abs(updated.balance) < 2) return updated

    // Imbalance detected
    pivotValue = updated.value
    push({
      description: `¡DESEQUILIBRIO en ${updated.value}! eq = ${updated.balance > 0 ? '+' : ''}${updated.balance} → es el PIVOTE. Determinamos qué rotación aplicar...`,
      pseudocodeLines: [14],
      highlightedNodes: [updated.id],
      treeSnapshot: snapshotAVL(updated),
      phase: '¡PIVOTE detectado!',
      extra: { pivot: updated.value, pivotBalance: updated.balance },
    })

    if (updated.balance === 2) {
      const childEq = updated.right!.balance
      if (childEq >= 0) {
        rotationApplied = 'SI'
        push({
          description: `Pivote eq=+2, hijo derecho eq=${childEq > 0 ? '+' : ''}${childEq} → caso +2/${childEq > 0 ? '+1' : '0'} → ROTACIÓN SIMPLE IZQUIERDA sobre ${updated.value}.`,
          pseudocodeLines: [15, 16],
          highlightedNodes: [updated.id, updated.right!.id],
          treeSnapshot: snapshotAVL(updated),
          phase: 'Rotación Simple Izquierda (I)',
          extra: { rotation: 'SI', pivotEq: updated.balance, childEq },
        })
        const result = rotateLeft(updated)
        push({
          description: `Rotación completada. ${result.value} es la nueva raíz de este subárbol. El subárbol ha vuelto a su altura anterior → fin del reequilibrado.`,
          pseudocodeLines: [27],
          highlightedNodes: [result.id],
          treeSnapshot: snapshotAVL(result),
          phase: 'Rotación aplicada',
        })
        return result
      } else {
        rotationApplied = 'DDI'
        push({
          description: `Pivote eq=+2, hijo derecho eq=-1 → caso +2/-1 → ROTACIÓN DOBLE Derecha-Izquierda sobre ${updated.value}. Primero rotamos a la derecha el hijo, luego a la izquierda el pivote.`,
          pseudocodeLines: [17, 18],
          highlightedNodes: [updated.id, updated.right!.id],
          treeSnapshot: snapshotAVL(updated),
          phase: 'Rotación Doble DI',
          extra: { rotation: 'DDI' },
        })
        const step1 = updateHeight({ ...updated, right: rotateRight(updated.right!) })
        push({
          description: `Paso 1 de la doble: rotación simple DERECHA sobre ${updated.right!.value}.`,
          pseudocodeLines: [18],
          highlightedNodes: [step1.right!.id],
          treeSnapshot: snapshotAVL(step1),
          phase: 'Doble DI — paso 1',
        })
        const result = rotateLeft(step1)
        push({
          description: `Paso 2 de la doble: rotación simple IZQUIERDA sobre ${updated.value}. Rotación doble completada.`,
          pseudocodeLines: [18],
          highlightedNodes: [result.id],
          treeSnapshot: snapshotAVL(result),
          phase: 'Doble DI — paso 2',
        })
        return result
      }
    } else {
      const childEq = updated.left!.balance
      if (childEq <= 0) {
        rotationApplied = 'SD'
        push({
          description: `Pivote eq=-2, hijo izquierdo eq=${childEq < 0 ? '' : '+'}${childEq} → caso -2/${childEq < 0 ? '-1' : '0'} → ROTACIÓN SIMPLE DERECHA sobre ${updated.value}.`,
          pseudocodeLines: [21, 22],
          highlightedNodes: [updated.id, updated.left!.id],
          treeSnapshot: snapshotAVL(updated),
          phase: 'Rotación Simple Derecha (D)',
          extra: { rotation: 'SD', pivotEq: updated.balance, childEq },
        })
        const result = rotateRight(updated)
        push({
          description: `Rotación completada. ${result.value} es la nueva raíz de este subárbol.`,
          pseudocodeLines: [27],
          highlightedNodes: [result.id],
          treeSnapshot: snapshotAVL(result),
          phase: 'Rotación aplicada',
        })
        return result
      } else {
        rotationApplied = 'DID'
        push({
          description: `Pivote eq=-2, hijo izquierdo eq=+1 → caso -2/+1 → ROTACIÓN DOBLE Izquierda-Derecha sobre ${updated.value}.`,
          pseudocodeLines: [23, 24],
          highlightedNodes: [updated.id, updated.left!.id],
          treeSnapshot: snapshotAVL(updated),
          phase: 'Rotación Doble ID',
          extra: { rotation: 'DID' },
        })
        const step1 = updateHeight({ ...updated, left: rotateLeft(updated.left!) })
        push({
          description: `Paso 1: rotación simple IZQUIERDA sobre ${updated.left!.value}.`,
          pseudocodeLines: [24],
          highlightedNodes: [step1.left!.id],
          treeSnapshot: snapshotAVL(step1),
          phase: 'Doble ID — paso 1',
        })
        const result = rotateRight(step1)
        push({
          description: `Paso 2: rotación simple DERECHA sobre ${updated.value}. Rotación doble completada.`,
          pseudocodeLines: [24],
          highlightedNodes: [result.id],
          treeSnapshot: snapshotAVL(result),
          phase: 'Doble ID — paso 2',
        })
        return result
      }
    }
  }

  push({
    description: `Insertamos ${val} en el árbol AVL. Primero como ABB normal, luego verificamos equilibrios subiendo desde el punto de inserción.`,
    pseudocodeLines: [0],
    highlightedNodes: root ? [root.id] : [],
    treeSnapshot: snapshotAVL(root),
    phase: 'Inicio',
  })

  const newRoot = insert(root, [])

  push({
    description: rotationApplied === 'none'
      ? `Inserción de ${val} completada. No fue necesario reequilibrar (ningún nodo alcanzó eq=±2).`
      : `Inserción de ${val} completada. Rotación ${rotationApplied} aplicada sobre el pivote ${pivotValue}.`,
    pseudocodeLines: [],
    highlightedNodes: [],
    treeSnapshot: snapshotAVL(newRoot),
    result: rotationApplied === 'none'
      ? `${val} insertado. Sin rotación necesaria.`
      : `${val} insertado. Pivote: ${pivotValue}. Rotación: ${rotationApplied}`,
    phase: 'Resumen',
  })

  return { root: newRoot, steps, rotationApplied, pivotValue }
}

export function avlFromSequence(vals: number[]): AVLNode | null {
  let root: AVLNode | null = null
  for (const v of vals) {
    root = avlInsert(root, v).root
  }
  return root
}
