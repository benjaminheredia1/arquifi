import { useState, useEffect } from 'react';

export const useFarcaster = () => {
  const [isFarcaster, setIsFarcaster] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState<any>(null);

  useEffect(() => {
    // Detectar si estamos en Farcaster
    const checkFarcaster = () => {
      // Verificar si estamos en un iframe de Farcaster
      const isInFarcaster = window.parent !== window || 
                           window.location.href.includes('farcaster') ||
                           document.referrer.includes('farcaster') ||
                           navigator.userAgent.includes('Farcaster');
      
      setIsFarcaster(isInFarcaster);
      
      // Si estamos en Farcaster, intentar obtener datos del usuario
      if (isInFarcaster) {
        // Escuchar mensajes de Farcaster
        const handleMessage = (event: MessageEvent) => {
          if (event.data?.type === 'farcaster:user') {
            setFarcasterUser(event.data.user);
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Solicitar datos del usuario
        window.parent.postMessage({ type: 'farcaster:requestUser' }, '*');
        
        return () => window.removeEventListener('message', handleMessage);
      }
    };

    checkFarcaster();
  }, []);

  const shareToFarcaster = (text: string) => {
    if (isFarcaster) {
      // Compartir en Farcaster
      window.parent.postMessage({ 
        type: 'farcaster:share', 
        text: text 
      }, '*');
    } else {
      // Abrir Warpcast para compartir
      const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
      window.open(shareUrl, '_blank');
    }
  };

  return {
    isFarcaster,
    farcasterUser,
    shareToFarcaster
  };
};
