import React, { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Progress } from './ui/progress'
import { useAuth } from './AuthContext'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { Camera, Plus, Utensils, Loader2 } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface FoodLog {
  foodName: string
  calories: number
  protein: number
  carbs: number
  fats: number
  meal: string
  date: string
}

export const FoodScreen: React.FC = () => {
  const { accessToken } = useAuth()
  const [foods, setFoods] = useState<FoodLog[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [analyzedFood, setAnalyzedFood] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    meal: 'breakfast'
  })

  const calorieGoal = 2000 // This should come from user profile
  const todayCalories = foods.reduce((sum, f) => sum + f.calories, 0)

  useEffect(() => {
    fetchFoodLog()
  }, [])

  const fetchFoodLog = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae791a35/food/history?date=${today}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      const data = await response.json()
      if (response.ok) {
        setFoods(data.foods || [])
      }
    } catch (error) {
      console.error('Error fetching food log:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string
      setSelectedImage(imageUrl)
      setShowImageDialog(true)
      setAnalyzing(true)

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ae791a35/food/analyze`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ imageUrl }),
          }
        )

        const data = await response.json()
        if (response.ok && data.detected) {
          setAnalyzedFood(data.food)
        } else {
          toast.error('Could not detect food in image')
          setShowImageDialog(false)
        }
      } catch (error) {
        console.error('Error analyzing food:', error)
        toast.error('Failed to analyze image')
        setShowImageDialog(false)
      } finally {
        setAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const saveAnalyzedFood = async () => {
    if (!analyzedFood) return

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae791a35/food/log`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            foodName: analyzedFood.name,
            calories: analyzedFood.calories,
            protein: analyzedFood.protein,
            carbs: analyzedFood.carbs,
            fats: analyzedFood.fats,
            meal: 'lunch',
            imageUrl: selectedImage,
            date: new Date().toISOString()
          }),
        }
      )

      if (response.ok) {
        toast.success('Food logged successfully!')
        setShowImageDialog(false)
        setSelectedImage(null)
        setAnalyzedFood(null)
        fetchFoodLog()
      }
    } catch (error) {
      console.error('Error saving food:', error)
      toast.error('Failed to save food')
    }
  }

  const handleManualAdd = async () => {
    if (!formData.foodName || !formData.calories) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae791a35/food/log`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            foodName: formData.foodName,
            calories: Number(formData.calories),
            protein: Number(formData.protein) || 0,
            carbs: Number(formData.carbs) || 0,
            fats: Number(formData.fats) || 0,
            meal: formData.meal,
            date: new Date().toISOString()
          }),
        }
      )

      if (response.ok) {
        toast.success('Food logged successfully!')
        setShowAddDialog(false)
        setFormData({
          foodName: '',
          calories: '',
          protein: '',
          carbs: '',
          fats: '',
          meal: 'breakfast'
        })
        fetchFoodLog()
      }
    } catch (error) {
      console.error('Error adding food:', error)
      toast.error('Failed to add food')
    }
  }

  const getMealFoods = (meal: string) => {
    return foods.filter(f => f.meal === meal)
  }

  const getMealCalories = (meal: string) => {
    return getMealFoods(meal).reduce((sum, f) => sum + f.calories, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-500 px-6 pt-12 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 left-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl mb-2 text-white">Food Log</h2>
          <p className="text-white/90">Track your daily nutrition</p>
        </div>
      </div>

      <div className="px-4 -mt-16 relative z-20 space-y-4">
        {/* Calorie Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daily Calories</CardTitle>
              <span className="text-2xl">{todayCalories} / {calorieGoal}</span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={(todayCalories / calorieGoal) * 100} className="h-3" />
            <p className="text-sm text-gray-600 mt-2">
              {calorieGoal - todayCalories > 0 
                ? `${calorieGoal - todayCalories} kcal remaining` 
                : `${todayCalories - calorieGoal} kcal over goal`}
            </p>
          </CardContent>
        </Card>

        {/* Add Food Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setShowAddDialog(true)}
            className="h-auto py-4 flex flex-col items-center gap-2"
            variant="outline"
          >
            <Plus className="size-6" />
            <span>Manual Entry</span>
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
          >
            <Camera className="size-6" />
            <span>Scan Food</span>
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Meal Sections */}
        <MealSection title="Breakfast" emoji="🌅" meal="breakfast" foods={getMealFoods('breakfast')} calories={getMealCalories('breakfast')} />
        <MealSection title="Lunch" emoji="☀️" meal="lunch" foods={getMealFoods('lunch')} calories={getMealCalories('lunch')} />
        <MealSection title="Dinner" emoji="🌙" meal="dinner" foods={getMealFoods('dinner')} calories={getMealCalories('dinner')} />
        <MealSection title="Snacks" emoji="🍿" meal="snacks" foods={getMealFoods('snacks')} calories={getMealCalories('snacks')} />
      </div>

      {/* Manual Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Food Manually</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="foodName">Food Name</Label>
              <Input
                id="foodName"
                placeholder="e.g. Chicken Breast"
                value={formData.foodName}
                onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meal">Meal</Label>
              <Select value={formData.meal} onValueChange={(val) => setFormData({ ...formData, meal: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snacks">Snacks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calories *</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="250"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="30"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  placeholder="15"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fats">Fats (g)</Label>
                <Input
                  id="fats"
                  type="number"
                  placeholder="5"
                  value={formData.fats}
                  onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={handleManualAdd} className="w-full">
              Add Food
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Analysis Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Food Analysis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedImage && (
              <img src={selectedImage} alt="Food" className="w-full h-48 object-cover rounded-lg" />
            )}

            {analyzing && (
              <div className="text-center py-8">
                <Loader2 className="size-8 animate-spin mx-auto mb-2 text-purple-600" />
                <p className="text-gray-600">Analyzing your food...</p>
              </div>
            )}

            {analyzedFood && !analyzing && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Detected Food:</span>
                  <span>{analyzedFood.name}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Calories:</span>
                  <span>{analyzedFood.calories} kcal</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-xs text-gray-600">Protein</p>
                    <p>{analyzedFood.protein}g</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg text-center">
                    <p className="text-xs text-gray-600">Carbs</p>
                    <p>{analyzedFood.carbs}g</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg text-center">
                    <p className="text-xs text-gray-600">Fats</p>
                    <p>{analyzedFood.fats}g</p>
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    Confidence: {Math.round(analyzedFood.confidence * 100)}%
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowImageDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={saveAnalyzedFood} className="flex-1">
                    Confirm & Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom spacing for nav bar */}
      <div className="h-24"></div>
    </div>
  )
}

interface MealSectionProps {
  title: string
  emoji: string
  meal: string
  foods: FoodLog[]
  calories: number
}

const MealSection: React.FC<MealSectionProps> = ({ title, emoji, foods, calories }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>{emoji}</span>
            <span>{title}</span>
          </CardTitle>
          <span className="text-sm text-gray-600">{calories} kcal</span>
        </div>
      </CardHeader>
      <CardContent>
        {foods.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-2">No items logged</p>
        ) : (
          <div className="space-y-2">
            {foods.map((food, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p>{food.foodName}</p>
                  <p className="text-xs text-gray-600">
                    P: {food.protein}g · C: {food.carbs}g · F: {food.fats}g
                  </p>
                </div>
                <span>{food.calories} kcal</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}