import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { useAuth } from './AuthContext'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { Flame, TrendingUp, Footprints, Dumbbell, Camera, MessageCircle, UtensilsCrossed, Activity } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface DashboardProps {
  onNavigate: (screen: string) => void
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, accessToken } = useAuth()
  const [stats, setStats] = useState({
    caloriesConsumed: 0,
    caloriesBurned: 0,
    workoutCompleted: false,
    steps: 0
  })
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae791a35/stats`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      } else {
        console.error('Failed to fetch stats:', await statsRes.text())
      }

      // Fetch profile
      const profileRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae791a35/profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData.profile)
      } else {
        console.error('Failed to fetch profile:', await profileRes.text())
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getDailyTip = () => {
    const tips = [
      '💧 Stay hydrated! Aim for 8 glasses of water today.',
      '🏃 Even 10 minutes of movement counts!',
      '🥗 Fill half your plate with vegetables.',
      '😴 Quality sleep is crucial for recovery.',
      '💪 Consistency beats perfection every time.',
      '🧘 Don\'t forget to stretch after workouts.',
    ]
    return tips[new Date().getDate() % tips.length]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-500 px-6 pt-12 pb-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 left-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl mb-2 text-white">{getGreeting()}</h2>
          <p className="text-xl text-white/90">{profile?.name || 'Friend'} 👋</p>
          <p className="text-white/80 mt-1">Let's crush your goals today!</p>
        </div>
      </div>

      {/* Stats Cards with overlap */}
      <div className="px-4 -mt-24 relative z-20 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all hover:scale-105 duration-300">
            <CardContent className="p-5">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl shadow-lg">
                    <Flame className="size-6 text-white" />
                  </div>
                  <div className="text-xs font-medium text-muted-foreground bg-rose-50 px-2 py-1 rounded-full">Today</div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Consumed</p>
                  <p className="text-3xl text-foreground tracking-tight">{stats.caloriesConsumed}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all hover:scale-105 duration-300">
            <CardContent className="p-5">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-500 rounded-2xl shadow-lg">
                    <TrendingUp className="size-6 text-white" />
                  </div>
                  <div className="text-xs font-medium text-muted-foreground bg-sky-50 px-2 py-1 rounded-full">Today</div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Burned</p>
                  <p className="text-3xl text-foreground tracking-tight">{stats.caloriesBurned}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all hover:scale-105 duration-300">
            <CardContent className="p-5">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl shadow-lg">
                    <Footprints className="size-6 text-white" />
                  </div>
                  <div className="text-xs font-medium text-muted-foreground bg-violet-50 px-2 py-1 rounded-full">Today</div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Steps</p>
                  <p className="text-3xl text-foreground tracking-tight">{stats.steps.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">steps</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all hover:scale-105 duration-300">
            <CardContent className="p-5">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                    <Dumbbell className="size-6 text-white" />
                  </div>
                  <div className="text-xs font-medium text-muted-foreground bg-emerald-50 px-2 py-1 rounded-full">Today</div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Workout</p>
                  <p className="text-3xl text-foreground tracking-tight">{stats.workoutCompleted ? '✓' : '—'}</p>
                  <p className="text-xs text-muted-foreground">status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Tip */}
        <Card className="bg-primary text-primary-foreground shadow-sm border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-primary-foreground text-lg">💡 Daily Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-primary-foreground/90">{getDailyTip()}</p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => onNavigate('food')}
              className="h-auto py-4 flex flex-col items-center gap-2 bg-white border-2 border-border hover:border-primary hover:bg-primary/5 text-foreground"
              variant="outline"
            >
              <UtensilsCrossed className="size-6" />
              <span>Log Food</span>
            </Button>

            <Button
              onClick={() => onNavigate('workouts')}
              className="h-auto py-4 flex flex-col items-center gap-2 bg-white border-2 border-border hover:border-primary hover:bg-primary/5 text-foreground"
              variant="outline"
            >
              <Dumbbell className="size-6" />
              <span>Start Workout</span>
            </Button>

            <Button
              onClick={() => onNavigate('posture')}
              className="h-auto py-4 flex flex-col items-center gap-2 bg-white border-2 border-border hover:border-primary hover:bg-primary/5 text-foreground"
              variant="outline"
            >
              <Camera className="size-6" />
              <span>Check Posture</span>
            </Button>

            <Button
              onClick={() => onNavigate('coach')}
              className="h-auto py-4 flex flex-col items-center gap-2 bg-white border-2 border-border hover:border-primary hover:bg-primary/5 text-foreground"
              variant="outline"
            >
              <MessageCircle className="size-6" />
              <span>AI Coach</span>
            </Button>
          </CardContent>
        </Card>

        {/* Bottom spacing for nav bar */}
        <div className="h-24"></div>
      </div>
    </div>
  )
}