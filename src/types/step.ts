export interface BinaryTreeNode {
  id: string
  value: number | string
  left?: BinaryTreeNode
  right?: BinaryTreeNode
  // AVL
  balance?: number
  height?: number
  // RBT
  color?: 'red' | 'black'
  isNil?: boolean
}

export interface TreeState {
  root: BinaryTreeNode | null
  nodes?: Record<string, BinaryTreeNode>
}

export interface Step {
  id: number
  description: string
  pseudocodeLine?: string
  pseudocodeLines?: number[]
  highlightedNodes?: string[]
  highlightedEdges?: string[]
  treeSnapshot: TreeState
  phase?: string
  extra?: Record<string, unknown>
  result?: string | number | null
  traversalSoFar?: (number | string)[]
  callStack?: string[]
  queue?: string[]
}
