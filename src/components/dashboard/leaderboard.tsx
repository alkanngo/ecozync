'use client'

import Image from 'next/image'

interface LeaderboardUser {
  id: string
  display_name: string | null
  avatar_url: string | null
  reduction_percentage: number
  rank: number
  is_current_user?: boolean
}

interface LeaderboardProps {
  currentUserId: string
  friends: any[]
}

export default function Leaderboard({ currentUserId, friends }: LeaderboardProps) {
  // Mock leaderboard data - in real implementation, this would come from calculations
  const generateMockLeaderboard = (): LeaderboardUser[] => {
    const mockUsers: LeaderboardUser[] = [
      {
        id: 'user1',
        display_name: 'Alex Green',
        avatar_url: null,
        reduction_percentage: 24,
        rank: 1
      },
      {
        id: 'user2',
        display_name: 'Sarah Climate',
        avatar_url: null,
        reduction_percentage: 18,
        rank: 2
      },
      {
        id: currentUserId,
        display_name: 'You',
        avatar_url: null,
        reduction_percentage: 15,
        rank: 3,
        is_current_user: true
      },
      {
        id: 'user3',
        display_name: 'Mike Earth',
        avatar_url: null,
        reduction_percentage: 12,
        rank: 4
      },
      {
        id: 'user4',
        display_name: 'Emma Forest',
        avatar_url: null,
        reduction_percentage: 8,
        rank: 5
      }
    ]

    return mockUsers
  }

  const leaderboardData = generateMockLeaderboard()

  // Get styling for rank position
  const getRankStyling = (rank: number, isCurrentUser: boolean = false) => {
    if (isCurrentUser) {
      return {
        bgColor: 'bg-accent-green/10',
        borderColor: 'border-accent-green/30',
        textColor: 'text-accent-green'
      }
    }

    switch (rank) {
      case 1:
        return {
          bgColor: 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400'
        }
      case 2:
        return {
          bgColor: 'bg-gradient-to-r from-gray-400/10 to-slate-400/10',
          borderColor: 'border-gray-400/30',
          textColor: 'text-gray-300'
        }
      case 3:
        return {
          bgColor: 'bg-gradient-to-r from-amber-600/10 to-orange-600/10',
          borderColor: 'border-amber-600/30',
          textColor: 'text-amber-500'
        }
      default:
        return {
          bgColor: 'bg-surface-darker/30',
          borderColor: 'border-white/10',
          textColor: 'text-text-primary'
        }
    }
  }

  // Get rank display with medals
  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `#${rank}`
    }
  }

  // Get user initials
  const getUserInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="bg-surface-dark/80 backdrop-blur-sm border border-accent-green/20 p-6 rounded-3xl h-full flex flex-col calculator-card">
      <h3 className="text-lg font-semibold text-text-primary font-outfit mb-4">
        Friends Leaderboard
      </h3>
      
      <div className="space-y-2 flex-1 overflow-y-auto">
        {leaderboardData.map((user) => {
          const styling = getRankStyling(user.rank, user.is_current_user)
          
          return (
            <div
              key={user.id}
              className={`
                flex items-center p-2 rounded-xl border transition-all duration-200
                hover:scale-[1.02] ${styling.bgColor} ${styling.borderColor}
              `}
            >
              {/* Rank - smaller */}
              <div className="w-6 flex justify-center">
                <span className={`text-sm font-bold ${styling.textColor}`}>
                  {getRankDisplay(user.rank)}
                </span>
              </div>
              
              {/* User Avatar - smaller */}
              <div className="mx-2">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.display_name || 'User'}
                    className="w-6 h-6 rounded-full border border-accent-green/30"
                    width={24}
                    height={24}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-surface-darker border border-accent-green/30 flex items-center justify-center">
                    <span className="text-xs font-medium text-text-primary font-mono">
                      {getUserInitials(user.display_name)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* User Name */}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-text-primary font-outfit truncate">
                  {user.display_name}
                  {user.is_current_user && (
                    <span className="ml-1 text-xs text-accent-green font-mono">(You)</span>
                  )}
                </span>
              </div>
              
              {/* Reduction Percentage */}
              <div className="text-right">
                <span className="text-sm font-bold text-green-400 font-mono">
                  -{user.reduction_percentage}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Empty state */}
      {leaderboardData.length === 0 && (
        <div className="text-center py-6 flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-accent-cyan/20 flex items-center justify-center mb-3">
            <span className="text-xl">👥</span>
          </div>
          <p className="text-text-secondary font-mono text-sm mb-1">
            No friends yet
          </p>
          <p className="text-text-secondary font-mono text-xs">
            Connect with friends to see rankings
          </p>
        </div>
      )}
      
      {/* Footer note */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <p className="text-xs text-text-secondary font-mono text-center">
          Rankings by reduction %
        </p>
      </div>
    </div>
  )
}
