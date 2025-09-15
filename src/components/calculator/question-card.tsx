'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface QuestionOption {
  value: string
  label: string
  description?: string
  icon?: string
  impact?: string
  color?: string
}

interface QuestionCardProps {
  question: string
  subtitle?: string
  options: QuestionOption[]
  currentValue: string | string[]
  onChange: (value: string) => void
  questionNumber: number
  totalQuestions: number
  multiSelect?: boolean
  customInput?: React.ReactNode
  compact?: boolean
  mobile?: boolean
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.4
    }
  }
}

const optionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5
    }
  })
}

export default function QuestionCard({
  options,
  currentValue,
  onChange,
  multiSelect = false,
  customInput,
  compact = false,
  mobile = false
}: QuestionCardProps) {
  const isSelected = (value: string) => {
    if (Array.isArray(currentValue)) {
      return currentValue.includes(value)
    }
    return currentValue === value
  }

  const handleOptionClick = (value: string) => {
    if (multiSelect && Array.isArray(currentValue)) {
      const newValue = currentValue.includes(value)
        ? currentValue.filter(v => v !== value)
        : [...currentValue, value]
      onChange(newValue.join(','))
    } else {
      onChange(value)
    }
  }

  // Mobile layout
  if (mobile) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full"
      >
        {/* Custom Input */}
        {customInput && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-4"
          >
            {customInput}
          </motion.div>
        )}

        {/* Options - Mobile Stacked */}
        {options.length > 0 && (
          <div className="space-y-3">
            {options.map((option, index) => (
              <motion.div
                key={option.value}
                custom={index}
                variants={optionVariants}
                initial="hidden"
                animate="visible"
              >
                <Button
                  variant="outline"
                  onClick={() => handleOptionClick(option.value)}
                  className={`w-full h-auto p-4 relative transition-all duration-300 ${
                    isSelected(option.value)
                      ? 'bg-accent-green/20 border-accent-green text-text-primary ring-2 ring-accent-green/50'
                      : 'bg-surface-darker/30 border-accent-green/20 text-text-secondary hover:bg-accent-green/10 hover:border-accent-green/40 hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center space-x-3 w-full">
                    {/* Icon */}
                    {option.icon && (
                      <motion.div
                        className="text-2xl flex-shrink-0"
                        animate={{
                          scale: isSelected(option.value) ? [1, 1.1, 1] : 1,
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {option.icon}
                      </motion.div>
                    )}
                    
                    <div className="flex-1 text-left">
                      {/* Label */}
                      <h3 className="font-semibold text-base mb-1 font-outfit">
                        {option.label}
                      </h3>
                      
                      {/* Description */}
                      {option.description && (
                        <p className="text-sm opacity-80 font-mono">
                          {option.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Selection indicator */}
                    {isSelected(option.value) && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center flex-shrink-0"
                      >
                        <Check className="w-3 h-3 text-primary-dark" />
                      </motion.div>
                    )}
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    )
  }

  // Compact layout for desktop split-screen (default)
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full"
    >
      {/* Custom Input */}
      {customInput && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-6"
        >
          {customInput}
        </motion.div>
      )}

      {/* Options Grid - Compact */}
      {options.length > 0 && (
        <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
          {options.map((option, index) => (
            <motion.div
              key={option.value}
              custom={index}
              variants={optionVariants}
              initial="hidden"
              animate="visible"
            >
              <Button
                variant="outline"
                onClick={() => handleOptionClick(option.value)}
                className={`w-full h-auto p-5 relative transition-all duration-300 group ${
                  isSelected(option.value)
                    ? 'bg-accent-green/20 border-accent-green text-accent-green ring-2 ring-accent-green/50'
                    : 'bg-surface-darker/30 border-white text-white hover:bg-accent-green/10 hover:border-accent-green hover:text-accent-green hover:scale-[1.01] hover:shadow-lg hover:shadow-accent-green/10'
                }`}
              >
                <div className="relative flex items-center space-x-4 w-full">
                  {/* Icon */}
                  {option.icon && (
                    <motion.div
                      className="text-3xl flex-shrink-0"
                      animate={{
                        scale: isSelected(option.value) ? [1, 1.1, 1] : 1,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {option.icon}
                    </motion.div>
                  )}
                  
                  <div className="flex-1 text-left">
                    {/* Label */}
                    <h3 className="font-semibold text-lg font-outfit mb-1">
                      {option.label}
                    </h3>
                    
                    {/* Description */}
                    {option.description && (
                      <p className="text-sm font-mono opacity-80 mb-2">
                        {option.description}
                      </p>
                    )}
                    
                    {/* Impact indicator */}
                    {option.impact && (
                      <span 
                        className="text-xs px-2 py-1 rounded-full font-medium font-outfit"
                        style={{ 
                          backgroundColor: `${option.color || '#4ade80'}20`,
                          color: option.color || '#4ade80'
                        }}
                      >
                        {option.impact} Impact
                      </span>
                    )}
                  </div>
                  
                  {/* Selection indicator */}
                  {isSelected(option.value) && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="xl:absolute xl:top-0 xl:right-0 w-6 h-6 bg-accent-green rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <Check className="w-4 h-4 text-primary-dark" />
                    </motion.div>
                  )}
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}