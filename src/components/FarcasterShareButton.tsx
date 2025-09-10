import React from 'react';
import { useFarcaster } from '../hooks/useFarcaster';

interface FarcasterShareButtonProps {
  text: string;
  className?: string;
  children?: React.ReactNode;
}

export const FarcasterShareButton: React.FC<FarcasterShareButtonProps> = ({ 
  text, 
  className = "",
  children 
}) => {
  const { isFarcaster, shareToFarcaster } = useFarcaster();

  // Solo mostrar el botón si estamos en Farcaster o si el usuario quiere compartir
  if (!isFarcaster && !children) {
    return null;
  }

  const handleShare = () => {
    shareToFarcaster(text);
  };

  return (
    <button
      onClick={handleShare}
      className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors ${className}`}
    >
      {children || (isFarcaster ? "Compartir en Farcaster" : "Compartir en Warpcast")}
    </button>
  );
};
