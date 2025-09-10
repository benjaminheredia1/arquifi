'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useEffect } from 'react'

interface NotificationToastProps {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  duration?: number
  onClose: (id: string) => void
}

export function NotificationToast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}: NotificationToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-500/30'
      case 'error':
        return 'border-red-500/30'
      case 'warning':
        return 'border-yellow-500/30'
      case 'info':
        return 'border-blue-500/30'
      default:
        return 'border-blue-500/30'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`glass-card p-4 border ${getBorderColor()} min-w-80 max-w-96`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white mb-1">
            {title}
          </h4>
          <p className="text-sm text-white/70 leading-relaxed">
            {message}
          </p>
        </div>
        
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>
      
      {/* Progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        className="absolute bottom-0 left-0 h-1 bg-white/20 rounded-full"
      />
    </motion.div>
  )
}

interface NotificationContainerProps {
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    title: string
    message: string
    duration?: number
  }>
  onClose: (id: string) => void
}

export function NotificationContainer({ notifications, onClose }: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            {...notification}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
