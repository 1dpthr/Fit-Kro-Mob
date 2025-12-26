import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { useAuth } from './AuthContext'
import { projectId } from '../utils/supabase/info'
import { TrendingDown, TrendingUp, Activity, Calendar, Plus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner@2.0.3'

interface WeightEntry {
  weight: number
  date: string
}

export const ProgressScreen: React.FC = () => {
  const { accessToken } = useAuth()
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([])
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [showAddWeight, setShowAddWeight] = useState(false)
  const [newWeight, setNewWeight] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch profile
      const profileRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae791a35/profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      const profileData = await profileRes.json()
      if (profileRes.ok) {
        setProfile(profileData.profile)
      }

      // Fetch weight history
      const weightRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae791a35/weight/history`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      const weightData = await weightRes.json()
      if (weightRes.ok) {
        setWeightHistory(weightData.weights || [])
      }

      // Fetch workout history
      const workoutRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae791a35/workouts/history`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      const workoutData = await workoutRes.json()
      if (workoutRes.ok) {
        setWorkoutHistory(workoutData.workouts || [])
      }
    } catch (error) {
      console.error('Error fetching progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addWeight = async () => {
    if (!newWeight || isNaN(Number(newWeight))) {
      toast.error('Please enter a valid weight')
      return
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae791a35/weight/log`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            weight: Number(newWeight),
            date: new Date().toISOString()
          }),
        }
      )

      if (response.ok) {
        toast.success('Weight logged successfully!')
        setShowAddWeight(false)
        setNewWeight('')
        fetchData()
      }
    } catch (error) {
      console.error('Error logging weight:', error)
      toast.error('Failed to log weight')
    }
  }

  const getWeightChange = () => {
    if (weightHistory.length < 2) return { change: 0, trend: 'stable' }
    
    const latest = weightHistory[weightHistory.length - 1].weight
    const initial = weightHistory[0].weight
    const change = latest - initial

    return {
      change: Math.abs(change).toFixed(1),
      trend: change < 0 ? 'down' : change > 0 ? 'up' : 'stable'
    }
  }

  const getChartData = () => {
    if (!weightHistory || weightHistory.length === 0) {
      // Return sample data if no history
      return [
        { date: 'Start', weight: profile?.weight || 70 }
      ]
    }
    return weightHistory.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: entry.weight
    }))
  }

  const calculateBMI = () => {
    if (!profile?.height || !profile?.weight) return null
    const heightInMeters = profile.height / 100
    return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1)
  }

  const getWeeklyWorkouts = () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    return workoutHistory.filter(w => 
      new Date(w.date) >= oneWeekAgo
    ).length
  }

  const getTotalCaloriesBurned = () => {
    return workoutHistory.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin size-8 border-4 border-red-600 border-t-transparent rounded-full mb-2"></div>
          <p className="text-gray-600">Loading progress...</p>
        </div>
      </div>
    )
  }

  const weightChange = getWeightChange()
  const bmi = calculateBMI()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-500 px-6 pt-12 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 left-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl mb-2 text-white">Progress</h2>
          <p className="text-white/90">Track your fitness journey</p>
        </div>
      </div>

      <div className="px-4 -mt-16 relative z-20 space-y-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="weight">Weight</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="size-4 text-blue-600" />
                    <p className="text-sm text-gray-600">This Week</p>
                  </div>
                  <p className="text-2xl">{getWeeklyWorkouts()}</p>
                  <p className="text-xs text-gray-500">workouts</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="size-4 text-orange-600" />
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                  <p className="text-2xl">{workoutHistory.length}</p>
                  <p className="text-xs text-gray-500">workouts</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    {weightChange.trend === 'down' ? (
                      <TrendingDown className="size-4 text-green-600" />
                    ) : (
                      <TrendingUp className="size-4 text-red-600" />
                    )}
                    <p className="text-sm text-gray-600">Weight</p>
                  </div>
                  <p className="text-2xl">
                    {weightChange.trend === 'down' ? '-' : '+'}
                    {weightChange.change} kg
                  </p>
                  <p className="text-xs text-gray-500">overall change</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="size-4 text-purple-600" />
                    <p className="text-sm text-gray-600">BMI</p>
                  </div>
                  <p className="text-2xl">{bmi || '—'}</p>
                  <p className="text-xs text-gray-500">
                    {bmi && Number(bmi) < 18.5 ? 'Underweight' : 
                     bmi && Number(bmi) < 25 ? 'Normal' : 
                     bmi && Number(bmi) < 30 ? 'Overweight' : 
                     bmi ? 'Obese' : 'N/A'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Body Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Body Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Height</span>
                  <span>{profile?.height || '—'} cm</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Current Weight</span>
                  <span>{profile?.weight || '—'} kg</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Goal</span>
                  <span className="capitalize">{profile?.goal === 'lose' ? 'Lose Weight' : profile?.goal === 'gain' ? 'Gain Muscle' : 'Maintain Fitness'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Workouts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Workouts</CardTitle>
                <CardDescription>Your latest training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {workoutHistory.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No workouts logged yet</p>
                ) : (
                  <div className="space-y-2">
                    {workoutHistory.slice(-5).reverse().map((workout, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p>Workout</p>
                          <p className="text-xs text-gray-600">
                            {new Date(workout.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p>{workout.duration} min</p>
                          <p className="text-xs text-gray-600">{workout.caloriesBurned} kcal</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weight" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Weight Progress</CardTitle>
                    <CardDescription>Track your weight over time</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddWeight(true)} size="sm">
                    <Plus className="mr-2 size-4" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {weightHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No weight entries yet</p>
                    <Button onClick={() => setShowAddWeight(true)}>
                      Log Your First Weight
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="h-64 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2">
                      <h4 className="mb-2">Weight History</h4>
                      {weightHistory.slice().reverse().map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                          <span>{entry.weight} kg</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom spacing for nav bar */}
        <div className="h-24"></div>
      </div>

      {/* Add Weight Dialog */}
      <Dialog open={showAddWeight} onOpenChange={setShowAddWeight}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Weight</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="70.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
              />
            </div>
            <Button onClick={addWeight} className="w-full">
              Save Weight
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}