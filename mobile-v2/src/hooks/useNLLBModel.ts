/**
 * Hook useNLLBModel - Gestion téléchargement et état modèle NLLB
 * 
 * Gère :
 * - Téléchargement automatique au lancement app
 * - État du téléchargement (progress, erreurs)
 * - Cache permanent du modèle
 */

import { useState, useEffect, useCallback } from 'react';
import { initializeNLLB, isNLLBModelCached } from '../services/nllbService';

export interface NLLBModelState {
  isModelReady: boolean;
  isDownloading: boolean;
  downloadProgress: number; // 0-100
  error: string | null;
  downloadModel: () => Promise<void>;
  retryDownload: () => Promise<void>;
}

export function useNLLBModel(): NLLBModelState {
  const [isModelReady, setIsModelReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Télécharge et initialise le modèle NLLB
   */
  const downloadModel = useCallback(async () => {
    // Si déjà en cours ou prêt, ne rien faire
    if (isDownloading || isModelReady) {
      return;
    }

    setIsDownloading(true);
    setError(null);
    setDownloadProgress(0);

    try {
      // Simuler progression (Transformers.js ne donne pas de vraie progression)
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 2000);

      // Initialiser NLLB (télécharge le modèle si nécessaire)
      await initializeNLLB();

      // Téléchargement terminé
      clearInterval(progressInterval);
      setDownloadProgress(100);
      setIsModelReady(true);
      setIsDownloading(false);

      console.log('✅ NLLB model ready for use');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur téléchargement');
      setIsDownloading(false);
      setDownloadProgress(0);
      console.error('❌ Failed to download NLLB model:', err);
    }
  }, [isDownloading, isModelReady]);

  /**
   * Retry téléchargement en cas d'erreur
   */
  const retryDownload = useCallback(async () => {
    setError(null);
    setDownloadProgress(0);
    await downloadModel();
  }, [downloadModel]);

  /**
   * Vérifier au mount si modèle déjà en cache
   */
  useEffect(() => {
    const checkCache = () => {
      if (isNLLBModelCached()) {
        setIsModelReady(true);
        setDownloadProgress(100);
        console.log('✅ NLLB model already cached');
      }
    };

    checkCache();
  }, []);

  return {
    isModelReady,
    isDownloading,
    downloadProgress,
    error,
    downloadModel,
    retryDownload,
  };
}
