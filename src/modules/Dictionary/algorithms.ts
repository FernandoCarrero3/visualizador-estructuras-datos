import { Step } from '../../types/step'

export interface DictEntry {
  key: number
  value: string
}

export type HashTable = DictEntry[][]

export const HASH_INSERT_PSEUDO = [
  'procedimiento insertar(T, k, v)',
  '  inicio',
  '    i ← h(k)           // calcular posición',
  '    buscar k en T[i]   // ¿ya existe?',
  '    si encontrado entonces',
  '      T[i][k].valor ← v  // actualizar',
  '    sino',
  '      T[i] ← T[i] ∪ {(k,v)}  // añadir al final',
  '    fsi',
  '  fin',
]

export const HASH_SEARCH_PSEUDO = [
  'función buscar(T, k)',
  '  inicio',
  '    i ← h(k)           // calcular posición',
  '    recorrer T[i] buscando k',
  '    si encontrado entonces',
  '      devolver T[i][k].valor',
  '    sino',
  '      devolver NO_ENCONTRADO',
  '    fsi',
  '  fin',
]

export const HASH_DELETE_PSEUDO = [
  'procedimiento eliminar(T, k)',
  '  inicio',
  '    i ← h(k)           // calcular posición',
  '    buscar k en T[i]',
  '    si encontrado entonces',
  '      T[i] ← T[i] \\ {k}  // eliminar de la lista',
  '    sino',
  '      // clave no existe',
  '    fsi',
  '  fin',
]

export function makeTable(m: number): HashTable {
  return Array.from({ length: m }, () => [])
}

export function hashFn(key: number, m: number): number {
  return ((key % m) + m) % m
}

export function hashInsert(
  table: HashTable,
  key: number,
  value: string
): { table: HashTable; steps: Step[] } {
  const m = table.length
  const t: HashTable = table.map(slot => [...slot])
  const steps: Step[] = []
  let id = 0

  const slot = hashFn(key, m)

  steps.push({
    id: id++,
    description: `Insertar clave ${key}. Calculamos h(${key}) = ${key} mod ${m} = ${slot}. Iremos a la cubeta (slot) ${slot}.`,
    pseudocodeLines: [2],
    treeSnapshot: { root: null },
    phase: 'Hash',
    extra: { table: t.map(s => [...s]), highlightedSlot: slot },
  })

  const existing = t[slot].findIndex(e => e.key === key)

  steps.push({
    id: id++,
    description: `Recorremos la lista de la cubeta ${slot}: [${t[slot].map(e => `(${e.key},"${e.value}")`).join(', ') || 'vacía'}]. ¿Existe ya la clave ${key}?`,
    pseudocodeLines: [3],
    treeSnapshot: { root: null },
    phase: 'Buscar en cadena',
    extra: { table: t.map(s => [...s]), highlightedSlot: slot },
  })

  if (existing !== -1) {
    const old = t[slot][existing].value
    t[slot][existing] = { key, value }
    steps.push({
      id: id++,
      description: `Clave ${key} ya existe con valor "${old}" → se ACTUALIZA a "${value}".`,
      pseudocodeLines: [5],
      treeSnapshot: { root: null },
      phase: 'Actualizar',
      result: `Clave ${key} actualizada: "${old}" → "${value}"`,
      extra: { table: t.map(s => [...s]), highlightedSlot: slot, highlightedKey: key },
    })
  } else {
    t[slot].push({ key, value })
    steps.push({
      id: id++,
      description: `Clave ${key} no existe en la cubeta ${slot} → se AÑADE al final de la cadena. Nueva cadena: [${t[slot].map(e => `(${e.key},"${e.value}")`).join(', ')}]`,
      pseudocodeLines: [7],
      treeSnapshot: { root: null },
      phase: 'Insertar en cadena',
      result: `(${key}, "${value}") insertado en cubeta ${slot}`,
      extra: { table: t.map(s => [...s]), highlightedSlot: slot, highlightedKey: key },
    })
  }

  return { table: t, steps }
}

