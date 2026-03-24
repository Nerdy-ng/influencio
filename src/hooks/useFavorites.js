import { useState, useCallback } from 'react'

const KEY = 'brandior_favorites'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(load)

  const toggle = useCallback((talent) => {
    setFavorites(prev => {
      const id = talent._id || talent.id
      const exists = prev.some(f => (f._id || f.id) === id)
      const next = exists ? prev.filter(f => (f._id || f.id) !== id) : [...prev, talent]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFav = useCallback((id) => {
    return favorites.some(f => (f._id || f.id) === id)
  }, [favorites])

  return { favorites, toggle, isFav }
}
