import { BinaryTreeNode, Step } from '../../types/step'
import { newId } from '../BinaryTree/algorithms'

export interface RBTNode extends BinaryTreeNode {
  color: 'red' | 'black'
  isNil?: boolean
  left?: RBTNode
  right?: RBTNode
  parent?: string
}

const NIL_COLOR: 'black' = 'black'

function makeNil(): RBTNode {
  return { id: newId(), value: 'NIL', color: 'black', isNil: true }
}

function makeNode(val: number): RBTNode {
  return {
    id: newId(),
    value: val,
    color: 'red',
    left: makeNil(),
    right: makeNil(),
    height: 0,
    balance: 0,
  }
}

function cloneRBT(node: RBTNode | null | undefined): RBTNode | null {
  if (!node) return null
  return { ...node, left: cloneRBT(node.left) ?? undefined, right: cloneRBT(node.right) ?? undefined }
}

function snapshotRBT(root: RBTNode | null) {
  return { root: cloneRBT(root) }
}

function isNilNode(n: RBTNode | null | undefined): boolean {
  return !n || !!n.isNil
}

function rotateLeft(node: RBTNode): RBTNode {
  const right = node.right!
  const newNode = { ...node, right: right.left }
  const newRight = { ...right, left: newNode }
  return newRight
}

function rotateRight(node: RBTNode): RBTNode {
  const left = node.left!
  const newNode = { ...node, left: left.right }
  const newLeft = { ...left, right: newNode }
  return newLeft
}

export type RBTCase = '1' | '2' | '3.1' | '3.2A' | '3.2B' | 'none'

