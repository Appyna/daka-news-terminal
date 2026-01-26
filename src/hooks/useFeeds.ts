import { useEffect, useState } from 'react'
import type { Feed } from '../types'
import { fetchAllFeeds } from '../services/apiService'

/**
 * Hook pour charger tous les feeds depuis le backend
 * Rafraîchit automatiquement toutes les 3 minutes
 */
export function useFeeds(){
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isSubscribed = true
    
    async function load() {
      try {
        setLoading(true)
        setError(null)
        
        const data = await fetchAllFeeds()
        
        if (isSubscribed) {
          setFeeds(data)
          console.log(`✅ ${data.length} feeds chargés depuis le backend`)
        }
      } catch (err) {
        console.error('❌ Erreur chargement feeds:', err)
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : 'Erreur inconnue')
        }
      } finally {
        if (isSubscribed) {
          setLoading(false)
        }
      }
    }

    // Chargement initial
    load()
    
    // Rafraîchissement automatique toutes les 3 minutes
    const interval = setInterval(load, 3 * 60 * 1000)
    
    return () => {
      isSubscribed = false
      clearInterval(interval)
    }
  }, [])

  return { feeds, loading, error }
}
