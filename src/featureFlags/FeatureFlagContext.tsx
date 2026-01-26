import React, { createContext, useContext } from 'react'

type Flags = {
  externalFeeds: boolean
}

const defaultFlags: Flags = {
  externalFeeds: false
}

const FeatureFlagContext = createContext<Flags>(defaultFlags)

export const FeatureFlagProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Read flags from Vite environment variables (VITE_EXTERNAL_FEEDS)
  // Use 'true' string to enable.
  const externalFeeds = import.meta.env.VITE_EXTERNAL_FEEDS === 'true'

  const flags: Flags = {
    externalFeeds
  }
  return <FeatureFlagContext.Provider value={flags}>{children}</FeatureFlagContext.Provider>
}

export const useFeatureFlags = () => useContext(FeatureFlagContext)
