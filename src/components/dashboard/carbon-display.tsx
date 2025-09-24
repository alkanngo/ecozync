'use client'

import { useEffect, useState } from 'react'

import { Card } from '@/components/ui/card'

// Animated counter component (matching results display)
function AnimatedCounter({ 
  value, 
  duration = 2000, 
  className = "",
  suffix = ""
}: { 
  value: number
  duration?: number
  className?: string
  suffix?: string
}) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    let startTime: number
    let animationFrame: number
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.floor(value * easeOut))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])
  
  return (
    <span className={className}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  )
}

interface CarbonDisplayProps {
  calculation: any | null
  subscription: any | null
}

export default function CarbonDisplay({ calculation, subscription }: CarbonDisplayProps) {

  // Calculate annual carbon footprint from latest calculation
  const annualFootprint = calculation ? calculation.total_emissions : 0
  
  // Get impact level and color (matching results display logic exactly)
  const getImpactLevel = () => {
    const totalEmissions = annualFootprint // Convert to kg for comparison
    if (totalEmissions <= 2000) return { level: 'Excellent', color: '#22c55e', message: 'You have a very low carbon footprint!' }
    if (totalEmissions <= 4000) return { level: 'Good', color: '#84cc16', message: 'Your footprint is below average - well done!' }
    if (totalEmissions <= 8000) return { level: 'Average', color: '#eab308', message: 'Your footprint is typical for your region.' }
    if (totalEmissions <= 12000) return { level: 'High', color: '#f97316', message: 'There\'s significant room for improvement.' }
    return { level: 'Very High', color: '#ef4444', message: 'Consider major lifestyle changes for the planet.' }
  }

  const impactLevel = getImpactLevel()
  
  // Calculate offset percentage based on subscription
  const getOffsetPercentage = () => {
    if (!subscription || !annualFootprint) return 0
    
    // Extract tonnes from subscription metadata (assuming it's stored there)
    // For now, we'll use a simple mapping based on common subscription tiers
    const subscriptionTonnes = subscription.metadata?.tonnes || 
                              (subscription.price_id?.includes('3t') ? 3 :
                               subscription.price_id?.includes('6t') ? 6 :
                               subscription.price_id?.includes('12t') ? 12 : 0)
    
    return Math.min((subscriptionTonnes / annualFootprint) * 100, 100)
  }

  const offsetPercentage = getOffsetPercentage()


  // Calculate comparison metrics
  const kmDriven = Math.round(annualFootprint * 5000)
  const treesNeeded = Math.round(annualFootprint * 50)

  // Circular progress component
  const CircularProgress = ({ percentage }: { percentage: number }) => {
    const radius = 48
    const strokeWidth = 6
    const normalizedRadius = radius - strokeWidth * 2
    const circumference = normalizedRadius * 2 * Math.PI
    const strokeDasharray = `${circumference} ${circumference}`
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative w-28 h-28">
        <svg
          className="transform -rotate-90 w-full h-full"
          width={radius * 2}
          height={radius * 2}
        >
          {/* Background circle */}
          <circle
            stroke="rgba(74, 222, 128, 0.1)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke="url(#gradient)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-text-primary font-mono">
              {offsetPercentage.toFixed(0)}%
            </div>
            <div className="text-xs text-text-secondary font-mono">
              offset
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!calculation) {
    return (
      <Card className="bg-surface-dark/80 backdrop-blur-sm border border-accent-green/20 p-4 lg:p-6 rounded-3xl hover:scale-[1.01] transition-transform duration-200 h-full calculator-card">
        <div className="flex flex-col h-full">
          <div className="flex items-center space-x-3 mb-3 lg:mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-accent-green/20 flex items-center justify-center">
              <span className="text-lg lg:text-xl">🌱</span>
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-semibold text-text-primary font-outfit">
                Start Your Climate Journey
              </h3>
              <p className="text-xs text-text-secondary font-mono">
                Calculate your carbon footprint
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => window.location.href = '/calculator'}
              className="px-4 py-2 lg:px-6 lg:py-3 bg-accent-green hover:bg-accent-green/90 text-primary-dark font-medium rounded-full transition-all hover:scale-[1.02] font-outfit text-sm lg:text-base"
            >
              Calculate Now
            </button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-surface-dark/80 backdrop-blur-sm border border-accent-green/20 p-4 lg:p-6 rounded-3xl hover:scale-[1.01] transition-transform duration-200 relative overflow-hidden calculator-card">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-accent-green/20 flex items-center justify-center">
            <span className="text-lg lg:text-xl">📊</span>
          </div>
          <div>
            <h3 className="text-base lg:text-lg font-semibold text-text-primary font-outfit">
              Your Footprint
            </h3>
            <p className="text-xs text-text-secondary font-mono">
              Annual CO₂ emissions
            </p>
          </div>
        </div>
        
        {/* Circular progress indicator - hidden on mobile */}
        {subscription && (
          <div className="flex-shrink-0 hidden lg:block">
            <CircularProgress percentage={offsetPercentage} />
          </div>
        )}
      </div>

      {/* Main Value Display - Matching Results Display */}
      <div className="text-center mb-4">
        <div className="flex items-baseline justify-center space-x-3">
          <span style={{ color: impactLevel.color }}>
            <AnimatedCounter 
              value={annualFootprint} // Convert to kg to match results display
              className="text-5xl lg:text-6xl xl:text-7xl font-bold font-batamy"
            />
          </span>
          <span className="text-2xl text-text-secondary font-mono">kg CO₂/year</span>
        </div>
      </div>

      {/* Compact Comparison Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-darker/30 rounded-xl p-3 text-center">
          <span className="text-lg block mb-1">🌍</span>
          <p className="text-xs text-text-secondary font-mono mb-1">
            Car equivalent
          </p>
          <p className="text-sm text-text-primary font-mono font-medium">
            {(kmDriven / 1000).toFixed(0)}k km
          </p>
        </div>

        <div className="bg-surface-darker/30 rounded-xl p-3 text-center">
          <span className="text-lg block mb-1">🌳</span>
          <p className="text-xs text-text-secondary font-mono mb-1">
            Trees to offset
          </p>
          <p className="text-sm text-text-primary font-mono font-medium">
            {Math.round(treesNeeded / 1000)}k trees
          </p>
        </div>
      </div>

      {/* Last updated */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <p className="text-xs text-text-secondary font-mono text-center">
          Updated: {new Date(calculation.calculation_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
        </p>
      </div>
    </Card>
  )
}
