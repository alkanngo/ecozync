'use client'

import { useRouter } from 'next/navigation'
import { AlertTriangle,ArrowUp, Calculator, Check, Leaf, TrendingUp, Trophy } from 'lucide-react'

interface QuickActionsProps {
  calculation: any | null
  subscription: any | null
}

export default function QuickActions({ calculation, subscription }: QuickActionsProps) {
  const router = useRouter()

  // Get subscription tonnes and status
  const getSubscriptionTonnes = (sub: any): number => {
    if (!sub) return 0
    if (sub.metadata?.tonnes) return sub.metadata.tonnes
    
    const priceId = sub.price_id || ''
    if (priceId.includes('3t') || priceId.includes('3_tonnes')) return 3
    if (priceId.includes('6t') || priceId.includes('6_tonnes')) return 6
    if (priceId.includes('12t') || priceId.includes('12_tonnes')) return 12
    
    return 3
  }

  const totalEmissions = calculation ? calculation.total_emissions : 0
  const subscriptionTonnes = getSubscriptionTonnes(subscription)
  const coveragePercentage = totalEmissions > 0 ? Math.min((subscriptionTonnes / totalEmissions) * 100, 100) : 0
  const uncoveredTonnes = Math.max(totalEmissions - subscriptionTonnes, 0)

  // Get subscription status
  const getSubscriptionStatus = () => {
    if (!subscription) return 'not_subscribed'
    if (coveragePercentage >= 100) return 'fully_covered'
    return 'under_covered'
  }

  const subscriptionStatus = getSubscriptionStatus()

  // Get offset action content
  const getOffsetAction = () => {
    switch (subscriptionStatus) {
      case 'not_subscribed':
        return {
          icon: Leaf,
          title: 'Start Offsetting',
          subtitle: 'From €4.50',
          action: () => router.push('/pricing')
        }
      case 'under_covered':
        return {
          icon: ArrowUp,
          title: 'Upgrade Plan',
          subtitle: `${uncoveredTonnes.toFixed(1)}t uncovered`,
          action: () => router.push('/pricing'),
          warning: true
        }
      case 'fully_covered':
        return {
          icon: Check,
          title: 'Fully Offset',
          subtitle: 'Carbon neutral',
          action: () => router.push('/dashboard'),
          success: true
        }
      default:
        return {
          icon: Leaf,
          title: 'Start Offsetting',
          subtitle: 'From €4.50',
          action: () => router.push('/pricing')
        }
    }
  }

  const offsetAction = getOffsetAction()

  const actions = [
    {
      icon: Calculator,
      title: 'Recalculate',
      subtitle: 'Update footprint',
      action: () => router.push('/calculator')
    },
    offsetAction,
    {
      icon: Trophy,
      title: 'Challenges',
      subtitle: '2 active', // TODO: Get from actual challenge data
      action: () => router.push('/challenges'),
      disabled: true
    },
    {
      icon: TrendingUp,
      title: 'Impact Report',
      subtitle: 'View details',
      action: () => router.push('/impact'),
      disabled: true
    }
  ]

  return (
    <div className="bg-surface-dark/80 backdrop-blur-sm border border-accent-green/20 p-4 rounded-3xl calculator-card">
      <h3 className="text-lg font-semibold text-text-primary font-outfit mb-4">
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, index) => {
          const IconComponent = action.icon
          const isWarning = 'warning' in action && action.warning
          const isSuccess = 'success' in action && action.success
          const isDisabled = 'disabled' in action && action.disabled
          
          return (
            <button
              key={index}
              onClick={!isDisabled ? action.action : undefined}
              disabled={isDisabled}
              className={`
                group relative p-3 rounded-2xl transition-all duration-300
                ${isDisabled 
                  ? 'bg-surface-darker/40 border border-accent-green/10 opacity-50 cursor-not-allowed' 
                  : isWarning 
                    ? 'bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 hover:border-yellow-500/50 cursor-pointer'
                    : isSuccess
                      ? 'bg-accent-green/10 border border-accent-green/30 hover:bg-accent-green/20 hover:border-accent-green/50 cursor-pointer'
                      : 'bg-surface-darker/40 border border-accent-green/20 hover:bg-accent-green/10 hover:border-accent-green/40 cursor-pointer'
                }
                hover:scale-[1.02] active:scale-[0.98]
              `}
            >
              {/* Warning indicator for under-covered */}
              {isWarning && (
                <div className="absolute top-1 right-1">
                  <AlertTriangle className="w-2 h-2 text-yellow-500" />
                </div>
              )}
              
              {/* Success indicator for fully covered */}
              {isSuccess && (
                <div className="absolute top-1 right-1">
                  <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse"></div>
                </div>
              )}
              
              <div className="flex flex-col items-center text-center space-y-2">
                {/* Icon container - consistent with calculator styling */}
                <div 
                  className={`
                    w-8 h-8 rounded-xl flex items-center justify-center
                    ${isDisabled 
                      ? 'bg-surface-darker/50' 
                      : isWarning 
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                        : isSuccess 
                          ? 'bg-gradient-to-br from-accent-green to-accent-cyan'
                          : 'bg-gradient-to-br from-accent-green to-accent-cyan'
                    }
                    group-hover:scale-110 transition-transform duration-200
                  `}
                >
                  <IconComponent className={`w-4 h-4 ${isDisabled ? 'text-text-secondary' : 'text-primary-dark'}`} />
                </div>
                
                {/* Text content - consistent font styling */}
                <div>
                  <h4 className="text-xs font-semibold text-text-primary font-outfit leading-tight">
                    {action.title}
                  </h4>
                  <p className="text-xs text-text-secondary font-mono mt-0.5 leading-tight">
                    {action.subtitle}
                  </p>
                </div>
              </div>
              
              {/* Disabled overlay */}
              {isDisabled && (
                <div className="absolute inset-0 rounded-2xl bg-surface-dark/50 flex items-center justify-center">
                  <span className="text-xs text-text-secondary font-mono">Soon</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
