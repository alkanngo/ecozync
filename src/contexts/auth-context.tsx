'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { createSupabaseClient } from '@/libs/supabase/supabase-client'
import { Json } from '@/libs/supabase/types'
import { PendingCalculationService } from '@/services/pending-calculation'
import { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  display_name: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  website: string | null
  carbon_goal_tonnes: number
  privacy_level: 'public' | 'friends' | 'private'
  notification_preferences: any
  streak_count: number
  total_calculations: number
  billing_address: any | null
  payment_method: any | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  // Fetch user profile from our profiles table
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as Profile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }, [supabase])

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      
      // Redirect to home page
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Save pending calculation to database
  const savePendingCalculationForUser = useCallback(async (targetUser: User, targetProfile: Profile) => {
    const pendingCalculation = PendingCalculationService.getPendingCalculation()
    if (!pendingCalculation) {
      return
    }

    try {
      const calculationData = {
        user_id: targetUser.id,
        calculation_date: new Date().toISOString().split('T')[0],
        assessment_data: pendingCalculation.assessmentData as unknown as Json,
        transport_emissions: pendingCalculation.results.transport_emissions,
        energy_emissions: pendingCalculation.results.energy_emissions,
        diet_emissions: pendingCalculation.results.diet_emissions,
        lifestyle_emissions: pendingCalculation.results.lifestyle_emissions,
        travel_emissions: pendingCalculation.results.travel_emissions,
        other_emissions: pendingCalculation.results.other_emissions,
        calculation_method: 'local_enhanced',
        calculation_confidence: pendingCalculation.results.confidence_score
      }

      const { data, error } = await (supabase as any)
        .from('carbon_calculations')
        .insert(calculationData)
        .select()
        .single()

      if (error) {
        console.error('Error saving pending calculation:', error)
        return
      }

      // Clear the pending calculation from storage
      PendingCalculationService.clearPendingCalculation()
      
      // Refresh the profile from database to get updated total_calculations
      const updatedProfile = await fetchProfile(targetUser.id)
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
      
    } catch (error) {
      console.error('Error saving pending calculation:', error)
    }
  }, [supabase, fetchProfile])

  useEffect(() => {
    let mounted = true
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted && session?.user) {
          setUser(session.user)
          const profileData = await fetchProfile(session.user.id)
          if (mounted) {
            setProfile(profileData)
          }
        }
        
        if (mounted) {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        if (session?.user) {
          setUser(session.user)
          const profileData = await fetchProfile(session.user.id)
          if (mounted) {
            setProfile(profileData)
          }
          
          // Check for pending calculations after successful login
          // Note: OAuth flows trigger 'INITIAL_SESSION' instead of 'SIGNED_IN'
          if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && profileData && mounted) {
            // Only save if there's actually a pending calculation
            if (PendingCalculationService.hasPendingCalculation()) {
              setTimeout(async () => {
                if (mounted) {
                  await savePendingCalculationForUser(session.user, profileData)
                }
              }, 1000) // Small delay to ensure everything is set up
            }
          }
        } else if (mounted) {
          setUser(null)
          setProfile(null)
        }
        
        if (mounted) {
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile, savePendingCalculationForUser, supabase.auth])

  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
