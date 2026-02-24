/**
 * Hook useMLKitModel - Gestion état ML Kit Translation
 * 
 * Note: ML Kit télécharge les modèles automatiquement au premier usage
 * Ce hook sert juste à afficher l'état à l'utilisateur
 */

import { useState, useEffect, useCallback } from 'react';
import { initializeMLKit } from '../services/nllbService';

export interface MLKitModelState {
  isModelReady: boolean;
  isDownloading: boolean;
  downloadProgress: number; // 0-100
  error: string | null;
  retryDownload: () => Promise<void>;
}

export function useNLLBModel(): MLKitModelState {
  const [isModelReady, setIsModelReady] = useState(true); // Toujours prêt (téléchargement auto)
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(100); // 100% car auto
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialise ML Kit au mount
   */
  useEffect(() => {
    const init = async () => {
      try {
        await initializeMLKit();
        console.log('✅ ML Kit initialized (models will download on first use)');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur initialisation');
        console.error('❌ Failed to initialize ML Kit:', err);
      }
    };

    init();
  }, []);

  /**
   * Retry en cas d'erreur
   */
  const retryDownload = useCallback(async () => {
    setError(null);
    try {
      await initializeMLKit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur initialisation');
    }
  }, []);

  return {
    isModelReady,
    isDownloading,
    downloadProgress,
    error,
    retryDownload,
  };
}
