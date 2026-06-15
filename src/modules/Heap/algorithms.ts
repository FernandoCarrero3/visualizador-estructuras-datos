import { BinaryTreeNode, Step } from '../../types/step'

export function arrayToTree(arr: number[], heapSize?: number): BinaryTreeNode | null {
  if (!arr.length) return null
  const size = heapSize ?? arr.length

  function build(i: number): BinaryTreeNode | undefined {
    if (i >= size) return undefined
    return {
      id: `${i}`,
      value: arr[i],
      left: build(2 * i + 1),
      right: build(2 * i + 2),
    }
  }
  return build(0) ?? null
}

function snap(arr: number[], heapSize?: number): { root: BinaryTreeNode | null } {
  return { root: arrayToTree([...arr], heapSize) }
}

export const HEAP_FLOAT_PSEUDO = [
  'procedimiento flotar(H, i)',
  '  inicio',
  '    mientras i > 0 hacer',
  '      padre ← ⌊(i-1)/2⌋',
  '      si H[i] > H[padre] entonces',
  '        intercambiar(H[i], H[padre])',
  '        i ← padre',
  '      sino',
  '        salir  // heap válido',
  '      fsi',
  '    fmientras',
  '  fin',
]

export const HEAP_INSERT_PSEUDO = [
  'procedimiento insertar(H, x)',
  '  inicio',
  '    H[n] ← x         // añadir al final',
  '    n ← n + 1',
  '    flotar(H, n-1)   // restaurar propiedad',
  '  fin',
]

export const HEAP_SINK_PSEUDO = [
  'procedimiento hundir(H, i, n)',
  '  inicio',
  '    repetir',
  '      izq ← 2*i+1 ;  der ← 2*i+2',
  '      mayor ← i',
  '      si izq < n y H[izq] > H[mayor] entonces',
  '        mayor ← izq',
  '      fsi',
  '      si der < n y H[der] > H[mayor] entonces',
  '        mayor ← der',
  '      fsi',
  '      si mayor ≠ i entonces',
  '        intercambiar(H[i], H[mayor])',
  '        i ← mayor',
  '      sino',
  '        salir  // heap válido',
  '      fsi',
  '    siempre',
  '  fin',
]

export const HEAP_EXTRACT_PSEUDO = [
  'procedimiento extraerMáximo(H)',
  '  inicio',
  '    máx ← H[0]',
  '    H[0] ← H[n-1]   // mover último a raíz',
  '    n ← n - 1',
  '    hundir(H, 0, n)  // restaurar propiedad',
  '    devolver máx',
  '  fin',
]

export const HEAPSORT_PSEUDO = [
  'procedimiento heapsort(A, n)',
  '  inicio',
  '    // Fase 1: construir el montículo',
  '    para i ← ⌊n/2⌋-1 hasta 0 hacer',
  '      hundir(A, i, n)',
  '    fpara',
  '    // Fase 2: extraer el máximo n-1 veces',
  '    para i ← n-1 hasta 1 hacer',
  '      intercambiar(A[0], A[i])',
  '      hundir(A, 0, i)',
  '    fpara',
  '  fin',
]

function sinkSteps(
  arr: number[],
  i: number,
  heapSize: number,
  steps: Step[],
  id: { v: number },
  pseudo: number[]
) {
  while (true) {
    const l = 2 * i + 1
    const r = 2 * i + 2
    let largest = i

    steps.push({
      id: id.v++,
      description: `Hundiendo posición ${i} (valor ${arr[i]}). Hijos: izq=${l < heapSize ? arr[l] : '—'}, der=${r < heapSize ? arr[r] : '—'}.`,
      pseudocodeLines: pseudo.length ? pseudo : [3, 4, 5],
      highlightedNodes: [String(i), ...(l < heapSize ? [String(l)] : []), ...(r < heapSize ? [String(r)] : [])],
      treeSnapshot: snap([...arr], heapSize),
      phase: 'Hundir',
      extra: { array: [...arr], heapSize },
    })

    if (l < heapSize && arr[l] > arr[largest]) largest = l
    if (r < heapSize && arr[r] > arr[largest]) largest = r

    if (largest !== i) {
      steps.push({
        id: id.v++,
        description: `H[${largest}]=${arr[largest]} > H[${i}]=${arr[i]} → INTERCAMBIO entre posición ${i} y ${largest}.`,
        pseudocodeLines: [11],
        highlightedNodes: [String(i), String(largest)],
        treeSnapshot: snap([...arr], heapSize),
        phase: 'Intercambio',
        extra: { array: [...arr], heapSize },
      });
      [arr[i], arr[largest]] = [arr[largest], arr[i]]
      steps.push({
        id: id.v++,
        description: `Tras intercambio: [${arr.slice(0, heapSize).join(', ')}]${heapSize < arr.length ? ` | ordenado: [${arr.slice(heapSize).join(', ')}]` : ''}`,
        pseudocodeLines: [12],
        highlightedNodes: [String(largest)],
        treeSnapshot: snap([...arr], heapSize),
        phase: 'Hundir',
        extra: { array: [...arr], heapSize },
      })
      i = largest
    } else {
      steps.push({
        id: id.v++,
        description: `H[${i}]=${arr[i]} ya es mayor que sus hijos → HUNDIR terminado.`,
        pseudocodeLines: [14],
        highlightedNodes: [String(i)],
        treeSnapshot: snap([...arr], heapSize),
        phase: 'Hundir',
        extra: { array: [...arr], heapSize },
      })
      break
    }
  }
}