export function hashSearch(
  table: HashTable,
  key: number
): { steps: Step[]; found: boolean; value?: string } {
  const m = table.length
  const steps: Step[] = []
  let id = 0

  const slot = hashFn(key, m)

  steps.push({
    id: id++,
    description: `Buscar clave ${key}. h(${key}) = ${key} mod ${m} = ${slot}. Accedemos a la cubeta ${slot}.`,
    pseudocodeLines: [2],
    treeSnapshot: { root: null },
    phase: 'Hash',
    extra: { table: table.map(s => [...s]), highlightedSlot: slot },
  })

  const chain = table[slot]

  for (let i = 0; i < chain.length; i++) {
    steps.push({
      id: id++,
      description: `Comparamos k=${key} con el elemento ${i} de la cadena: (${chain[i].key}, "${chain[i].value}").${chain[i].key === key ? ' ¡ENCONTRADO!' : ' No coincide, siguiente.'}`,
      pseudocodeLines: [3],
      treeSnapshot: { root: null },
      phase: 'Recorrer cadena',
      extra: { table: table.map(s => [...s]), highlightedSlot: slot, highlightedKey: chain[i].key, highlightedIdx: i },
    })
    if (chain[i].key === key) {
      steps.push({
        id: id++,
        description: `Clave ${key} encontrada en cubeta ${slot}, posición ${i}. Valor: "${chain[i].value}".`,
        pseudocodeLines: [5],
        treeSnapshot: { root: null },
        phase: 'Encontrado',
        result: `Clave ${key} → "${chain[i].value}"`,
        extra: { table: table.map(s => [...s]), highlightedSlot: slot, highlightedKey: key },
      })
      return { steps, found: true, value: chain[i].value }
    }
  }

  steps.push({
    id: id++,
    description: `Clave ${key} NO encontrada en la cubeta ${slot} (cadena recorrida completamente).`,
    pseudocodeLines: [7],
    treeSnapshot: { root: null },
    phase: 'No encontrado',
    result: `Clave ${key} no existe`,
    extra: { table: table.map(s => [...s]), highlightedSlot: slot },
  })

  return { steps, found: false }
}

export function hashDelete(
  table: HashTable,
  key: number
): { table: HashTable; steps: Step[]; deleted: boolean } {
  const m = table.length
  const t: HashTable = table.map(slot => [...slot])
  const steps: Step[] = []
  let id = 0

  const slot = hashFn(key, m)

  steps.push({
    id: id++,
    description: `Eliminar clave ${key}. h(${key}) = ${key} mod ${m} = ${slot}. Accedemos a la cubeta ${slot}.`,
    pseudocodeLines: [2],
    treeSnapshot: { root: null },
    phase: 'Hash',
    extra: { table: t.map(s => [...s]), highlightedSlot: slot },
  })

  const idx = t[slot].findIndex(e => e.key === key)

  steps.push({
    id: id++,
    description: `Buscamos clave ${key} en la cadena de la cubeta ${slot}: [${t[slot].map(e => `(${e.key})`).join(' → ') || 'vacía'}].`,
    pseudocodeLines: [3],
    treeSnapshot: { root: null },
    phase: 'Buscar en cadena',
    extra: { table: t.map(s => [...s]), highlightedSlot: slot },
  })

  if (idx !== -1) {
    const removed = t[slot][idx]
    t[slot].splice(idx, 1)
    steps.push({
      id: id++,
      description: `Clave ${key} encontrada en posición ${idx} de la cadena → ELIMINADA. Cadena resultante: [${t[slot].map(e => `(${e.key})`).join(' → ') || 'vacía'}]`,
      pseudocodeLines: [5],
      treeSnapshot: { root: null },
      phase: 'Eliminar',
      result: `(${removed.key}, "${removed.value}") eliminado de cubeta ${slot}`,
      extra: { table: t.map(s => [...s]), highlightedSlot: slot },
    })
    return { table: t, steps, deleted: true }
  }

  steps.push({
    id: id++,
    description: `Clave ${key} no existe en la cubeta ${slot}. Nada que eliminar.`,
    pseudocodeLines: [7],
    treeSnapshot: { root: null },
    phase: 'No encontrado',
    result: `Clave ${key} no existe`,
    extra: { table: t.map(s => [...s]), highlightedSlot: slot },
  })

  return { table: t, steps, deleted: false }
}
