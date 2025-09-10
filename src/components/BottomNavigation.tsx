'use client'

import { motion } from 'framer-motion'
import { Home, Ticket, Trophy, User, DollarSign } from 'lucide-react'

interface BottomNavigationProps {
  currentSection: string
  onSectionChange: (section: string) => void
}

export function BottomNavigation({ currentSection, onSectionChange }: BottomNavigationProps) {
  const navItems = [
    {
      id: 'home',
      label: 'Inicio',
      icon: Home
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: Ticket
    },
    {
      id: 'economy',
      label: 'KOKI',
      icon: DollarSign
    },
    {
      id: 'results',
      label: 'Resultados',
      icon: Trophy
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: User
    }
  ]

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="fixed bottom-0 left-0 right-0 z-30 glass-card border-t border-white/10"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = currentSection === item.id
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSectionChange(item.id)}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'text-primary-400'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    rotate: isActive ? 5 : 0
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <item.icon className="w-5 h-5" />
                </motion.div>
                <span className="text-xs font-medium">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary-400 rounded-full"
                    initial={false}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}
