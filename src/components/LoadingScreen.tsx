'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'

interface LoadingScreenProps {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentText, setCurrentText] = useState('')

  const loadingTexts = useMemo(() => [
    'Inicializando ArquiFI Lottery...',
    'Conectando con Base Network...',
    'Cargando smart contracts...',
    'Preparando interfaz de usuario...',
    'Sincronizando datos...',
    '¡Casi listo!'
  ], [])

  useEffect(() => {
    // Inicializar con el primer texto
    setCurrentText(loadingTexts[0])
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 300)
          return 100
        }
        return prev + 3
      })
    }, 60)

    const textInterval = setInterval(() => {
      setCurrentText(prev => {
        const currentIndex = loadingTexts.findIndex(text => text === prev)
        const nextIndex = (currentIndex + 1) % loadingTexts.length
        return loadingTexts[nextIndex]
      })
    }, 600)

    return () => {
      clearInterval(interval)
      clearInterval(textInterval)
    }
  }, [onComplete, loadingTexts])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 z-50 flex items-center justify-center"
    >
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Modern Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-32 h-32 mx-auto bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center"
            >
              <span className="text-2xl text-white font-bold">K</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg"
        >
          ArquiFI Lottery
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-xl md:text-2xl text-white/80 mb-8 drop-shadow-md"
        >
          La lotería descentralizada más avanzada
        </motion.p>

        {/* Loading Text */}
        <motion.div
          key={currentText}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-lg text-white/80 mb-8 min-h-[2rem]"
        >
          {currentText}
        </motion.div>

        {/* Progress Bar */}
        <div className="w-80 mx-auto mb-4">
          <div className="bg-white/10 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-white/20">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full relative"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            >
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>

        {/* Progress Percentage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-white/70 text-sm"
        >
          {progress}%
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute -top-10 -left-10">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-4 h-4 bg-blue-400/30 rounded-full blur-sm"
          />
        </div>

        <div className="absolute -top-10 -right-10">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            className="w-6 h-6 bg-purple-400/30 rounded-full blur-sm"
          />
        </div>

        <div className="absolute -bottom-10 -left-10">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 2 }}
            className="w-5 h-5 bg-indigo-400/30 rounded-full blur-sm"
          />
        </div>

        <div className="absolute -bottom-10 -right-10">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            className="w-3 h-3 bg-cyan-400/30 rounded-full blur-sm"
          />
        </div>
      </div>
    </motion.div>
  )
}
