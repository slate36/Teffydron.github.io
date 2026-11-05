import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react'
import type { AppState, AppAction } from '@/types'
import { appReducer, loadState, saveState } from './reducer'

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  const stableDispatch = useCallback(dispatch, [dispatch])

  return (
    <AppContext.Provider value={{ state, dispatch: stableDispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppState(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used inside AppProvider')
  return ctx.state
}

export function useAppDispatch(): React.Dispatch<AppAction> {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppDispatch must be used inside AppProvider')
  return ctx.dispatch
}
