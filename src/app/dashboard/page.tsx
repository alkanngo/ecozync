'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calculator,Leaf, LogOut, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { PendingCalculationService } from '@/services/pending-calculation'

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Show welcome message for new users from calculator
  useEffect(() => {
    if (searchParams.get('welcome') === 'true' && user && profile) {
      // Check if there was a pending calculation that got saved
      const hasPendingCalculation = !PendingCalculationService.hasPendingCalculation()
      
      if (hasPendingCalculation && profile.total_calculations > 0) {
        toast({
          title: "Welcome to Ecozync! 🎉",
          description: "Your account has been created and your carbon footprint calculation has been saved!",
          variant: "success"
        })
      } else {
        toast({
          title: "Welcome to Ecozync! 🎉",
          description: "Your account has been created successfully. Ready to start tracking your carbon footprint?",
          variant: "success"
        })
      }
      
      // Remove the welcome param from URL
      router.replace('/dashboard')
    }
  }, [searchParams, user, profile, toast, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      {/* Header with logout */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2 font-outfit">
            Welcome back! 🌱
      </h1>
      <p className="text-text-secondary font-mono">
            Your personal climate action dashboard
          </p>
        </div>
        
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Profile Info */}
        <Card className="bg-surface-dark/80 backdrop-blur-sm border-accent-green/20 p-6">
          <div className="flex items-center space-x-4 mb-4">
            {profile.avatar_url ? (
              <Image 
                src={profile.avatar_url} 
                alt="Profile" 
                className="w-12 h-12 rounded-full"
                width={48}
                height={48}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center">
                <User className="w-6 h-6 text-accent-green" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-text-primary font-outfit">
                {profile.display_name || profile.full_name || 'Anonymous User'}
              </h3>
              <p className="text-sm text-text-secondary font-mono">{user.email}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-text-secondary">Privacy Level</span>
              <span className="text-text-primary capitalize">{profile.privacy_level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Member Since</span>
              <span className="text-text-primary">
                {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Carbon Stats */}
        <Card className="bg-surface-dark/80 backdrop-blur-sm border-accent-cyan/20 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calculator className="w-6 h-6 text-accent-cyan" />
            <h3 className="font-semibold text-text-primary font-outfit">Carbon Tracking</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-text-secondary font-mono">Total Calculations</span>
                <span className="text-lg font-bold text-accent-cyan font-mono">{profile.total_calculations}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-text-secondary font-mono">Current Streak</span>
                <span className="text-lg font-bold text-accent-cyan font-mono">{profile.streak_count} days</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-text-secondary font-mono">Annual Goal</span>
                <span className="text-lg font-bold text-accent-cyan font-mono">{profile.carbon_goal_tonnes}t CO₂</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-surface-dark/80 backdrop-blur-sm border-accent-green/20 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Leaf className="w-6 h-6 text-accent-green" />
            <h3 className="font-semibold text-text-primary font-outfit">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/calculator')}
              className="w-full bg-accent-green hover:bg-accent-green/90 text-primary-dark font-medium"
            >
              New Calculation
            </Button>
            <Button
              variant="outline"
              className="w-full border-accent-green/50 text-text-secondary hover:bg-accent-green/10"
              disabled
            >
              View History
              <span className="ml-2 text-xs opacity-60">(Soon)</span>
            </Button>
            <Button
              variant="outline"
              className="w-full border-accent-green/50 text-text-secondary hover:bg-accent-green/10"
              disabled
            >
              Find Friends
              <span className="ml-2 text-xs opacity-60">(Soon)</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Coming Soon Features */}
      <Card className="bg-surface-dark/80 backdrop-blur-sm border-accent-green/20 p-8">
        <h2 className="text-2xl font-bold text-text-primary mb-4 font-outfit">Coming Soon 🚀</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-surface-darker/50 rounded-lg">
            <h4 className="font-semibold text-text-primary mb-2 font-outfit">Achievement System</h4>
            <p className="text-sm text-text-secondary font-mono">Unlock badges for sustainable actions</p>
          </div>
          <div className="p-4 bg-surface-darker/50 rounded-lg">
            <h4 className="font-semibold text-text-primary mb-2 font-outfit">Social Features</h4>
            <p className="text-sm text-text-secondary font-mono">Connect with eco-conscious friends</p>
          </div>
          <div className="p-4 bg-surface-darker/50 rounded-lg">
            <h4 className="font-semibold text-text-primary mb-2 font-outfit">Community Challenges</h4>
            <p className="text-sm text-text-secondary font-mono">Compete in monthly reduction goals</p>
          </div>
          <div className="p-4 bg-surface-darker/50 rounded-lg">
            <h4 className="font-semibold text-text-primary mb-2 font-outfit">Carbon Offsetting</h4>
            <p className="text-sm text-text-secondary font-mono">Purchase verified offsets</p>
          </div>
          <div className="p-4 bg-surface-darker/50 rounded-lg">
            <h4 className="font-semibold text-text-primary mb-2 font-outfit">Progress Analytics</h4>
            <p className="text-sm text-text-secondary font-mono">Detailed tracking insights</p>
          </div>
          <div className="p-4 bg-surface-darker/50 rounded-lg">
            <h4 className="font-semibold text-text-primary mb-2 font-outfit">Mobile App</h4>
            <p className="text-sm text-text-secondary font-mono">Native iOS and Android apps</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
