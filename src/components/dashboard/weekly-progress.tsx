'use client'

import { useMemo } from 'react'

interface WeeklyProgressProps {
  calculations: any[] // Last 7 days of calculations
  streakCount: number
}

export default function WeeklyProgress({ calculations = [], streakCount }: WeeklyProgressProps) {
  // Generate last 7 days
  const weekData = useMemo(() => {
    const days = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Find calculation for this date
      const calculation = calculations.find(calc => {
        const calcDate = new Date(calc.calculation_date)
        return calcDate.toDateString() === date.toDateString()
      })
      
      days.push({
        date,
        dayInitial: date.toLocaleDateString('en', { weekday: 'narrow' }),
        hasCalculation: !!calculation,
        calculation,
        reductionPercentage: calculation ? getReductionPercentage(calculation) : 0
      })
    }
    
    return days
  }, [calculations])

  // Calculate weekly average
  const weeklyAverage = useMemo(() => {
    const activeDays = weekData.filter(day => day.hasCalculation)
    if (activeDays.length === 0) return 0
    
    const totalReduction = activeDays.reduce((sum, day) => sum + day.reductionPercentage, 0)
    return totalReduction / activeDays.length
  }, [weekData])

  // Mock function to calculate reduction percentage
  // In real implementation, this would compare to baseline or previous period
  function getReductionPercentage(calculation: any): number {
    // Mock calculation: assume 5-15% reduction based on total emissions
    const emissions = calculation.total_emissions
    if (emissions < 10) return 15
    if (emissions < 15) return 10
    if (emissions < 20) return 5
    return 0
  }

  return (
    <div className="bg-surface-dark/80 backdrop-blur-sm border border-accent-green/20 p-6 rounded-3xl calculator-card h-full">
      {/* Compact Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-text-primary font-outfit">
          Weekly Progress
        </h3>
        
        {/* Compact Streak Badge */}
        {streakCount >= 7 && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
            <span className="text-sm animate-rock">🔥</span>
            <span className="text-xs font-bold text-white font-mono">
              {streakCount}
            </span>
          </div>
        )}
      </div>

      {/* 7-day grid - compact */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekData.map((day, index) => {
          const isActive = day.hasCalculation
          const isToday = day.date.toDateString() === new Date().toDateString()
          
          return (
            <div
              key={index}
              className={`
                aspect-square rounded-lg border transition-all duration-200
                hover:scale-105 cursor-pointer relative overflow-hidden
                ${isActive 
                  ? 'bg-gradient-to-br from-accent-green/30 to-accent-cyan/30 border-accent-green/30 shadow-green' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
                }
                ${isToday ? 'ring-1 ring-accent-green/50' : ''}
              `}
            >
              {/* Glow effect for active days */}
              {isActive && (
                <div className="absolute inset-0 bg-accent-green/20 rounded-lg blur-sm animate-pulse-glow"></div>
              )}
              
              {/* Content */}
              <div className="relative z-10 p-1 h-full flex flex-col items-center justify-center text-center">
                <span className="text-xs font-medium text-text-primary font-mono">
                  {day.dayInitial}
                </span>
                
                {isActive && day.reductionPercentage > 0 && (
                  <span className="text-xs font-bold text-accent-green font-mono">
                    -{day.reductionPercentage}%
                  </span>
                )}
              </div>
              
              {/* Today indicator */}
              {isToday && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent-green rounded-full"></div>
              )}
            </div>
          )
        })}
      </div>

      {/* Compact Summary */}
      <div className="border-t border-white/10 pt-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary font-mono">
            Weekly Average
          </span>
          <span className="text-sm font-bold text-accent-green font-mono">
            {weeklyAverage > 0 ? `-${weeklyAverage.toFixed(1)}%` : 'No data'}
          </span>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes rock {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .animate-rock {
          animation: rock 2s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .shadow-green {
          box-shadow: 0 0 15px rgba(74, 222, 128, 0.3);
        }
      `}</style>
    </div>
  )
}
