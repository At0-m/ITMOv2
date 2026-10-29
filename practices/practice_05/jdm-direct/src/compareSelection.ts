// Pure selection logic for Featured JDM compare (no DOM).
// Selection is an ordered list of at most MAX_SELECTED car ids; order = order of selection.

export const MAX_SELECTED = 2

export interface SelectionState {
  readonly ids: readonly string[]
}

export type ToggleOutcome = 'selected' | 'deselected' | 'rejected'

export interface ToggleResult {
  state: SelectionState
  outcome: ToggleOutcome
}

export function initialSelection(): SelectionState {
  return { ids: [] }
}

// Toggle: already selected -> deselect; room left -> select (appended);
// full -> rejected, existing selection is returned untouched (never replaced).
export function toggleSelection(state: SelectionState, id: string): ToggleResult {
  if (state.ids.includes(id)) {
    return { state: { ids: state.ids.filter((x) => x !== id) }, outcome: 'deselected' }
  }
  if (state.ids.length >= MAX_SELECTED) {
    return { state, outcome: 'rejected' }
  }
  return { state: { ids: [...state.ids, id] }, outcome: 'selected' }
}

export function deselect(state: SelectionState, id: string): SelectionState {
  return state.ids.includes(id) ? { ids: state.ids.filter((x) => x !== id) } : state
}

export function resetSelection(): SelectionState {
  return initialSelection()
}

export function isSelected(state: SelectionState, id: string): boolean {
  return state.ids.includes(id)
}

export function canCompare(state: SelectionState): boolean {
  return state.ids.length === MAX_SELECTED
}

// Selected ids that are not among the currently visible ids (budget filter). Does not mutate selection.
export function hiddenSelectedIds(state: SelectionState, visibleIds: readonly string[]): string[] {
  return state.ids.filter((id) => !visibleIds.includes(id))
}

// Selection narrowed to the exact pair accepted by the compare API, or null unless 2/2.
export function selectedPair(state: SelectionState): [string, string] | null {
  return canCompare(state) ? [state.ids[0], state.ids[1]] : null
}
