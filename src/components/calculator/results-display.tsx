'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Car, 
  Download, 
  Plane, 
  RotateCcw, 
  Share2, 
  Target,
  TreePine, 
  Users,
  Zap
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import CircularText from '@/components/ui/circular-text'
import { useToast } from '@/components/ui/use-toast'
import { PendingCalculationService } from '@/services/pending-calculation'

import type { EmissionCalculation } from './calculation-engine'
import { getComparisonMetrics } from './calculation-engine'

interface ResultsDisplayProps {
  results: EmissionCalculation
  assessmentData?: any // The form data used to generate results
  onRestart: () => void
  isAuthenticated?: boolean
  onSignUp?: () => void
  onLogin?: () => void
  onOffset?: () => void
  onTrackProgress?: () => void
  onFindFriends?: () => void
}

// Animated counter component
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

// Circular progress component
function CircularProgress({ 
  percentage, 
  size = 120, 
  strokeWidth = 8,
  color = "#4ade80",
  label,
  value
}: {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  label: string
  value: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(74, 222, 128, 0.1)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-text-primary">{value}</span>
          <span className="text-xs text-text-secondary">{label}</span>
        </div>
      </div>
    </div>
  )
}

export default function ResultsDisplay({
  results,
  assessmentData,
  onRestart,
  isAuthenticated = false,
  onSignUp,
  onLogin,
  onOffset,
  onTrackProgress,
  onFindFriends
}: ResultsDisplayProps) {
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const { toast } = useToast()

  const { total_emissions } = results
  const comparisons = getComparisonMetrics(total_emissions)
  
  // Determine impact level
  const getImpactLevel = () => {
    if (total_emissions <= 2000) return { level: 'Excellent', color: '#22c55e', message: 'You have a very low carbon footprint!' }
    if (total_emissions <= 4000) return { level: 'Good', color: '#84cc16', message: 'Your footprint is below average - well done!' }
    if (total_emissions <= 8000) return { level: 'Average', color: '#eab308', message: 'Your footprint is typical for your region.' }
    if (total_emissions <= 12000) return { level: 'High', color: '#f97316', message: 'There\'s significant room for improvement.' }
    return { level: 'Very High', color: '#ef4444', message: 'Consider major lifestyle changes for the planet.' }
  }

  const impactLevel = getImpactLevel()
  
  // Category data for breakdown
  const categories = [
    { 
      key: 'transport_emissions', 
      label: 'Transport', 
      icon: Car, 
      color: '#ef4444',
      value: results.transport_emissions
    },
    { 
      key: 'energy_emissions', 
      label: 'Energy', 
      icon: Zap, 
      color: '#f59e0b',
      value: results.energy_emissions
    },
    { 
      key: 'travel_emissions', 
      label: 'Aviation', 
      icon: Plane, 
      color: '#8b5cf6',
      value: results.travel_emissions
    },
    { 
      key: 'diet_emissions', 
      label: 'Diet', 
      icon: '🍽️', 
      color: '#22d3ee',
      value: results.diet_emissions,
      isEmoji: true
    },
    { 
      key: 'lifestyle_emissions', 
      label: 'Lifestyle', 
      icon: '🛒', 
      color: '#06b6d4',
      value: results.lifestyle_emissions,
      isEmoji: true
    }
  ].sort((a, b) => b.value - a.value)

  const handleShare = async (platform: string) => {
    const shareText = `I just calculated my carbon footprint: ${total_emissions.toLocaleString()} kg CO₂/year! 🌍 Join me in tracking climate impact with Ecozync.`
    const shareUrl = `${window.location.origin}/calculator`

    try {
      if (platform === 'native' && navigator.share) {
        await navigator.share({
          title: 'My Carbon Footprint Results',
          text: shareText,
          url: shareUrl
        })
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
        toast({
          title: "Copied to clipboard!",
          description: "Share your results with friends and family.",
          variant: "success"
        })
      }
    } catch (error) {
      console.error('Sharing failed:', error)
    }
    setShareMenuOpen(false)
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter' | 'linkedin') => {
    try {
      // Store calculation data before OAuth redirect for later saving
      if (assessmentData && results) {
        PendingCalculationService.storePendingCalculation(results, assessmentData)
      }

      // For now, only Google is supported, redirect others to regular login
      if (provider === 'google') {
        window.location.href = '/login?intent=oauth&provider=google&origin=calculator'
      } else {
        window.location.href = '/login'
        toast({
          title: "Coming Soon",
          description: `${provider} login will be available soon. Please use Google for now.`,
          variant: "default"
        })
      }
    } catch (error) {
      console.error('Social login failed:', error)
      toast({
        title: "Authentication Error",
        description: "Failed to initiate social login. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex relative flex-col xl:flex-row full-content-height max-w-[1440px] mx-auto w-full">
      {/* Left Side - Results Summary */}
      <div className="min-h-[650px] md:min-h-0 p-8 md:p16 flex-1 flex flex-start md:justify-center flex-col px-8 md:px-16 lg:px-24 relative z-10">
        
        {/* Main Results */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-lg"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-outfit leading-tight mb-4">
              Your Carbon Footprint
              </h1>
            <div className="flex items-baseline space-x-3 mb-4">
              <span style={{ color: impactLevel.color }}>
                <AnimatedCounter 
                  value={total_emissions}
                  className="text-5xl lg:text-6xl xl:text-7xl font-bold"
                />
              </span>
              <span className="text-2xl text-text-secondary font-mono">kg CO₂/year</span>
              </div>
          </motion.div>
              
          {/* Impact Level */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-full border-2"
                style={{ 
                  borderColor: impactLevel.color + '40',
                  backgroundColor: impactLevel.color + '10'
                }}
              >
                <span className="text-2xl">
                  {impactLevel.level === 'Excellent' && '🌟'}
                  {impactLevel.level === 'Good' && '👍'}
                  {impactLevel.level === 'Average' && '💡'}
                  {impactLevel.level === 'High' && '⚠️'}
                  {impactLevel.level === 'Very High' && '🚨'}
                </span>
                <div className="text-left">
                <p className="font-semibold font-mono text-lg" style={{ color: impactLevel.color }}>
                    {impactLevel.level} Impact Level
                  </p>
                <p className="text-sm text-text-secondary font-outfit">{impactLevel.message}</p>
              </div>
                </div>
              </motion.div>

          {/* Quick Comparisons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4 mb-8"
          >
            <div className="flex items-center justify-between text-sm font-mono">
              <span className="text-text-secondary">vs EU Average</span>
              <span className={`font-semibold ${comparisons.vsEuAverage > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {comparisons.vsEuAverage > 0 ? '+' : ''}{Math.round(comparisons.vsEuAverage)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-mono">
              <span className="text-text-secondary">Trees needed for offset</span>
              <span className="font-semibold text-accent-cyan">{comparisons.treesToOffset} trees</span>
            </div>
            <div className="flex items-center justify-between text-sm font-mono">
              <span className="text-text-secondary">Paris Climate Target</span>
              <span className={`font-semibold ${total_emissions <= 2300 ? 'text-green-400' : 'text-red-400'}`}>
                {total_emissions <= 2300 ? '✓ On track' : '× Above target'}
              </span>
            </div>
            </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              onClick={onRestart}
              className="bg-accent-green hover:bg-accent-green/90 text-primary-dark font-medium px-6"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Calculate Again
            </Button>
            <Button
              onClick={() => setShareMenuOpen(true)}
              variant="outline"
              className="border-accent-green/50 text-text-secondary hover:text-text-secondary hover:bg-accent-green/10 px-6"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
          </motion.div>
        </motion.div>

        {/* Circular Text - Visual Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute z-[-10] bottom-[-8px] md:bottom-0 md:top-16 lg:top-16 right-0 lg:right-8"
        >
          <div className="relative">
            <CircularText 
              text="RESULTS ✦ IMPACT ✦ ACTION ✦ CHANGE ✦ "
              spinDuration={25}
              onHover="speedUp"
              className="w-30 h-30 lg:w-48 lg:h-48 text-accent-green"
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
                  rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                ✦
              </motion.span>
            </div>
          </div>
      </motion.div>

      </div>

      {/* Right Side - Detailed Breakdown */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-2xl space-y-6">
          
          {/* Emissions Breakdown */}
      <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Card className="bg-surface-dark/80 backdrop-blur-sm border-accent-green/20 p-6">
              <h3 className="text-2xl font-bold font-outfit text-text-primary mb-6">
            Emissions Breakdown
          </h3>

          <div className="space-y-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.key}
                    initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                className="flex items-center space-x-4"
              >
                <div className="flex-shrink-0">
                  {category.isEmoji ? (
                    <span className="text-2xl">{category.icon}</span>
                  ) : (
                    <category.icon className="w-6 h-6" style={{ color: category.color }} />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-text-primary font-mono">{category.label}</span>
                    <div className="text-right">
                      <AnimatedCounter 
                        value={category.value}
                        suffix=" kg"
                        className="font-mono text-lg text-text-primary"
                      />
                          <span className="text-text-secondary text-sm ml-2 font-mono">
                        ({Math.round((category.value / total_emissions) * 100)}%)
                      </span>
                    </div>
                  </div>
                  
                      <div className="h-2 bg-surface-darker rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: category.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(category.value / total_emissions) * 100}%` }}
                          transition={{ duration: 1.2, delay: 0.2 + index * 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Social Authentication Section */}
      <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {!isAuthenticated ? (
              <Card className="bg-surface-dark/80 backdrop-blur-sm border-accent-green/20 p-6 text-center">
                <div className="mb-6">
                  <h3 className="text-xl font-bold font-outfit text-text-primary mb-2">
                    Save Your Results & Track Progress
                  </h3>
                  <p className="text-sm text-text-secondary font-mono">
                    Join thousands tracking their climate impact • Unlock personalized insights
                  </p>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3 mb-4">
                  <Button
                    onClick={() => handleSocialLogin('google')}
                    className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-medium h-12 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-outfit">Continue with Google</span>
                  </Button>

                  <Button
                    onClick={() => handleSocialLogin('facebook')}
                    className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium h-12 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="font-outfit">Continue with Facebook</span>
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleSocialLogin('twitter')}
                      className="w-full bg-black hover:bg-gray-900 text-white font-medium h-12 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span className="font-outfit text-sm">X (Twitter)</span>
                    </Button>

                    <Button
                      onClick={() => handleSocialLogin('linkedin')}
                      className="w-full bg-[#0A66C2] hover:bg-[#0952A5] text-white font-medium h-12 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span className="font-outfit text-sm">LinkedIn</span>
                    </Button>
                  </div>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-accent-green/20">
                  <div className="text-center">
                    <TreePine className="w-5 h-5 text-accent-green mx-auto mb-1" />
                    <p className="text-xs text-text-secondary font-mono">Track & Offset</p>
                  </div>
                  <div className="text-center">
                    <Target className="w-5 h-5 text-accent-cyan mx-auto mb-1" />
                    <p className="text-xs text-text-secondary font-mono">Set Goals</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-5 h-5 text-accent-green mx-auto mb-1" />
                    <p className="text-xs text-text-secondary font-mono">Join Community</p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-surface-dark/80 backdrop-blur-sm border-accent-green/20 p-6 text-center">
                <h3 className="text-lg font-bold font-outfit text-text-primary mb-4">
                  Welcome back! 🌱
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    onClick={onOffset}
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto border-accent-green/30 hover:bg-accent-green/10"
                  >
                    <TreePine className="w-6 h-6 text-accent-green mb-2" />
                    <span className="text-sm font-outfit">Offset Impact</span>
                  </Button>
                  <Button
                    onClick={onTrackProgress}
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto border-accent-cyan/30 hover:bg-accent-cyan/10"
                  >
                    <Target className="w-6 h-6 text-accent-cyan mb-2" />
                    <span className="text-sm font-outfit">Track Progress</span>
                  </Button>
                  <Button
                    onClick={onFindFriends}
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto border-accent-green/30 hover:bg-accent-green/10"
                  >
                    <Users className="w-6 h-6 text-accent-green mb-2" />
                    <span className="text-sm font-outfit">Find Friends</span>
                  </Button>
                </div>
              </Card>
            )}
            </motion.div>
          </div>
      </div>


      {/* Share Menu Modal */}
      {shareMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-primary-dark/90 backdrop-blur-md flex items-center justify-center z-50"
          onClick={() => setShareMenuOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-surface-dark/95 backdrop-blur-sm border-accent-green/30 shadow-xl p-6 m-4 max-w-sm w-full rounded-xl">
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-text-primary mb-2 font-outfit">
                Share Your Results
              </h4>
                <p className="text-sm text-text-secondary font-mono opacity-80">
                  Spread awareness about carbon footprints
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => handleShare('native')}
                  className="group w-full justify-start bg-accent-green/15 border-2 border-accent-green/30 text-text-primary hover:text-text-secondary hover:bg-accent-green/25 hover:border-accent-green/50 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-green/20 active:scale-[0.98] transition-all duration-300 h-12 font-medium rounded-lg"
                >
                  <Share2 className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-outfit">Share via Apps</span>
                </Button>
                <Button
                  onClick={() => handleShare('copy')}
                  variant="outline"
                  className="group w-full justify-start bg-surface-darker/30 border-2 border-accent-green/20 text-text-primary hover:bg-accent-green/10 hover:border-accent-green/40 hover:text-text-secondary hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-green/10 active:scale-[0.98] transition-all duration-300 h-12 font-medium rounded-lg"
                >
                  <Download className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-outfit">Copy Link</span>
                </Button>
              </div>
              
              {/* Subtle decorative element */}
              <div className="mt-6 pt-4 border-t border-accent-green/20">
                <p className="text-xs text-text-secondary text-center font-mono">
                  Help others track their climate impact ✨
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
