import { useEffect } from 'react'

type HotkeyMap = Record<string, (e: KeyboardEvent) => void>

/**
 * Register global keyboard shortcuts.
 * Ignores keypresses when focus is in INPUT or TEXTAREA.
 *
 * @param map - Record of key names (lowercase) to handler functions
 * @param deps - Dependency array for useEffect
 */
export function useHotkeys(map: HotkeyMap, deps: unknown[] = []) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const key = e.key.toLowerCase()
      if (map[key]) {
        e.preventDefault()
        map[key](e)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
