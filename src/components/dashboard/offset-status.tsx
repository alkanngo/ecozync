'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Zap } from 'lucide-react'

import { Card } from '@/components/ui/card'

interface OffsetStatusProps {
  calculation: any | null
  subscription: any | null
}

// Subscription tier definitions
const SUBSCRIPTION_TIERS = [
  { name: '3 Tonnes', price: 4.50, tonnes: 3 },
  { name: '6 Tonnes', price: 9.00, tonnes: 6 },
  { name: '12 Tonnes', price: 18.00, tonnes: 12 }
]

export default function OffsetStatus({ calculation, subscription }: OffsetStatusProps) {
  const [animatedCoverage, setAnimatedCoverage] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [pulseAnimation, setPulseAnimation] = useState(false)

  // Calculate emissions and coverage
  const totalEmissions = calculation ? calculation.total_emissions : 0
  const subscriptionTonnes = subscription ? getSubscriptionTonnes(subscription) : 0
  const coveragePercentage = totalEmissions > 0 ? Math.min((subscriptionTonnes / totalEmissions) * 100, 100) : 0
  
  // Determine subscription status
  const getSubscriptionStatus = () => {
    if (!subscription) return 'not_subscribed'
    if (coveragePercentage >= 100) return 'fully_covered'
    return 'under_covered'
  }

  const status = getSubscriptionStatus()

  // Get subscription tonnes from metadata or price_id
  function getSubscriptionTonnes(sub: any): number {
    if (sub.metadata?.tonnes) return sub.metadata.tonnes
    
    // Fallback: extract from price_id or description
    const priceId = sub.price_id || ''
    if (priceId.includes('3t') || priceId.includes('3_tonnes')) return 3
    if (priceId.includes('6t') || priceId.includes('6_tonnes')) return 6
    if (priceId.includes('12t') || priceId.includes('12_tonnes')) return 12
    
    // Default fallback
    return 3
  }

  // Get tier name
  function getTierName(tonnes: number): string {
    const tier = SUBSCRIPTION_TIERS.find(t => t.tonnes === tonnes)
    return tier ? tier.name : `${tonnes} Tonnes`
  }

  // Get next tier for upgrades
  function getNextTier(currentTonnes: number) {
    return SUBSCRIPTION_TIERS.find(tier => tier.tonnes > currentTonnes)
  }

  // Animate coverage bar on mount
  useEffect(() => {
    if (coveragePercentage > 0 && !isAnimating) {
      setIsAnimating(true)
      let startTime: number | null = null
      const duration = 1500 // 1.5 seconds
      const targetValue = coveragePercentage

      const animate = (currentTime: number) => {
        if (startTime === null) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        
        // Ease-out animation
        const easeOut = 1 - Math.pow(1 - progress, 3)
        setAnimatedCoverage(targetValue * easeOut)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [coveragePercentage, isAnimating])

  // Reset animation when data changes
  useEffect(() => {
    setAnimatedCoverage(0)
    setIsAnimating(false)
  }, [calculation, subscription])

  // Pulse animation for CTA button
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation(true)
      setTimeout(() => setPulseAnimation(false), 1000)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Get background and border styles based on status
  const getStatusStyles = () => {
    switch (status) {
      case 'not_subscribed':
        return {
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
          border: 'border-red-500/30'
        }
      case 'under_covered':
        return {
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
          border: 'border-yellow-500/30'
        }
      case 'fully_covered':
        return {
          background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)',
          border: 'border-accent-green/30'
        }
      default:
        return {
          background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)',
          border: 'border-accent-green/30'
        }
    }
  }

  const statusStyles = getStatusStyles()

  // CTA button content
  const getCtaContent = () => {
    switch (status) {
      case 'not_subscribed':
        return {
          text: 'Start Offsetting - From €4.50/month',
          icon: <Zap className="w-4 h-4" />
        }
      case 'under_covered':
        const nextTier = getNextTier(subscriptionTonnes)
        return {
          text: nextTier 
            ? `Upgrade to ${nextTier.name} (€${nextTier.price}/mo) for Full Coverage`
            : 'Contact us for Enterprise Coverage',
          icon: <AlertTriangle className="w-4 h-4" />
        }
      case 'fully_covered':
        return {
          text: "You're Carbon Neutral! 🎉",
          icon: <CheckCircle className="w-4 h-4" />
        }
      default:
        return {
          text: 'Start Offsetting',
          icon: <Zap className="w-4 h-4" />
        }
    }
  }

  const ctaContent = getCtaContent()

  if (!calculation) {
    return (
      <Card 
        className="bg-surface-dark/80 backdrop-blur-sm border border-accent-green/20 p-6 rounded-3xl hover:scale-[1.01] transition-transform duration-200 h-full relative overflow-hidden calculator-card"
        style={{ background: statusStyles.background }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-accent-cyan/20 flex items-center justify-center">
              <span className="text-xl">🌊</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary font-outfit">
                Ready to Offset?
              </h3>
              <p className="text-xs text-text-secondary font-mono">
                Calculate footprint first
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => window.location.href = '/calculator'}
              className="px-6 py-3 bg-accent-green hover:bg-accent-green/90 text-primary-dark font-medium rounded-full transition-all duration-300 hover:scale-[1.02] font-outfit"
            >
              Calculate First
            </button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className={`bg-surface-dark/80 backdrop-blur-sm border ${statusStyles.border} p-6 rounded-3xl hover:scale-[1.01] transition-transform duration-200 relative overflow-hidden calculator-card`}
      style={{ background: statusStyles.background }}
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-accent-cyan/20 flex items-center justify-center">
            <span className="text-xl">🌊</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary font-outfit">
              Offset Coverage
            </h3>
            <p className="text-xs text-text-secondary font-mono">
              {subscription ? `${subscriptionTonnes}t plan` : 'Not active'}
            </p>
          </div>
        </div>
        
        {/* Tier Badge */}
        {subscription && (
          <div className="px-3 py-1 bg-surface-darker/70 rounded-full border border-accent-green/20">
            <span className="text-xs font-medium text-accent-green font-mono">
              €{(subscription.price_id ? getSubscriptionPrice(subscription) : 0).toFixed(0)}/mo
            </span>
          </div>
        )}
      </div>

      {/* Compact Coverage Visualization */}
      <div className="mb-4">
        <div className="relative">
          {/* Background bar - smaller */}
          <div className="w-full h-6 bg-surface-darker/50 rounded-full overflow-hidden">
            {/* Coverage fill */}
            <div 
              className="h-full bg-gradient-to-r from-accent-green to-accent-cyan rounded-full relative transition-all duration-1000 ease-out"
              style={{ width: `${animatedCoverage}%` }}
            >
              {/* Progress indicator */}
              {animatedCoverage > 0 && (
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full border border-accent-green"></div>
              )}
            </div>
          </div>
          
          {/* Compact labels */}
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-accent-green font-mono">
              {subscriptionTonnes > 0 ? `${subscriptionTonnes}t ✓` : '0t'}
            </span>
            <span className="text-text-secondary font-mono">
              {totalEmissions.toFixed(1)}t total
            </span>
          </div>
        </div>
      </div>

      {/* Status & Action */}
      <div className="space-y-3">
        {/* Status indicator */}
        <div className={`
          p-3 rounded-xl border text-center
          ${status === 'fully_covered' ? 'bg-green-500/10 border-green-500/30' : ''}
          ${status === 'under_covered' ? 'bg-yellow-500/10 border-yellow-500/30' : ''}
          ${status === 'not_subscribed' ? 'bg-blue-500/10 border-blue-500/30' : ''}
        `}>
          <div className="flex items-center justify-center space-x-2 text-white">
            {ctaContent.icon}
            <span className="text-sm font-medium text-text-primary font-mono">
              {status === 'fully_covered' && 'Fully Covered'}
              {status === 'under_covered' && `${(totalEmissions - subscriptionTonnes).toFixed(1)}t Uncovered`}
              {status === 'not_subscribed' && 'Not Covered'}
            </span>
          </div>
        </div>

        {/* CTA Button - consistent with calculator styling */}
        <button
          onClick={() => status === 'fully_covered' ? window.location.href = '/dashboard' : window.location.href = '/pricing'}
          className={`
            w-full px-4 py-3 font-medium rounded-xl transition-all duration-300 hover:scale-[1.02] 
            flex items-center justify-center space-x-2 text-sm font-outfit
            ${status === 'fully_covered' 
              ? 'bg-accent-green hover:bg-accent-green/90 text-primary-dark' 
              : status === 'under_covered'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-primary-dark'
                : 'bg-accent-green hover:bg-accent-green/90 text-primary-dark'
            }
          `}
        >
          <span>
            {status === 'not_subscribed' && 'Start Plan'}
            {status === 'under_covered' && 'Upgrade'}
            {status === 'fully_covered' && 'View Details'}
          </span>
        </button>
      </div>
    </Card>
  )
}

// Helper function to get subscription price
function getSubscriptionPrice(subscription: any): number {
  // Extract price from metadata or use tier mapping
  if (subscription.unit_amount) {
    return subscription.unit_amount / 100 // Convert cents to euros
  }
  
  const priceId = subscription.price_id || ''
  if (priceId.includes('3t') || priceId.includes('3_tonnes')) return 4.50
  if (priceId.includes('6t') || priceId.includes('6_tonnes')) return 9.00
  if (priceId.includes('12t') || priceId.includes('12_tonnes')) return 18.00
  
  return 4.50 // Default
}
