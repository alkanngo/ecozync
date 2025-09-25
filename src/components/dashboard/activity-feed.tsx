'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { AnimatePresence,motion } from 'framer-motion'

import { createSupabaseClient } from '@/libs/supabase/supabase-client'

interface ActivityItem {
  id: string
  user_id: string
  activity_type: string
  title: string
  description: string | null
  activity_data: any
  created_at: string
  user_profile?: {
    display_name: string | null
    avatar_url: string | null
  }
}

interface ActivityFeedProps {
  userId: string
}

export default function ActivityFeed({ userId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  // Fetch initial activity data
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Get activities from friends and own activities
        const { data, error } = await supabase
          .from('activity_feed')
          .select(`
            *,
            user_profile:profiles(display_name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) {
          console.error('Error fetching activities:', error)
          return
        }

        setActivities(data || [])
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [supabase])

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to activity feed changes
    const activityChannel = supabase
      .channel('activity_feed_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed'
        },
        async (payload) => {
          // Fetch the new activity with user profile
          const { data } = await supabase
            .from('activity_feed')
            .select(`
              *,
              user_profile:profiles(display_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setActivities(prev => [data, ...prev.slice(0, 19)]) // Keep only latest 20
          }
        }
      )
      .subscribe()

    // Subscribe to user achievements for friend activities
    const achievementChannel = supabase
      .channel('achievement_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_achievements',
          filter: 'is_unlocked=eq.true'
        },
        (payload) => {
          // This will trigger activity_feed creation via database triggers
          console.log('Achievement unlocked:', payload)
        }
      )
      .subscribe()

    // Subscribe to challenge participants
    const challengeChannel = supabase
      .channel('challenge_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'challenge_participants'
        },
        (payload) => {
          console.log('Challenge joined:', payload)
        }
      )
      .subscribe()

    // Subscribe to friendships
    const friendshipChannel = supabase
      .channel('friendship_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'friendships',
          filter: 'status=eq.accepted'
        },
        (payload) => {
          console.log('New friendship:', payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(activityChannel)
      supabase.removeChannel(achievementChannel)
      supabase.removeChannel(challengeChannel)
      supabase.removeChannel(friendshipChannel)
    }
  }, [supabase])

  // Get activity icon and color
  const getActivityIcon = (activityType: string, activityData: any) => {
    switch (activityType) {
      case 'achievement':
        return {
          emoji: getAchievementEmoji(activityData?.achievement_code),
          color: 'from-yellow-500 to-orange-500'
        }
      case 'calculation':
        return {
          emoji: '📊',
          color: 'from-blue-500 to-cyan-500'
        }
      case 'challenge_join':
        return {
          emoji: '🎯',
          color: 'from-purple-500 to-pink-500'
        }
      case 'challenge_complete':
        return {
          emoji: '🏆',
          color: 'from-green-500 to-emerald-500'
        }
      case 'friendship':
        return {
          emoji: '🤝',
          color: 'from-pink-500 to-rose-500'
        }
      case 'streak_milestone':
        return {
          emoji: '🔥',
          color: 'from-orange-500 to-red-500'
        }
      default:
        return {
          emoji: '✨',
          color: 'from-accent-green to-accent-cyan'
        }
    }
  }

  // Get achievement emoji based on code
  const getAchievementEmoji = (code: string) => {
    const emojiMap: Record<string, string> = {
      'first_calculation': '🌱',
      'calculation_warrior': '⚔️',
      'data_driven': '📈',
      'consistency_king': '👑',
      'milestone_maker': '🎯',
      'week_streak': '🔥',
      'month_streak': '🏆',
      'carbon_cutter': '✂️',
      'eco_warrior': '🛡️',
      'climate_champion': '🏅',
      'green_machine': '🌿',
      'emission_eliminator': '❌',
      'planet_protector': '🌍',
      'carbon_crusher': '🔨',
      'impact_multiplier': '👥',
      'social_butterfly': '🦋',
      'community_leader': '⚡',
      'challenge_champion': '🚩',
      'trend_setter': '📈',
      'eco_influencer': '👍'
    }
    return emojiMap[code] || '🎉'
  }

  // Get user display name
  const getUserName = (activity: ActivityItem) => {
    return activity.user_profile?.display_name || 'Anonymous User'
  }

  // Get user initials for avatar fallback
  const getUserInitials = (activity: ActivityItem) => {
    const name = getUserName(activity)
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="bg-surface-dark/30 backdrop-blur-sm border border-accent-green/10 p-6 rounded-3xl h-[400px]">
        <h3 className="text-lg font-semibold text-text-primary font-outfit mb-4">
          Activity Feed
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-dark/80 backdrop-blur-sm border border-accent-green/20 p-6 rounded-3xl h-full flex flex-col calculator-card">
      <h3 className="text-lg font-semibold text-text-primary font-outfit mb-4">
        Activity Feed
      </h3>
      
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center mb-3">
              <span className="text-xl">🌟</span>
            </div>
            <p className="text-text-secondary font-mono text-sm">
              No activities yet. Start tracking to see updates here!
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2">
              {activities.map((activity) => {
                const iconData = getActivityIcon(activity.activity_type, activity.activity_data)
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    layout
                    className="
                      bg-white/2 border border-white/5 hover:border-white/20 
                      hover:translate-x-1 transition-all duration-200 
                      p-3 rounded-xl group
                    "
                  >
                    <div className="flex items-start space-x-3">
                      {/* User Avatar - smaller */}
                      <div className="relative flex-shrink-0">
                        {activity.user_profile?.avatar_url ? (
                          <Image
                            src={activity.user_profile.avatar_url}
                            alt={getUserName(activity)}
                            className="w-8 h-8 rounded-full border border-accent-green/30"
                            width={32}
                            height={32}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-surface-darker border border-accent-green/30 flex items-center justify-center">
                            <span className="text-xs font-medium text-text-primary font-mono">
                              {getUserInitials(activity)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-text-primary font-medium font-outfit leading-tight">
                              {getUserName(activity)}
                            </p>
                            <p className="text-xs text-text-secondary font-mono mt-0.5 leading-tight">
                              {activity.description || activity.title}
                            </p>
                          </div>
                          
                          {/* Achievement Icon - smaller */}
                          <div className={`
                            relative w-8 h-8 rounded-full bg-gradient-to-br ${iconData.color} 
                            flex items-center justify-center flex-shrink-0 ml-2
                            animate-float
                          `}>
                            <span className="text-sm">
                              {iconData.emoji}
                            </span>
                          </div>
                        </div>
                        
                        {/* Timestamp */}
                        <p className="text-xs text-text-secondary font-mono mt-1">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(74, 222, 128, 0.3) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(74, 222, 128, 0.3);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(74, 222, 128, 0.5);
        }
      `}</style>
    </div>
  )
}
