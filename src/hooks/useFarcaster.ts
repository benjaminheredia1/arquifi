import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export const useFarcaster = () => {
  const [isFarcaster, setIsFarcaster] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        // Detectar si estamos en Farcaster
        const isInFarcaster = window.parent !== window || 
                             window.location.href.includes('farcaster') ||
                             document.referrer.includes('farcaster') ||
                             navigator.userAgent.includes('Farcaster');
        
        setIsFarcaster(isInFarcaster);
        
        if (isInFarcaster) {
          // Inicializar el SDK de Farcaster
          await sdk.actions.ready();
          setIsReady(true);
          
          // Intentar obtener datos del usuario (si está disponible)
          try {
            // El SDK de Farcaster puede tener diferentes APIs según la versión
            // Por ahora, solo inicializamos el SDK sin obtener datos del usuario
            console.log('Farcaster SDK inicializado correctamente');
          } catch (error) {
            console.log('No se pudo obtener datos del usuario:', error);
          }
        } else {
          setIsReady(true);
        }
      } catch (error) {
        console.error('Error inicializando Farcaster SDK:', error);
        setIsReady(true);
      }
    };

    initializeFarcaster();
  }, []);

  const shareToFarcaster = async (text: string) => {
    // Por ahora, siempre usar Warpcast para compartir
    // El SDK de Farcaster puede no tener la función share disponible
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  return {
    isFarcaster,
    farcasterUser,
    isReady,
    shareToFarcaster
  };
};