export function rbtInsert(root: RBTNode | null, val: number): {
  root: RBTNode
  steps: Step[]
  caseApplied: RBTCase
} {
  const steps: Step[] = []
  let id = 0
  let caseApplied: RBTCase = 'none'

  function push(s: Omit<Step, 'id'>) {
    steps.push({ ...s, id: id++ })
  }

  function bstInsert(node: RBTNode | null): RBTNode {
    if (!node || node.isNil) {
      return makeNode(val)
    }
    const nval = node.value as number
    push({
      description: `Comparamos ${val} con ${nval}: ${val < nval ? 'menor → izquierda' : val > nval ? 'mayor → derecha' : 'duplicado'}`,
      pseudocodeLines: [],
      highlightedNodes: [node.id],
      treeSnapshot: snapshotRBT(root),
      phase: 'Inserción ABB (nodo rojo)',
    })
    if (val < nval) {
      return { ...node, left: bstInsert(node.left ?? null) }
    } else if (val > nval) {
      return { ...node, right: bstInsert(node.right ?? null) }
    }
    return node
  }

  // ─── Fix violations ────────────────────────────────────────────────
  function fix(node: RBTNode, targetId: string): RBTNode {
    if (node.isNil) return node
    if (node.id === targetId) return node

    let updated = { ...node }

    if (!node.left?.isNil) {
      updated = { ...updated, left: fix(node.left!, targetId) }
    }
    if (!node.right?.isNil) {
      updated = { ...updated, right: fix(node.right!, targetId) }
    }

    // Check for red-red violation in children
    if (updated.left?.color === 'red') {
      const n = updated.left!
      const uncle = updated.right

      if (n.color === 'red' && updated.color === 'red') {
        // Handled by parent
        return updated
      }

      // Check if n has a red child (violation in grandchildren)
      if (n.left?.color === 'red') {
        const nephew = n.left!
        if (isNilNode(uncle) || uncle?.color === 'black') {
          // Case 3.2A: N same side as parent
          caseApplied = '3.2A'
          push({
            description: `Caso 3.2A (tío negro, N en mismo lado que padre): rotación SIMPLE DERECHA sobre ${updated.value} + recoloración. Padre ${n.value}↔ abuelo ${updated.value}.`,
            pseudocodeLines: [],
            highlightedNodes: [updated.id, n.id, nephew.id],
            treeSnapshot: snapshotRBT(updated),
            phase: 'Caso 3.2A — Rot. Simple',
            extra: { case: '3.2A' },
          })
          const rotated = rotateRight(updated)
          return { ...rotated, color: updated.color === 'black' ? 'black' : 'black',
            left: { ...rotated.left!, color: 'red' },
            right: { ...rotated.right!, color: 'black' } }
        }
      }

      if (n.right?.color === 'red') {
        const nephew = n.right!
        const unc = updated.right
        if (!isNilNode(unc) && unc?.color === 'red') {
          // Case 3.1
          caseApplied = '3.1'
          push({
            description: `Caso 3.1: tío ${unc.value} es ROJO → recoloración. Padre ${n.value} y tío ${unc.value} → negro. Abuelo ${updated.value} → rojo (se propaga hacia arriba).`,
            pseudocodeLines: [],
            highlightedNodes: [n.id, unc.id, updated.id],
            treeSnapshot: snapshotRBT(updated),
            phase: 'Caso 3.1 — Recoloración',
            extra: { case: '3.1' },
          })
          return {
            ...updated, color: 'red',
            left: { ...n, color: 'black' },
            right: { ...unc, color: 'black' },
          }
        } else {
          caseApplied = '3.2B'
          push({
            description: `Caso 3.2B: tío negro, N del lado CONTRARIO al padre. Primero rotación IZQUIERDA sobre ${n.value}, luego rotación DERECHA sobre ${updated.value}.`,
            pseudocodeLines: [],
            highlightedNodes: [updated.id, n.id, nephew.id],
            treeSnapshot: snapshotRBT(updated),
            phase: 'Caso 3.2B — Rot. Doble',
            extra: { case: '3.2B' },
          })
          const step1 = { ...updated, left: rotateLeft(n) }
          const result = rotateRight(step1)
          return { ...result, color: updated.color,
            left: { ...result.left!, color: 'red' },
            right: { ...result.right!, color: 'red' } }
        }
      }
    }

    if (updated.right?.color === 'red') {
      const n = updated.right!
      const uncle = updated.left

      if (n.right?.color === 'red') {
        const nephew = n.right!
        if (isNilNode(uncle) || uncle?.color === 'black') {
          caseApplied = '3.2A'
          push({
            description: `Caso 3.2A (simétrico): tío negro, N mismo lado que padre → rotación SIMPLE IZQUIERDA sobre ${updated.value}.`,
            pseudocodeLines: [],
            highlightedNodes: [updated.id, n.id, nephew.id],
            treeSnapshot: snapshotRBT(updated),
            phase: 'Caso 3.2A (simétrico)',
            extra: { case: '3.2A' },
          })
          const rotated = rotateLeft(updated)
          return { ...rotated, color: updated.color,
            left: { ...rotated.left!, color: 'red' },
            right: { ...rotated.right!, color: 'black' } }
        }
      }

      if (n.left?.color === 'red') {
        const nephew = n.left!
        const unc = updated.left
        if (!isNilNode(unc) && unc?.color === 'red') {
          caseApplied = '3.1'
          push({
            description: `Caso 3.1 (simétrico): recoloración. Padre y tío → negro. Abuelo → rojo.`,
            pseudocodeLines: [],
            highlightedNodes: [n.id, (unc as RBTNode).id, updated.id],
            treeSnapshot: snapshotRBT(updated),
            phase: 'Caso 3.1 — Recoloración',
            extra: { case: '3.1' },
          })
          return {
            ...updated, color: 'red',
            left: { ...unc as RBTNode, color: 'black' },
            right: { ...n, color: 'black' },
          }
        } else {
          caseApplied = '3.2B'
          push({
            description: `Caso 3.2B (simétrico): rotación doble Izquierda-Derecha.`,
            pseudocodeLines: [],
            highlightedNodes: [updated.id, n.id, nephew.id],
            treeSnapshot: snapshotRBT(updated),
            phase: 'Caso 3.2B (simétrico)',
            extra: { case: '3.2B' },
          })
          const step1 = { ...updated, right: rotateRight(n) }
          const result = rotateLeft(step1)
          return { ...result, color: updated.color,
            left: { ...result.left!, color: 'red' },
            right: { ...result.right!, color: 'red' } }
        }
      }
    }

    return updated
  }

  push({
    description: `Insertamos ${val} como en un ABB, siempre con color ROJO. Los nodos NIL (hojas externas) son siempre negros.`,
    pseudocodeLines: [],
    highlightedNodes: [],
    treeSnapshot: snapshotRBT(root),
    phase: 'Inicio inserción ARN',
  })

  let newRoot = bstInsert(root)

  // Find the new node
  function findNewNode(node: RBTNode | null): string | null {
    if (!node || node.isNil) return null
    if (node.value === val && node.color === 'red') {
      // Check it has NIL children
      if (node.left?.isNil && node.right?.isNil) return node.id
    }
    return findNewNode(node.left ?? null) || findNewNode(node.right ?? null)
  }

  const newNodeId = findNewNode(newRoot) ?? ''

  push({
    description: `Nodo ${val} insertado (rojo) con dos hijos NIL negros. Verificamos si viola alguna propiedad ARN...`,
    pseudocodeLines: [],
    highlightedNodes: newNodeId ? [newNodeId] : [],
    treeSnapshot: snapshotRBT(newRoot),
    phase: 'Verificar propiedades',
  })

  // Check Case 1: parent is black
  function getParent(node: RBTNode | null, targetId: string, parent: RBTNode | null = null): RBTNode | null {
    if (!node || node.isNil) return null
    if (node.id === targetId) return parent
    return getParent(node.left ?? null, targetId, node) || getParent(node.right ?? null, targetId, node)
  }

  const parentNode = getParent(newRoot, newNodeId)

  if (!parentNode) {
    // Case 2: root
    caseApplied = '2'
    push({
      description: `Caso 2: el nuevo nodo ${val} ES LA RAÍZ → se pinta de negro.`,
      pseudocodeLines: [],
      highlightedNodes: newNodeId ? [newNodeId] : [],
      treeSnapshot: snapshotRBT(newRoot),
      phase: 'Caso 2 — Raíz → negro',
      extra: { case: '2' },
    })
    newRoot = { ...newRoot, color: 'black' }
  } else if (parentNode.color === 'black') {
    caseApplied = '1'
    push({
      description: `Caso 1: el padre (${parentNode.value}) es NEGRO → no hay violación. Árbol válido.`,
      pseudocodeLines: [],
      highlightedNodes: [newNodeId, parentNode.id],
      treeSnapshot: snapshotRBT(newRoot),
      phase: 'Caso 1 — Sin violación',
      extra: { case: '1' },
    })
  } else {
    // Case 3: parent is red
    push({
      description: `El padre (${parentNode.value}) es ROJO → violación de la propiedad "rojo no puede tener hijo rojo". Determinamos caso...`,
      pseudocodeLines: [],
      highlightedNodes: [newNodeId, parentNode.id],
      treeSnapshot: snapshotRBT(newRoot),
      phase: 'Caso 3 — Padre rojo, analizando...',
    })
    newRoot = fix(newRoot, '')
  }

  // Always ensure root is black
  newRoot = { ...newRoot, color: 'black' }

  // Check properties
  push({
    description: `La raíz se fuerza a negro (regla ARN). Verificando las 5 propiedades...`,
    pseudocodeLines: [],
    highlightedNodes: [newRoot.id],
    treeSnapshot: snapshotRBT(newRoot),
    phase: 'Forzar raíz negra',
  })

  push({
    description: `Inserción de ${val} completada. Caso aplicado: ${caseApplied}.`,
    pseudocodeLines: [],
    highlightedNodes: [],
    treeSnapshot: snapshotRBT(newRoot),
    result: `${val} insertado. Caso ARN: ${caseApplied}`,
    phase: 'Resumen',
  })

  return { root: newRoot, steps, caseApplied }
}