export function heapInsert(heap: number[], val: number): { heap: number[]; steps: Step[] } {
  const arr = [...heap, val]
  const steps: Step[] = []
  const id = { v: 0 }

  steps.push({
    id: id.v++,
    description: `Insertamos ${val} al final del array (posición ${arr.length - 1}).`,
    pseudocodeLines: [2],
    highlightedNodes: [String(arr.length - 1)],
    treeSnapshot: snap(arr),
    phase: 'Inserción',
    extra: { array: [...arr] },
  })

  let i = arr.length - 1
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2)
    steps.push({
      id: id.v++,
      description: `FLOTAR: H[${i}]=${arr[i]} vs padre H[${parent}]=${arr[parent]}.`,
      pseudocodeLines: [4],
      highlightedNodes: [String(i), String(parent)],
      treeSnapshot: snap(arr),
      phase: 'Flotar',
      extra: { array: [...arr] },
    })

    if (arr[i] > arr[parent]) {
      steps.push({
        id: id.v++,
        description: `${arr[i]} > ${arr[parent]} → INTERCAMBIO posición ${i} ↔ ${parent}.`,
        pseudocodeLines: [5],
        highlightedNodes: [String(i), String(parent)],
        treeSnapshot: snap(arr),
        phase: 'Intercambio',
        extra: { array: [...arr] },
      });
      [arr[i], arr[parent]] = [arr[parent], arr[i]]
      steps.push({
        id: id.v++,
        description: `Tras intercambio: [${arr.join(', ')}]. Continuamos flotando desde posición ${parent}.`,
        pseudocodeLines: [6],
        highlightedNodes: [String(parent)],
        treeSnapshot: snap(arr),
        phase: 'Flotar',
        extra: { array: [...arr] },
      })
      i = parent
    } else {
      steps.push({
        id: id.v++,
        description: `${arr[i]} ≤ ${arr[parent]} → posición correcta. FLOTAR terminado.`,
        pseudocodeLines: [7],
        highlightedNodes: [String(i)],
        treeSnapshot: snap(arr),
        phase: 'Flotar',
        extra: { array: [...arr] },
      })
      break
    }
  }

  steps.push({
    id: id.v++,
    description: `Inserción de ${val} completada. Montículo: [${arr.join(', ')}]`,
    pseudocodeLines: [],
    highlightedNodes: [],
    treeSnapshot: snap(arr),
    result: `[${arr.join(', ')}]`,
    phase: 'Resumen',
    extra: { array: [...arr] },
  })

  return { heap: arr, steps }
}

export function heapExtractMax(heap: number[]): { heap: number[]; steps: Step[]; max: number } {
  if (!heap.length) return { heap: [], steps: [], max: -Infinity }
  const arr = [...heap]
  const steps: Step[] = []
  const id = { v: 0 }
  const max = arr[0]

  steps.push({
    id: id.v++,
    description: `Extraemos el MÁXIMO: H[0]=${max}. Movemos el último elemento (${arr[arr.length - 1]}) a la raíz.`,
    pseudocodeLines: [2, 3],
    highlightedNodes: ['0', String(arr.length - 1)],
    treeSnapshot: snap(arr),
    phase: 'Extraer máximo',
    extra: { array: [...arr] },
  })

  arr[0] = arr[arr.length - 1]
  arr.pop()

  steps.push({
    id: id.v++,
    description: `Raíz ← ${arr[0]}. Tamaño del montículo: ${arr.length}. Ahora hundir la raíz.`,
    pseudocodeLines: [4, 5],
    highlightedNodes: ['0'],
    treeSnapshot: snap(arr),
    phase: 'Hundir raíz',
    extra: { array: [...arr] },
  })

  sinkSteps(arr, 0, arr.length, steps, id, [])

  steps.push({
    id: id.v++,
    description: `Extracción completada. Máximo extraído: ${max}. Montículo: [${arr.join(', ')}]`,
    pseudocodeLines: [],
    highlightedNodes: [],
    treeSnapshot: snap(arr),
    result: `Máximo extraído: ${max}. Montículo: [${arr.join(', ')}]`,
    phase: 'Resumen',
    extra: { array: [...arr] },
  })

  return { heap: arr, steps, max }
}

