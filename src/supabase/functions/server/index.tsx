import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors())
app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

// ==================== AUTH ROUTES ====================

// Sign up
app.post('/make-server-ae791a35/signup', async (c) => {
  try {
    const { email, password, name, gender, age, height, weight, goal, activityLevel, dietPreference } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`)
      return c.json({ error: error.message }, 400)
    }

    // Store user profile data
    await kv.set(`user:${data.user.id}:profile`, {
      userId: data.user.id,
      name,
      email,
      gender,
      age,
      height,
      weight,
      goal,
      activityLevel,
      dietPreference,
      createdAt: new Date().toISOString()
    })

    return c.json({ user: data.user })
  } catch (error) {
    console.log(`Error in signup route: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// Get user profile
app.get('/make-server-ae791a35/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await kv.get(`user:${user.id}:profile`)
    return c.json({ profile })
  } catch (error) {
    console.log(`Error fetching user profile: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// Update user profile
app.put('/make-server-ae791a35/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const updates = await c.req.json()
    const currentProfile = await kv.get(`user:${user.id}:profile`) || {}
    
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    await kv.set(`user:${user.id}:profile`, updatedProfile)
    return c.json({ profile: updatedProfile })
  } catch (error) {
    console.log(`Error updating user profile: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// ==================== WORKOUT ROUTES ====================

// Get workout library
app.get('/make-server-ae791a35/workouts', async (c) => {
  try {
    let workouts = await kv.get('workouts:library')
    
    // Initialize default workouts if they don't exist
    if (!workouts || (Array.isArray(workouts) && workouts.length === 0)) {
      workouts = getDefaultWorkouts()
      await kv.set('workouts:library', workouts)
    }
    
    return c.json({ workouts })
  } catch (error) {
    console.log(`Error fetching workouts: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// Log completed workout
app.post('/make-server-ae791a35/workouts/log', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { workoutId, duration, caloriesBurned, exercises, date } = await c.req.json()
    const logId = `${user.id}:${Date.now()}`
    
    await kv.set(`user:${user.id}:workout:${logId}`, {
      workoutId,
      duration,
      caloriesBurned,
      exercises,
      date: date || new Date().toISOString(),
      userId: user.id
    })

    return c.json({ success: true, logId })
  } catch (error) {
    console.log(`Error logging workout: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// Get user's workout history
app.get('/make-server-ae791a35/workouts/history', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const workouts = await kv.getByPrefix(`user:${user.id}:workout:`)
    return c.json({ workouts })
  } catch (error) {
    console.log(`Error fetching workout history: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// ==================== FOOD LOG ROUTES ====================

// Log food
app.post('/make-server-ae791a35/food/log', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { foodName, calories, protein, carbs, fats, meal, date, imageUrl } = await c.req.json()
    const logId = `${user.id}:${Date.now()}`
    
    await kv.set(`user:${user.id}:food:${logId}`, {
      foodName,
      calories,
      protein,
      carbs,
      fats,
      meal,
      date: date || new Date().toISOString(),
      imageUrl,
      userId: user.id
    })

    return c.json({ success: true, logId })
  } catch (error) {
    console.log(`Error logging food: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// Get food history
app.get('/make-server-ae791a35/food/history', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const date = c.req.query('date')
    let foods = await kv.getByPrefix(`user:${user.id}:food:`)
    
    if (date) {
      foods = foods.filter(f => f.date.startsWith(date))
    }
    
    return c.json({ foods })
  } catch (error) {
    console.log(`Error fetching food history: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// Analyze food image (mock AI response)
app.post('/make-server-ae791a35/food/analyze', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // In a real app, you'd send this to an AI service like GPT-4 Vision or Clarifai
    // For now, return mock data
    const mockFoods = [
      { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, confidence: 0.92 },
      { name: 'Caesar Salad', calories: 220, protein: 8, carbs: 12, fats: 16, confidence: 0.88 },
      { name: 'Rice Bowl', calories: 280, protein: 5, carbs: 60, fats: 2, confidence: 0.85 },
      { name: 'Pizza Slice', calories: 285, protein: 12, carbs: 36, fats: 10, confidence: 0.90 }
    ]
    
    const randomFood = mockFoods[Math.floor(Math.random() * mockFoods.length)]
    
    return c.json({
      detected: true,
      food: randomFood
    })
  } catch (error) {
    console.log(`Error analyzing food image: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// ==================== AI COACH ROUTES ====================

// Chat with AI coach
app.post('/make-server-ae791a35/coach/chat', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { message } = await c.req.json()
    
    // Save user message
    const messageId = `${user.id}:${Date.now()}`
    await kv.set(`user:${user.id}:chat:${messageId}`, {
      role: 'user',
      message,
      timestamp: new Date().toISOString()
    })
    
    // Generate AI response (mock for now)
    const response = generateCoachResponse(message)
    const responseId = `${user.id}:${Date.now() + 1}`
    
    await kv.set(`user:${user.id}:chat:${responseId}`, {
      role: 'assistant',
      message: response,
      timestamp: new Date().toISOString()
    })
    
    return c.json({ response })
  } catch (error) {
    console.log(`Error in AI coach chat: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// Get chat history
app.get('/make-server-ae791a35/coach/history', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const messages = await kv.getByPrefix(`user:${user.id}:chat:`)
    return c.json({ messages: messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )})
  } catch (error) {
    console.log(`Error fetching chat history: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// ==================== PROGRESS ROUTES ====================

// Get user stats
app.get('/make-server-ae791a35/stats', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const today = new Date().toISOString().split('T')[0]
    
    const workouts = await kv.getByPrefix(`user:${user.id}:workout:`)
    const foods = await kv.getByPrefix(`user:${user.id}:food:`)
    
    const todayWorkouts = workouts.filter(w => w.date.startsWith(today))
    const todayFoods = foods.filter(f => f.date.startsWith(today))
    
    const caloriesConsumed = todayFoods.reduce((sum, f) => sum + (f.calories || 0), 0)
    const caloriesBurned = todayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)
    const workoutCompleted = todayWorkouts.length > 0
    
    return c.json({
      caloriesConsumed,
      caloriesBurned,
      workoutCompleted,
      steps: Math.floor(Math.random() * 5000) + 3000 // Mock data
    })
  } catch (error) {
    console.log(`Error fetching user stats: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// Log weight entry
app.post('/make-server-ae791a35/weight/log', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { weight, date } = await c.req.json()
    const logId = `${user.id}:${Date.now()}`
    
    await kv.set(`user:${user.id}:weight:${logId}`, {
      weight,
      date: date || new Date().toISOString(),
      userId: user.id
    })

    return c.json({ success: true })
  } catch (error) {
    console.log(`Error logging weight: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// Get weight history
app.get('/make-server-ae791a35/weight/history', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const weights = await kv.getByPrefix(`user:${user.id}:weight:`)
    return c.json({ weights: weights.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )})
  } catch (error) {
    console.log(`Error fetching weight history: ${error}`)
    return c.json({ error: String(error) }, 500)
  }
})

// ==================== HELPER FUNCTIONS ====================

function getDefaultWorkouts() {
  return [
    {
      id: '1',
      name: 'Full Body Strength',
      category: 'Home',
      duration: 30,
      difficulty: 'Beginner',
      caloriesEstimate: 250,
      exercises: [
        { name: 'Push-ups', reps: 10, sets: 3 },
        { name: 'Squats', reps: 15, sets: 3 },
        { name: 'Plank', duration: 30, sets: 3 },
        { name: 'Lunges', reps: 10, sets: 3 }
      ]
    },
    {
      id: '2',
      name: 'Cardio Blast',
      category: 'Cardio',
      duration: 20,
      difficulty: 'Intermediate',
      caloriesEstimate: 300,
      exercises: [
        { name: 'Jumping Jacks', duration: 60, sets: 3 },
        { name: 'High Knees', duration: 45, sets: 3 },
        { name: 'Burpees', reps: 10, sets: 3 },
        { name: 'Mountain Climbers', duration: 45, sets: 3 }
      ]
    },
    {
      id: '3',
      name: 'Upper Body Focus',
      category: 'Gym',
      duration: 45,
      difficulty: 'Advanced',
      caloriesEstimate: 350,
      exercises: [
        { name: 'Bench Press', reps: 12, sets: 4 },
        { name: 'Pull-ups', reps: 8, sets: 4 },
        { name: 'Shoulder Press', reps: 10, sets: 3 },
        { name: 'Bicep Curls', reps: 12, sets: 3 }
      ]
    }
  ]
}

function generateCoachResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('eat') || lowerMessage.includes('meal') || lowerMessage.includes('food')) {
    return "For optimal results, focus on balanced meals with lean protein, complex carbs, and healthy fats. Try grilled chicken with quinoa and vegetables, or a salmon bowl with brown rice. Don't forget to stay hydrated!"
  }
  
  if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
    return "I recommend starting with 3-4 workouts per week, mixing strength training and cardio. Try our Full Body Strength workout for beginners, or Cardio Blast if you're looking to burn calories quickly!"
  }
  
  if (lowerMessage.includes('weight') || lowerMessage.includes('lose') || lowerMessage.includes('gain')) {
    return "Weight changes take time and consistency. Make sure you're tracking your calories accurately, staying consistent with workouts, and getting enough sleep (7-9 hours). Progress isn't always linear—trust the process!"
  }
  
  if (lowerMessage.includes('motivation') || lowerMessage.includes('tired') || lowerMessage.includes('give up')) {
    return "You've got this! 💪 Remember why you started. Small progress is still progress. Even a 10-minute workout is better than none. Be patient with yourself and celebrate small wins!"
  }
  
  return "Great question! I'm here to help you reach your fitness goals. Feel free to ask me about workouts, nutrition, or staying motivated. Remember, consistency is key! 🏋️‍♀️"
}

Deno.serve(app.fetch)