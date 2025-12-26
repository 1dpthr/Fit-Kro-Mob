import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './components/AuthContext'
import { Splash } from './components/Splash'
import { AuthScreen } from './components/AuthScreen'
import { Onboarding } from './components/Onboarding'
import { Dashboard } from './components/Dashboard'
import { WorkoutsScreen } from './components/WorkoutsScreen'
import { FoodScreen } from './components/FoodScreen'
import { PostureCheck } from './components/PostureCheck'
import { AICoach } from './components/AICoach'
import { ProgressScreen } from './components/ProgressScreen'
import { ProfileScreen } from './components/ProfileScreen'
import { BottomNav } from './components/BottomNav'
import { Button } from './components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Toaster } from './components/ui/sonner'

type AppState = 'splash' | 'auth' | 'onboarding' | 'app'

function AppContent() {
  const { user, loading } = useAuth()
  const [appState, setAppState] = useState<AppState>('splash')
  const [activeScreen, setActiveScreen] = useState('home')
  const [previousScreen, setPreviousScreen] = useState('home')
  const [onboardingData, setOnboardingData] = useState({ email: '', password: '' })

  useEffect(() => {
    if (!loading) {
      if (user) {
        setAppState('app')
      }
    }
  }, [user, loading])

  const handleSplashComplete = () => {
    setAppState('auth')
  }

  const handleAuthSuccess = (email?: string, password?: string) => {
    if (email && password) {
      // User is signing up, go to onboarding
      setOnboardingData({ email, password })
      setAppState('onboarding')
    } else {
      // User signed in, go to app
      setAppState('app')
    }
  }

  const handleOnboardingComplete = () => {
    setAppState('app')
  }

  const handleNavigate = (screen: string) => {
    setPreviousScreen(activeScreen)
    setActiveScreen(screen)
  }

  const handleBack = () => {
    setActiveScreen(previousScreen)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (appState === 'splash') {
    return <Splash onComplete={handleSplashComplete} />
  }

  if (appState === 'auth') {
    return <AuthScreen onSuccess={handleAuthSuccess} />
  }

  if (appState === 'onboarding') {
    return (
      <Onboarding
        email={onboardingData.email}
        password={onboardingData.password}
        onComplete={handleOnboardingComplete}
      />
    )
  }

  return (
    <div className="relative min-h-screen">
      {activeScreen === 'home' && <Dashboard onNavigate={handleNavigate} />}
      {activeScreen === 'workouts' && <WorkoutsScreen onNavigate={handleNavigate} />}
      {activeScreen === 'food' && <FoodScreen />}
      {activeScreen === 'posture' && <PostureCheck onBack={handleBack} />}
      {activeScreen === 'coach' && <AICoach onBack={handleBack} />}
      {activeScreen === 'progress' && <ProgressScreen />}
      {activeScreen === 'profile' && <ProfileScreen />}
      
      {/* Back Button for Special Screens */}
      {['posture', 'coach'].includes(activeScreen) && (
        <div className="fixed top-4 left-4 z-10">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="bg-white/90 backdrop-blur-sm shadow-lg"
          >
            <ArrowLeft className="size-5" />
          </Button>
        </div>
      )}
      
      {!['posture', 'coach'].includes(activeScreen) && (
        <BottomNav activeScreen={activeScreen} onNavigate={handleNavigate} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  )
}