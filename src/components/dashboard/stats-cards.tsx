'use client'

interface StatsCardsProps {
  calculation: any | null
  subscription: any | null
  globalRank?: number
}

export default function StatsCards({ calculation, subscription, globalRank = 0 }: StatsCardsProps) {
  // Calculate this month's reduction (mock calculation)
  const getMonthlyReduction = () => {
    if (!calculation) return 0
    // Mock: assume 5-15% reduction based on emissions
    const emissions = calculation.total_emissions
    if (emissions < 10) return 15
    if (emissions < 15) return 12
    if (emissions < 20) return 8
    return 5
  }

  // Calculate total lifetime offset
  const getTotalOffset = () => {
    if (!subscription) return 0
    // Mock: calculate based on subscription duration and tonnes
    const subscriptionTonnes = getSubscriptionTonnes(subscription)
    // Assume subscription has been active for some months (mock)
    const mockMonthsActive = 6
    return (subscriptionTonnes * mockMonthsActive / 12).toFixed(1)
  }

  // Get subscription tonnes
  const getSubscriptionTonnes = (sub: any): number => {
    if (!sub) return 0
    if (sub.metadata?.tonnes) return sub.metadata.tonnes
    
    const priceId = sub.price_id || ''
    if (priceId.includes('3t') || priceId.includes('3_tonnes')) return 3
    if (priceId.includes('6t') || priceId.includes('6_tonnes')) return 6
    if (priceId.includes('12t') || priceId.includes('12_tonnes')) return 12
    
    return 3
  }

  const monthlyReduction = getMonthlyReduction()
  const totalOffset = getTotalOffset()

  const stats = [
    {
      label: 'This Month',
      value: monthlyReduction > 0 ? `-${monthlyReduction}%` : 'No data',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      borderColor: 'border-green-500/20'
    },
    {
      label: 'Global Rank',
      value: globalRank > 0 ? `#${globalRank.toLocaleString()}` : 'Unranked',
      bgColor: 'bg-cyan-500/10',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20'
    },
    {
      label: 'Total Offset',
      value: subscription ? `${totalOffset}t` : '0t',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/20'
    }
  ]

  return (
    <div className="bg-surface-dark/80 backdrop-blur-sm border border-accent-green/20 p-6 rounded-3xl calculator-card h-full">
      <h3 className="text-lg font-semibold text-text-primary font-outfit mb-4">
        Your Stats
      </h3>
      
      <div className="space-y-3 lg:h-10 flex flex-col">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`
              flex items-center justify-between p-3 rounded-xl border flex-1
              ${stat.bgColor} ${stat.borderColor}
              transition-all duration-200 hover:scale-[1.02]
            `}
          >
            <span className="text-sm text-text-primary font-mono">
              {stat.label}
            </span>
            <span className={`text-lg font-bold font-mono ${stat.textColor}`}>
              {stat.value}
            </span>
          </div>
        ))}
        
        {!calculation && (
          <div className="p-3 bg-surface-darker/30 rounded-xl text-center">
            <p className="text-xs text-text-secondary font-mono">
              Complete a calculation to see your stats
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
