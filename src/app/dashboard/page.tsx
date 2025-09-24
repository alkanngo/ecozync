'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, User } from 'lucide-react'

import ActivityFeed from '@/components/dashboard/activity-feed'
import CarbonDisplay from '@/components/dashboard/carbon-display'
import Leaderboard from '@/components/dashboard/leaderboard'
import OffsetStatus from '@/components/dashboard/offset-status'
import QuickActions from '@/components/dashboard/quick-actions'
import StatsCards from '@/components/dashboard/stats-cards'
import { Button } from '@/components/ui/button'
import CircularText from '@/components/ui/circular-text'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { createSupabaseClient } from '@/libs/supabase/supabase-client'
import { PendingCalculationService } from '@/services/pending-calculation'

interface DashboardData {
  latestCalculation: any | null
  recentCalculations: any[] // Last 7 days for weekly progress
  friendships: any[]
  achievements: any[]
  subscription: any | null
  globalRank: number
}

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const supabase = createSupabaseClient()

  // Single auth check - redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Fetch dashboard data only once when user and profile are available
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !profile || dataLoading || dashboardData) return

      try {
        setDataLoading(true)

        // Fetch all data in parallel
        const [
          latestCalculationResult,
          recentCalculationsResult,
          friendshipsResult,
          achievementsResult,
          subscriptionResult
        ] = await Promise.all([
          // Latest carbon calculation
          supabase
            .from('carbon_calculations')
            .select('*')
            .eq('user_id', user.id)
            .order('calculation_date', { ascending: false })
            .limit(1)
            .single(),

          // Recent calculations (last 7 days)
          supabase
            .from('carbon_calculations')
            .select('*')
            .eq('user_id', user.id)
            .gte('calculation_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .order('calculation_date', { ascending: false }),

          // Accepted friendships
          supabase
            .from('friendships')
            .select(`
              *,
              requester:profiles!friendships_requester_id_fkey(id, display_name, avatar_url),
              addressee:profiles!friendships_addressee_id_fkey(id, display_name, avatar_url)
            `)
            .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
            .eq('status', 'accepted'),

          // User achievements (unlocked only)
          supabase
            .from('user_achievements')
            .select(`
              *,
              achievement:achievements(*)
            `)
            .eq('user_id', user.id)
            .eq('is_unlocked', true),

          // Active subscription
          supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single()
        ])

        // Calculate mock global rank (in real implementation, this would be a backend calculation)
        const mockGlobalRank = Math.floor(Math.random() * 10000) + 1

        setDashboardData({
          latestCalculation: latestCalculationResult.data || null,
          recentCalculations: recentCalculationsResult.data || [],
          friendships: friendshipsResult.data || [],
          achievements: achievementsResult.data || [],
          subscription: subscriptionResult.data || null,
          globalRank: mockGlobalRank
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, profile, supabase, dataLoading, dashboardData])

  // Show welcome message for new users from calculator (only once)
  useEffect(() => {
    if (hasShownWelcome) return
    
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('welcome') === 'true' && user && profile) {
      setHasShownWelcome(true)
      
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
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [user, profile, toast, hasShownWelcome])

  // Show loading only during initial auth check
  if (loading) {
    return (
      <div className="relative overflow-hidden min-h-screen">
        {/* Breathing gradient background */}
        <div 
          className="fixed inset-0 animate-pulse"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(74, 222, 128, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(34, 211, 238, 0.06) 0%, transparent 50%)
            `,
            animationDuration: '4s',
            animationTimingFunction: 'ease-in-out'
          }}
        />
        <div className="container mx-auto px-6 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green"></div>
        </div>
      </div>
    )
  }

  // Show loading if no user/profile yet (avoid blank screen)
  if (!user || !profile) {
    return (
      <div className="relative overflow-hidden full-content-height">
        {/* Breathing gradient background */}
        <div 
          className="fixed inset-0 animate-pulse"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(74, 222, 128, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(34, 211, 238, 0.06) 0%, transparent 50%)
            `,
            animationDuration: '4s',
            animationTimingFunction: 'ease-in-out'
          }}
        />
        <div className="container mx-auto px-6 py-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mx-auto mb-4"></div>
            <p className="text-text-secondary font-mono">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="relative overflow-hidden full-content-height">
      {/* Breathing gradient background */}
      <div 
        className="fixed inset-0 animate-pulse"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(74, 222, 128, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(34, 211, 238, 0.06) 0%, transparent 50%)
          `,
          animationDuration: '4s',
          animationTimingFunction: 'ease-in-out'
        }}
      />

      {/* Desktop Layout - Hidden on Mobile */}
      <div className="lg:flex relative z-10 h-full max-w-[1440px] mx-auto">
        
        {/* Left Panel - Welcome & Primary Stats */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 relative">
          
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-lg mb-8"
          >
            {/* User Avatar */}
            <div className="flex items-center space-x-4 mb-6">
              {profile.avatar_url ? (
                <Image 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full border-2 border-accent-green/20"
                  width={64}
                  height={64}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center border-2 border-accent-green/20">
                  <User className="w-8 h-8 text-accent-green" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-outfit leading-tight">
                  Offset Dashboard
                </h1>
                <p className="text-lg text-text-secondary font-mono mt-2">
                  Welcome, {profile.display_name || profile.full_name || 'Earth Warrior'} 🌱
                </p>
              </div>
            </div>

            {/* Sign Out Button */}
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all mb-8"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>

          {/* Primary Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-6"
          >
            {/* Carbon Display - Compact Version */}
            {dataLoading ? (
              <div className="bg-surface-dark/30 backdrop-blur-sm border border-accent-green/10 p-6 rounded-3xl h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
              </div>
            ) : (
              <CarbonDisplay 
                calculation={dashboardData?.latestCalculation}
                subscription={dashboardData?.subscription}
              />
            )}

            {/* Quick Actions - Horizontal Layout */}
            {dataLoading ? (
              <div className="bg-surface-dark/30 backdrop-blur-sm border border-accent-green/10 p-4 rounded-3xl h-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-green"></div>
              </div>
            ) : (
              <QuickActions 
                calculation={dashboardData?.latestCalculation}
                subscription={dashboardData?.subscription}
              />
            )}
          </motion.div>

          {/* Circular Text - Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute hidden xl:block xl:top-2 xl:right-[-60px]"
          >
            <div className="relative">
              <CircularText 
                text="DASHBOARD ✦ IMPACT ✦ PROGRESS ✦ EARTH ✦ "
                spinDuration={30}
                onHover="speedUp"
                className="w-32 h-32 lg:w-56 lg:h-56 text-accent-green"
              />
              {/* Center star */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span 
                  className="text-3xl lg:text-4xl text-accent-green"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  ✦
                </motion.span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Analytics & Social */}
        <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 lg:pl-0 space-y-6">
          
          {/* Top Section - Offset Status & Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="grid grid-cols-2 gap-4"
          >
            {/* Offset Status */}
            <div className="col-span-2 lg:col-span-1">
              {dataLoading ? (
                <div className="bg-surface-dark/30 backdrop-blur-sm border border-accent-green/10 p-4 rounded-3xl h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-green"></div>
                </div>
              ) : (
                <OffsetStatus 
                  calculation={dashboardData?.latestCalculation}
                  subscription={dashboardData?.subscription}
                />
              )}
            </div>

            {/* Stats Cards */}
            <div className="col-span-2 lg:col-span-1">
              {dataLoading ? (
                <div className="bg-surface-dark/30 backdrop-blur-sm border border-accent-green/10 p-4 rounded-3xl h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-green"></div>
                </div>
              ) : (
                <StatsCards 
                  calculation={dashboardData?.latestCalculation}
                  subscription={dashboardData?.subscription}
                  globalRank={dashboardData?.globalRank}
                />
              )}
            </div>
          </motion.div>

          {/* Bottom Section - Social Features (Expanded) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="grid grid-cols-4 gap-4 flex-1"
          >
            {/* Activity Feed */}
            <div className="col-span-4 lg:col-span-2">
              {dataLoading ? (
                <div className="bg-surface-dark/30 backdrop-blur-sm border border-accent-green/10 p-4 rounded-3xl h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-green"></div>
                </div>
              ) : (
                <ActivityFeed userId={user?.id || ''} />
              )}
            </div>

            {/* Leaderboard */}
            <div className="col-span-4 lg:col-span-2">
              {dataLoading ? (
                <div className="bg-surface-dark/30 backdrop-blur-sm border border-accent-green/10 p-4 rounded-3xl h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-green"></div>
                </div>
              ) : (
                <Leaderboard 
                  currentUserId={user?.id || ''}
                  friends={dashboardData?.friendships || []}
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