export function heapsort(input: number[]): { sorted: number[]; steps: Step[] } {
  const arr = [...input]
  const n = arr.length
  const steps: Step[] = []
  const id = { v: 0 }

  steps.push({
    id: id.v++,
    description: `Heapsort sobre [${arr.join(', ')}] (${n} elementos). FASE 1: construir el montículo (heapify) desde posición ${Math.floor(n / 2) - 1} hacia 0.`,
    pseudocodeLines: [0, 1, 2],
    highlightedNodes: [],
    treeSnapshot: snap(arr, n),
    phase: 'Inicio Heapsort',
    extra: { array: [...arr], heapSize: n },
  })

  // Phase 1: build heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    steps.push({
      id: id.v++,
      description: `Fase 1 — Hundir posición ${i} (valor ${arr[i]}).`,
      pseudocodeLines: [3, 4],
      highlightedNodes: [String(i)],
      treeSnapshot: snap(arr, n),
      phase: `Fase 1 — Build Heap`,
      extra: { array: [...arr], heapSize: n },
    })
    sinkSteps(arr, i, n, steps, id, [4])
  }

  steps.push({
    id: id.v++,
    description: `Montículo construido: [${arr.join(', ')}]. FASE 2: extraer el máximo n-1 veces, colocándolo al final.`,
    pseudocodeLines: [6, 7],
    highlightedNodes: ['0'],
    treeSnapshot: snap(arr, n),
    phase: 'Inicio Fase 2',
    extra: { array: [...arr], heapSize: n },
  })

  // Phase 2: extract
  for (let i = n - 1; i >= 1; i--) {
    steps.push({
      id: id.v++,
      description: `Fase 2 — Intercambiamos raíz H[0]=${arr[0]} con H[${i}]=${arr[i]}. El máximo va a la posición ${i} (ya ordenado).`,
      pseudocodeLines: [8],
      highlightedNodes: ['0', String(i)],
      treeSnapshot: snap(arr, i + 1),
      phase: `Fase 2 — Extraer máximo`,
      extra: { array: [...arr], heapSize: i + 1 },
    });
    [arr[0], arr[i]] = [arr[i], arr[0]]
    steps.push({
      id: id.v++,
      description: `Tras intercambio: [${arr.join(', ')}]. Montículo activo: posiciones 0..${i - 1}. Hundimos la nueva raíz.`,
      pseudocodeLines: [9],
      highlightedNodes: ['0'],
      treeSnapshot: snap(arr, i),
      phase: `Fase 2 — Hundir`,
      extra: { array: [...arr], heapSize: i },
    })
    sinkSteps(arr, 0, i, steps, id, [9])
  }

  steps.push({
    id: id.v++,
    description: `¡Heapsort completado! Array ordenado: [${arr.join(', ')}]`,
    pseudocodeLines: [],
    highlightedNodes: [],
    treeSnapshot: snap(arr, 0),
    result: `Ordenado: [${arr.join(', ')}]`,
    phase: 'Resumen',
    extra: { array: [...arr], heapSize: 0 },
  })

  return { sorted: arr, steps }
}

export function buildHeap(input: number[]): { heap: number[]; steps: Step[] } {
  const arr = [...input]
  const n = arr.length
  const steps: Step[] = []
  const id = { v: 0 }

  steps.push({
    id: id.v++,
    description: `Construir montículo desde [${arr.join(', ')}]. Hundimos desde la posición ${Math.floor(n / 2) - 1} hacia 0.`,
    pseudocodeLines: [0],
    highlightedNodes: [],
    treeSnapshot: snap(arr, n),
    phase: 'Build Heap',
    extra: { array: [...arr], heapSize: n },
  })

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    steps.push({
      id: id.v++,
      description: `Hundir posición ${i} (valor ${arr[i]}).`,
      pseudocodeLines: [3, 4],
      highlightedNodes: [String(i)],
      treeSnapshot: snap(arr, n),
      phase: 'Build Heap — Hundir',
      extra: { array: [...arr], heapSize: n },
    })
    sinkSteps(arr, i, n, steps, id, [4])
  }

  steps.push({
    id: id.v++,
    description: `Montículo construido: [${arr.join(', ')}]. La raíz (${arr[0]}) es el máximo.`,
    pseudocodeLines: [],
    highlightedNodes: ['0'],
    treeSnapshot: snap(arr, n),
    result: `Montículo: [${arr.join(', ')}]`,
    phase: 'Resumen',
    extra: { array: [...arr], heapSize: n },
  })

  return { heap: arr, steps }
}
