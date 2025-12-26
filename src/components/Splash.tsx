import React, { useEffect } from 'react'
import { Dumbbell } from 'lucide-react'

interface SplashProps {
  onComplete: () => void
}

export const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-500 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="text-center relative z-10">
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 rounded-[2rem] blur-xl"></div>
            <div className="relative p-8 bg-white rounded-[2rem] shadow-2xl transform hover:scale-105 transition-transform">
              <Dumbbell className="size-20 text-sky-500 animate-pulse" />
            </div>
          </div>
        </div>
        <h1 className="text-6xl text-white mb-3 tracking-tight">Fit Kro</h1>
        <p className="text-2xl text-white/95 mb-2">Train Smart. Eat Smart.</p>
        <p className="text-lg text-white/80">Your Personal Fitness Journey</p>
        <div className="mt-10 flex gap-3 justify-center">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}