export function checkRBTProperties(root: RBTNode | null): {
  rootIsBlack: boolean
  allNodesRedOrBlack: boolean
  nilNodesBlack: boolean
  redNodeChildrenBlack: boolean
  sameBlackHeight: boolean
} {
  function allColors(n: RBTNode | null): boolean {
    if (!n) return true
    if (n.color !== 'red' && n.color !== 'black') return false
    return allColors(n.left ?? null) && allColors(n.right ?? null)
  }

  function nilsBlack(n: RBTNode | null): boolean {
    if (!n) return true
    if (n.isNil) return n.color === 'black'
    return nilsBlack(n.left ?? null) && nilsBlack(n.right ?? null)
  }

  function redChildrenBlack(n: RBTNode | null): boolean {
    if (!n || n.isNil) return true
    if (n.color === 'red') {
      if (n.left?.color === 'red' || n.right?.color === 'red') return false
    }
    return redChildrenBlack(n.left ?? null) && redChildrenBlack(n.right ?? null)
  }

  function blackHeight(n: RBTNode | null): number {
    if (!n || n.isNil) return 1
    const l = blackHeight(n.left ?? null)
    const r = blackHeight(n.right ?? null)
    if (l !== r || l === -1) return -1
    return l + (n.color === 'black' ? 1 : 0)
  }

  return {
    rootIsBlack: !root || root.color === 'black',
    allNodesRedOrBlack: allColors(root),
    nilNodesBlack: nilsBlack(root),
    redNodeChildrenBlack: redChildrenBlack(root),
    sameBlackHeight: blackHeight(root) !== -1,
  }
}
