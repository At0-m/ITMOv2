import { describe, it, expect } from 'vitest'
import {
  initialSelection,
  toggleSelection,
  deselect,
  resetSelection,
  isSelected,
  canCompare,
  hiddenSelectedIds,
  selectedPair,
} from '../src/compareSelection'

describe('compareSelection', () => {
  it('starts at 0/2', () => {
    const s = initialSelection()
    expect(s.ids).toEqual([])
    expect(canCompare(s)).toBe(false)
    expect(selectedPair(s)).toBeNull()
  })

  it('select first -> 1/2, compare not allowed', () => {
    const r = toggleSelection(initialSelection(), 'r34')
    expect(r.outcome).toBe('selected')
    expect(r.state.ids).toEqual(['r34'])
    expect(canCompare(r.state)).toBe(false)
  })

  it('select second -> 2/2, compare allowed', () => {
    const r = toggleSelection(toggleSelection(initialSelection(), 'r34').state, 'supra')
    expect(r.outcome).toBe('selected')
    expect(r.state.ids).toEqual(['r34', 'supra'])
    expect(canCompare(r.state)).toBe(true)
    expect(selectedPair(r.state)).toEqual(['r34', 'supra'])
  })

  it('third selection rejected and does not replace existing', () => {
    const two = toggleSelection(toggleSelection(initialSelection(), 'r34').state, 'supra').state
    const r = toggleSelection(two, 'rx7')
    expect(r.outcome).toBe('rejected')
    expect(r.state).toBe(two)
    expect(r.state.ids).toEqual(['r34', 'supra'])
    expect(isSelected(r.state, 'rx7')).toBe(false)
  })

  it('toggling a selected id deselects it', () => {
    const two = toggleSelection(toggleSelection(initialSelection(), 'r34').state, 'supra').state
    const r = toggleSelection(two, 'r34')
    expect(r.outcome).toBe('deselected')
    expect(r.state.ids).toEqual(['supra'])
  })

  it('deselect removes only the given id; unknown id is a no-op', () => {
    const two = toggleSelection(toggleSelection(initialSelection(), 'r34').state, 'supra').state
    expect(deselect(two, 'supra').ids).toEqual(['r34'])
    expect(deselect(two, 'rx7')).toBe(two)
  })

  it('same id never duplicates', () => {
    const one = toggleSelection(initialSelection(), 'r34').state
    expect(toggleSelection(one, 'r34').state.ids).toEqual([])
  })

  it('reset clears selection', () => {
    expect(resetSelection().ids).toEqual([])
  })

  it('preserves selection order, even after deselect + reselect', () => {
    let s = toggleSelection(initialSelection(), 'supra').state
    s = toggleSelection(s, 'r34').state
    expect(s.ids).toEqual(['supra', 'r34'])
    s = toggleSelection(s, 'supra').state
    s = toggleSelection(s, 'supra').state
    expect(s.ids).toEqual(['r34', 'supra'])
    expect(selectedPair(s)).toEqual(['r34', 'supra'])
  })

  it('does not mutate previous state', () => {
    const a = initialSelection()
    toggleSelection(a, 'r34')
    expect(a.ids).toEqual([])
  })

  it('hiddenSelectedIds reports selected ids not visible, without changing selection', () => {
    const s = toggleSelection(toggleSelection(initialSelection(), 'r34').state, 'supra').state
    expect(hiddenSelectedIds(s, ['supra', 'rx7'])).toEqual(['r34'])
    expect(hiddenSelectedIds(s, [])).toEqual(['r34', 'supra'])
    expect(hiddenSelectedIds(s, ['r34', 'supra'])).toEqual([])
    expect(s.ids).toEqual(['r34', 'supra'])
  })
})
