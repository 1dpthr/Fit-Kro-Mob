import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { useAuth } from './AuthContext'
import { projectId } from '../utils/supabase/info'
import { User, Mail, Settings, LogOut, Edit, Bell, Shield } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

export const ProfileScreen: React.FC = () => {
  const { user, accessToken, signOut } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  const [editData, setEditData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    goal: '',
    activityLevel: '',
    dietPreference: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae791a35/profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      const data = await response.json()
      if (response.ok && data.profile) {
        setProfile(data.profile)
        setEditData({
          name: data.profile.name || '',
          age: data.profile.age || '',
          height: data.profile.height || '',
          weight: data.profile.weight || '',
          goal: data.profile.goal || '',
          activityLevel: data.profile.activityLevel || '',
          dietPreference: data.profile.dietPreference || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae791a35/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(editData),
        }
      )

      if (response.ok) {
        toast.success('Profile updated successfully!')
        setShowEditDialog(false)
        fetchProfile()
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      
      // Navigation will be handled automatically by the auth state change
      // The App.tsx effect will detect user = null and switch to auth screen
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin size-8 border-4 border-red-600 border-t-transparent rounded-full mb-2"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-500 px-6 pt-12 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 left-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="size-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl">
            <User className="size-10 text-white" />
          </div>
          <div>
            <h2 className="text-3xl text-white">{profile?.name || 'User'}</h2>
            <p className="text-white/90">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-16 relative z-20 space-y-4">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profile Information</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="size-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Name</span>
              <span>{profile?.name || '—'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Email</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Age</span>
              <span>{profile?.age || '—'} years</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Gender</span>
              <span className="capitalize">{profile?.gender || '—'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Height</span>
              <span>{profile?.height || '—'} cm</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Weight</span>
              <span>{profile?.weight || '—'} kg</span>
            </div>
          </CardContent>
        </Card>

        {/* Goals & Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Goals & Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Fitness Goal</span>
              <span className="capitalize">
                {profile?.goal === 'lose' ? 'Lose Weight' : 
                 profile?.goal === 'gain' ? 'Gain Muscle' : 
                 profile?.goal === 'maintain' ? 'Maintain Fitness' : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Activity Level</span>
              <span className="capitalize">{profile?.activityLevel?.replace('_', ' ') || '—'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Diet Preference</span>
              <span className="capitalize">{profile?.dietPreference || 'None'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Bell className="mr-2 size-4" />
              Notifications
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="mr-2 size-4" />
              Privacy & Disclaimer
            </Button>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 size-4" />
          Sign Out
        </Button>

        <div className="text-center text-sm text-gray-500 pt-4">
          <p>Fit Kro v1.0.0</p>
          <p className="text-xs mt-1">Train Smart. Eat Smart.</p>
        </div>

        {/* Bottom spacing for nav bar */}
        <div className="h-24"></div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-age">Age</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={editData.age}
                  onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-height">Height (cm)</Label>
                <Input
                  id="edit-height"
                  type="number"
                  value={editData.height}
                  onChange={(e) => setEditData({ ...editData, height: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-weight">Weight (kg)</Label>
              <Input
                id="edit-weight"
                type="number"
                value={editData.weight}
                onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-goal">Fitness Goal</Label>
              <Select value={editData.goal} onValueChange={(val) => setEditData({ ...editData, goal: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose">Lose Weight</SelectItem>
                  <SelectItem value="gain">Gain Muscle</SelectItem>
                  <SelectItem value="maintain">Maintain Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-activity">Activity Level</Label>
              <Select value={editData.activityLevel} onValueChange={(val) => setEditData({ ...editData, activityLevel: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Lightly Active</SelectItem>
                  <SelectItem value="moderate">Moderately Active</SelectItem>
                  <SelectItem value="very">Very Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-diet">Diet Preference</Label>
              <Select value={editData.dietPreference} onValueChange={(val) => setEditData({ ...editData, dietPreference: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Preference</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="paleo">Paleo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleUpdateProfile} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}