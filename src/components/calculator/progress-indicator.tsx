'use client'

import { motion } from 'framer-motion'
import { Check, Leaf, Sprout, Target,TreePine } from 'lucide-react'

interface ProgressIndicatorProps {
  current: number
  total: number
  estimatedMinutes?: number
}

const progressStages = [
  { icon: Sprout, color: '#86efac', stage: 'Starting', min: 0, max: 2 },
  { icon: Leaf, color: '#4ade80', stage: 'Growing', min: 3, max: 5 },
  { icon: TreePine, color: '#22d3ee', stage: 'Flourishing', min: 6, max: 7 },
  { icon: Target, color: '#22d3ee', stage: 'Completing', min: 8, max: 8 }
]

export default function ProgressIndicator({ 
  current, 
  total, 
  estimatedMinutes = 3 
}: ProgressIndicatorProps) {
  const progress = (current / total) * 100
  const remainingQuestions = total - current
  const estimatedTimeRemaining = Math.max(0, Math.ceil((remainingQuestions / total) * estimatedMinutes))
  
  // Get current stage
  const currentStage = progressStages.find(stage => 
    current >= stage.min && current <= stage.max
  ) || progressStages[0]

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Stage indicator with breathing animation */}
      <div className="flex flex-col items-center space-y-4">
        <motion.div
          className="relative"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center relative"
            style={{
              background: `radial-gradient(circle, ${currentStage.color}20 0%, transparent 70%)`
            }}
          >
            <currentStage.icon 
              className="w-10 h-10" 
              style={{ color: currentStage.color }}
            />
            
            {/* Floating particles around icon */}
            {Array.from({ length: 8 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: currentStage.color,
                  opacity: 0.6
                }}
                animate={{
                  x: [0, Math.cos(i * 45 * Math.PI / 180) * 35],
                  y: [0, Math.sin(i * 45 * Math.PI / 180) * 35],
                  opacity: [0.6, 0, 0.6],
                  scale: [1, 0.5, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Stage info */}
        <div className="text-center">
          <motion.h3
            key={currentStage.stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-text-primary font-semibold text-lg"
          >
            {currentStage.stage}
          </motion.h3>
          <p className="text-text-secondary text-sm">
            Question {current} of {total}
          </p>
          {estimatedTimeRemaining > 0 && (
            <p className="text-text-secondary text-xs mt-1">
              ~{estimatedTimeRemaining} minute{estimatedTimeRemaining !== 1 ? 's' : ''} remaining
            </p>
          )}
        </div>
      </div>

      {/* Progress dots with connecting line */}
      <div className="relative">
        {/* Connecting line background */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-surface-darker transform -translate-y-1/2" />
        
        {/* Animated progress line */}
        <motion.div
          className="absolute top-1/2 left-0 h-0.5 transform -translate-y-1/2 rounded-full"
          style={{
            background: `linear-gradient(90deg, 
              rgba(74, 222, 128, 0.8) 0%, 
              rgba(34, 211, 238, 0.8) 100%)`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${(Math.max(current - 1, 0) / (total - 1)) * 100}%` }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut" 
          }}
        />

        {/* Progress dots */}
        <div className="relative flex justify-between">
          {Array.from({ length: total }, (_, i) => {
            const questionNumber = i + 1
            const isCompleted = questionNumber < current
            const isCurrent = questionNumber === current
            const isPending = questionNumber > current

            return (
              <motion.div
                key={i}
                className="relative flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                    isCompleted 
                      ? 'bg-accent-green border-accent-green text-primary-dark' 
                      : isCurrent
                      ? 'bg-surface-dark border-accent-green text-accent-green'
                      : 'bg-surface-darker border-surface-dark text-text-secondary'
                  }`}
                  animate={{
                    scale: isCurrent ? [1, 1.2, 1] : 1,
                    boxShadow: isCurrent 
                      ? [
                          '0 0 0 0 rgba(74, 222, 128, 0.4)', 
                          '0 0 0 10px rgba(74, 222, 128, 0)', 
                          '0 0 0 0 rgba(74, 222, 128, 0.4)'
                        ]
                      : 'none'
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: isCurrent ? Infinity : 0
                  }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <span className="text-xs font-bold font-mono">{questionNumber}</span>
                  )}
                </motion.div>

                {/* Question number label */}
                <motion.div
                  className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-mono ${
                    isCompleted || isCurrent ? 'text-accent-green' : 'text-text-secondary'
                  }`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                >
                  {questionNumber}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Progress percentage */}
      <div className="text-center">
        <motion.div
          key={progress}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold font-mono text-accent-green"
        >
          {Math.round(progress)}%
        </motion.div>
        <p className="text-text-secondary text-sm">Complete</p>
      </div>

      {/* Breathing background effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none -z-10"
        animate={{
          background: [
            `radial-gradient(circle at 50% 50%, ${currentStage.color}05 0%, transparent 50%)`,
            `radial-gradient(circle at 50% 50%, ${currentStage.color}10 0%, transparent 60%)`,
            `radial-gradient(circle at 50% 50%, ${currentStage.color}05 0%, transparent 50%)`
          ]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}
