import React from 'react'
import { Home, Dumbbell, UtensilsCrossed, TrendingUp, User } from 'lucide-react'

interface BottomNavProps {
  activeScreen: string
  onNavigate: (screen: string) => void
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'food', label: 'Food', icon: UtensilsCrossed },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-border/50 safe-area-bottom shadow-2xl z-50">
      <div className="flex items-center justify-around px-4 py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeScreen === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-2.5 px-2 rounded-2xl transition-all duration-300 ${ 
                isActive 
                  ? 'text-white bg-gradient-to-br from-sky-500 to-blue-500 scale-105 shadow-lg' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-sky-50'
              }`}
            >
              <Icon className={`size-6 mb-1 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}