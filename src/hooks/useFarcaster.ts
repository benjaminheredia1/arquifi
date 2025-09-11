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
          
          // Intentar obtener datos del usuario
          try {
            const user = await sdk.user.getUser();
            setFarcasterUser(user);
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
    if (isFarcaster) {
      try {
        // Usar el SDK oficial para compartir
        await sdk.actions.share({
          text: text,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error compartiendo en Farcaster:', error);
        // Fallback a Warpcast
        const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
        window.open(shareUrl, '_blank');
      }
    } else {
      // Abrir Warpcast para compartir
      const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
      window.open(shareUrl, '_blank');
    }
  };

  return {
    isFarcaster,
    farcasterUser,
    isReady,
    shareToFarcaster
  };
};
