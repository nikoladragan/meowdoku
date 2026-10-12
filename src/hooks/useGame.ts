import { useCallback, useReducer } from 'react'
import { createGameState, reducer } from '../game/reducer'
import type { Difficulty, GameState, Mode, Puzzle } from '../game/types'

export function useGame(initial: () => GameState) {
  const [state, dispatch] = useReducer(reducer, undefined, initial)

  const start = useCallback(
    (mode: Mode, difficulty: Difficulty, puzzle: Puzzle) =>
      dispatch({ type: 'start', state: createGameState(mode, difficulty, puzzle) }),
    [],
  )
  const toggleCross = useCallback((cell: number) => dispatch({ type: 'toggleCross', cell }), [])
  const placeCat = useCallback(
    (cell: number) => dispatch({ type: 'placeCat', cell, fromDoubleTap: true }),
    [],
  )
  const retry = useCallback(() => dispatch({ type: 'retry' }), [])

  return { state, start, toggleCross, placeCat, retry }
}
