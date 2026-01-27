import React, { useState } from 'react'
import { FeatureFlagProvider } from './featureFlags/FeatureFlagContext'
import ColumnLayout from './components/ColumnLayout'
import SidePanel from './components/SidePanel'
import { useFeeds } from './hooks/useFeeds'
import type { Article } from './types'

// Force rebuild - v1.0.1
export default function App() {
  const { feeds, loading, error } = useFeeds()
  const [selected, setSelected] = useState<Article | null>(null)

  return (
    <FeatureFlagProvider>
      <div className="app-root" role="application" aria-label="DAKA News Terminal">
        <header className="app-header">
          <h1>DAKA News Terminal</h1>
          <p style={{marginLeft:12,color:'var(--muted)'}}>Comparative feeds — columns by country & source</p>
        </header>

        <main>
          {loading ? (
            <div role="status" aria-live="polite">Chargement des flux depuis le backend…</div>
          ) : error ? (
            <div role="alert" style={{color: 'red', padding: '20px'}}>
              ❌ Erreur: {error}. Vérifiez que le backend est démarré sur le port 4000.
            </div>
          ) : (
            <ColumnLayout feeds={feeds} onOpenArticle={setSelected} />
          )}
        </main>

        <SidePanel article={selected} onClose={() => setSelected(null)} />
      </div>
    </FeatureFlagProvider>
  )
}
