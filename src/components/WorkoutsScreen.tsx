import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { useAuth } from './AuthContext'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { Clock, Flame, TrendingUp, Play, Check, Camera } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface Workout {
  id: string
  name: string
  category: string
  duration: number
  difficulty: string
  caloriesEstimate: number
  exercises: Array<{
    name: string
    reps?: number
    sets?: number
    duration?: number
  }>
}

interface WorkoutsScreenProps {
  onNavigate: (screen: string) => void
}

export const WorkoutsScreen: React.FC<WorkoutsScreenProps> = ({ onNavigate }) => {
  const { accessToken } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const fetchWorkouts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae791a35/workouts`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      )
      const data = await response.json()
      if (response.ok) {
        setWorkouts(data.workouts)
      }
    } catch (error) {
      console.error('Error fetching workouts:', error)
      toast.error('Failed to load workouts')
    } finally {
      setLoading(false)
    }
  }

  const startWorkout = (workout: Workout) => {
    setSelectedWorkout(workout)
    setIsPlaying(true)
    setCurrentExerciseIndex(0)
    setWorkoutStartTime(Date.now())
    toast.success(`Started: ${workout.name}`)
  }

  const nextExercise = () => {
    if (selectedWorkout && currentExerciseIndex < selectedWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
    } else {
      completeWorkout()
    }
  }

  const completeWorkout = async () => {
    if (!selectedWorkout || !workoutStartTime) return

    const duration = Math.floor((Date.now() - workoutStartTime) / 1000 / 60) // minutes
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae791a35/workouts/log`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            workoutId: selectedWorkout.id,
            duration,
            caloriesBurned: selectedWorkout.caloriesEstimate,
            exercises: selectedWorkout.exercises,
            date: new Date().toISOString()
          }),
        }
      )

      if (response.ok) {
        toast.success('🎉 Workout completed! Great job!')
      }
    } catch (error) {
      console.error('Error logging workout:', error)
      toast.error('Failed to save workout')
    } finally {
      setIsPlaying(false)
      setSelectedWorkout(null)
      setCurrentExerciseIndex(0)
      setWorkoutStartTime(null)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
          <p className="text-muted-foreground">Loading workouts...</p>
        </div>
      </div>
    )
  }

  const currentExercise = selectedWorkout?.exercises[currentExerciseIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-500 px-6 pt-12 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 left-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl mb-2 text-white">Workouts</h2>
          <p className="text-white/90">Choose a workout to get started</p>
        </div>
      </div>

      <div className="px-4 -mt-16 relative z-20">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="gym">Gym</TabsTrigger>
            <TabsTrigger value="cardio">Cardio</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onStart={startWorkout}
                getDifficultyColor={getDifficultyColor}
              />
            ))}
          </TabsContent>

          <TabsContent value="home" className="space-y-4 mt-4">
            {workouts.filter(w => w.category === 'Home').map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onStart={startWorkout}
                getDifficultyColor={getDifficultyColor}
              />
            ))}
          </TabsContent>

          <TabsContent value="gym" className="space-y-4 mt-4">
            {workouts.filter(w => w.category === 'Gym').map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onStart={startWorkout}
                getDifficultyColor={getDifficultyColor}
              />
            ))}
          </TabsContent>

          <TabsContent value="cardio" className="space-y-4 mt-4">
            {workouts.filter(w => w.category === 'Cardio').map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onStart={startWorkout}
                getDifficultyColor={getDifficultyColor}
              />
            ))}
          </TabsContent>
        </Tabs>

        {/* Bottom spacing for nav bar */}
        <div className="h-24"></div>
      </div>

      {/* Workout Player Dialog */}
      <Dialog open={isPlaying} onOpenChange={setIsPlaying}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedWorkout?.name}</DialogTitle>
            <DialogDescription>
              Exercise {currentExerciseIndex + 1} of {selectedWorkout?.exercises.length}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Exercise Display */}
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <h3 className="text-2xl mb-4">{currentExercise?.name}</h3>
              
              {currentExercise?.reps && (
                <div className="space-y-1">
                  <p className="text-4xl">{currentExercise.reps}</p>
                  <p className="text-gray-600">reps × {currentExercise.sets} sets</p>
                </div>
              )}
              
              {currentExercise?.duration && (
                <div className="space-y-1">
                  <p className="text-4xl">{currentExercise.duration}s</p>
                  <p className="text-gray-600">× {currentExercise.sets} sets</p>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  💡 <strong>Tip:</strong> Maintain proper form throughout the exercise. Take breaks between sets if needed.
                </p>
              </div>
            </div>

            {/* Posture Check Button */}
            <Button
              variant="outline"
              onClick={() => {
                setIsPlaying(false)
                onNavigate('posture')
              }}
              className="w-full bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100"
            >
              <Camera className="mr-2 size-4" />
              Check Your Posture
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsPlaying(false)}
                className="flex-1"
              >
                Pause
              </Button>
              <Button
                onClick={nextExercise}
                className="flex-1"
              >
                {currentExerciseIndex < (selectedWorkout?.exercises.length || 0) - 1 ? 'Next' : 'Complete'}
                <Check className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface WorkoutCardProps {
  workout: Workout
  onStart: (workout: Workout) => void
  getDifficultyColor: (difficulty: string) => string
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onStart, getDifficultyColor }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{workout.name}</CardTitle>
            <CardDescription>{workout.exercises.length} exercises</CardDescription>
          </div>
          <Badge className={getDifficultyColor(workout.difficulty)}>
            {workout.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="size-4" />
            <span>{workout.duration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="size-4" />
            <span>~{workout.caloriesEstimate} kcal</span>
          </div>
        </div>

        <Button onClick={() => onStart(workout)} className="w-full">
          <Play className="mr-2 size-4" />
          Start Workout
        </Button>
      </CardContent>
    </Card>
  )
}