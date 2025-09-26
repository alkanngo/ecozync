'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Calculator } from 'lucide-react'

import { calculateEmissions, convertAssessmentToResponses } from '@/components/calculator/calculation-engine'
import { useLocalCalculationStorage } from '@/components/calculator/local-storage'
import ProgressIndicator from '@/components/calculator/progress-indicator'
import QuestionCard from '@/components/calculator/question-card'
import ResultsDisplay from '@/components/calculator/results-display'
import { Button } from '@/components/ui/button'
import CircularText from '@/components/ui/circular-text'
import { useToast } from '@/components/ui/use-toast'
import type { AssessmentData, CarbonCalculationInsert } from '@/libs/supabase/types'

import { saveCalculation } from '../../app/calculator/actions'

interface CalculatorFormProps {
  userId: string | null
}

// Question configurations with dynamic circular text
const questions = [
  {
    id: 1,
    question: "How do you primarily heat your home?",
    subtitle: "Understanding your heating source helps us calculate your energy emissions.",
    category: 'energy' as keyof AssessmentData,
    field: 'heating_type',
    circularText: 'ENERGY ✦ HEATING ✦ POWER ✦ WARMTH ✦ ',
    options: [
      { value: 'gas', label: 'Natural Gas', icon: '🔥', description: 'Traditional gas heating', impact: 'High', color: '#ef4444' },
      { value: 'electric', label: 'Electricity', icon: '⚡', description: 'Electric heating', impact: 'Medium', color: '#f59e0b' },
      { value: 'renewable', label: 'Renewable', icon: '☀️', description: 'Solar, heat pump, etc.', impact: 'Low', color: '#22c55e' },
      { value: 'oil', label: 'Oil', icon: '🛢️', description: 'Oil-based heating', impact: 'Very High', color: '#dc2626' }
    ]
  },
  {
    id: 2,
    question: "What's your average monthly energy bill?",
    subtitle: "This helps estimate your household energy consumption in kilowatt-hours.",
    category: 'energy' as keyof AssessmentData,
    field: 'monthly_energy_cost',
    circularText: 'BILLS ✦ COST ✦ USAGE ✦ WATTS ✦ ',
    options: [
      { value: '0-50', label: '€0-50', icon: '💡', description: 'Very efficient usage', impact: 'Very Low', color: '#16a34a' },
      { value: '50-100', label: '€50-100', icon: '⚡', description: 'Average household', impact: 'Low', color: '#22c55e' },
      { value: '100-200', label: '€100-200', icon: '🏠', description: 'Higher consumption', impact: 'Medium', color: '#f59e0b' },
      { value: '200+', label: '€200+', icon: '🔌', description: 'Significant usage', impact: 'High', color: '#ef4444' }
    ]
  },
  {
    id: 3,
    question: "How do you mainly get around?",
    subtitle: "Transportation is often the largest source of personal carbon emissions.",
    category: 'transport' as keyof AssessmentData,
    field: 'primary_transport',
    circularText: 'MOVE ✦ TRAVEL ✦ JOURNEY ✦ TRANSPORT ✦ ',
    options: [
      { value: 'car_alone', label: 'Car (alone)', icon: '🚗', description: 'Alone most of the time', impact: 'High', color: '#ef4444' },
      { value: 'car_carpool', label: 'Car (carpool)', icon: '🚐', description: 'Share rides regularly', impact: 'Medium', color: '#f59e0b' },
      { value: 'public_transport', label: 'Public transport', icon: '🚌', description: 'Bus, train, metro', impact: 'Low', color: '#22c55e' },
      { value: 'bike_walk', label: 'Bike or walk', icon: '🚴', description: 'Active transportation', impact: 'Very Low', color: '#16a34a' }
    ]
  },
  {
    id: 4,
    question: "How many kilometers do you travel weekly?",
    subtitle: "Include your regular commute, errands, and typical weekly travel.",
    category: 'transport' as keyof AssessmentData,
    field: 'weekly_distance',
    circularText: 'DISTANCE ✦ KILOMETERS ✦ MILES ✦ COMMUTE ✦ ',
    options: [
      { value: '0-50', label: '0-50 km', icon: '🚶', description: 'Mostly local travel', impact: 'Very Low', color: '#16a34a' },
      { value: '50-150', label: '50-150 km', icon: '🚲', description: 'Moderate commute', impact: 'Low', color: '#22c55e' },
      { value: '150-300', label: '150-300 km', icon: '🚗', description: 'Regular driving', impact: 'Medium', color: '#f59e0b' },
      { value: '300+', label: '300+ km', icon: '🛣️', description: 'Long distance commuter', impact: 'High', color: '#ef4444' }
    ]
  },
  {
    id: 5,
    question: "How many flights do you take per year?",
    subtitle: "Air travel has a significant carbon impact, especially long-haul flights.",
    category: 'transport' as keyof AssessmentData,
    field: 'annual_flights',
    circularText: 'FLY ✦ AVIATION ✦ TRAVEL ✦ FLIGHTS ✦ ',
    options: [
      { value: 'none', label: 'No flights', icon: '🏠', description: 'I avoid flying', impact: 'None', color: '#16a34a' },
      { value: '1-2', label: '1-2 flights', icon: '✈️', description: 'Occasional travel', impact: 'Low', color: '#22c55e' },
      { value: '3-5', label: '3-5 flights', icon: '🛫', description: 'Regular traveler', impact: 'Medium', color: '#f59e0b' },
      { value: '6+', label: '6+ flights', icon: '🌍', description: 'Frequent flyer', impact: 'High', color: '#ef4444' }
    ]
  },
  {
    id: 6,
    question: "What best describes your diet?",
    subtitle: "Food production has a major impact on global emissions, especially livestock farming.",
    category: 'diet' as keyof AssessmentData,
    field: 'diet_type',
    circularText: 'FOOD ✦ DIET ✦ NUTRITION ✦ CONSUMPTION ✦ ',
    options: [
      { value: 'vegan', label: 'Vegan', icon: '🌱', description: 'Plant-based diet only', impact: 'Very Low', color: '#16a34a' },
      { value: 'vegetarian', label: 'Vegetarian', icon: '🥗', description: 'Includes dairy & eggs', impact: 'Low', color: '#22c55e' },
      { value: 'pescatarian', label: 'Pescatarian', icon: '🐟', description: 'Fish but no other meat', impact: 'Medium', color: '#3b82f6' },
      { value: 'omnivore', label: 'Omnivore', icon: '🍖', description: 'Balanced meat & plants', impact: 'High', color: '#f59e0b' }
    ]
  },
  {
    id: 7,
    question: "How often do you buy new clothes/electronics?",
    subtitle: "Manufacturing consumer goods requires significant energy and resources.",
    category: 'lifestyle' as keyof AssessmentData,
    field: 'shopping_frequency',
    circularText: 'SHOP ✦ CONSUME ✦ PURCHASE ✦ GOODS ✦ ',
    options: [
      { value: 'rarely', label: 'Rarely', icon: '🏠', description: 'I have stuff for years', impact: 'Very Low', color: '#16a34a' },
      { value: 'yearly', label: 'Yearly', icon: '👕', description: 'Only when necessary', impact: 'Low', color: '#22c55e' },
      { value: 'every_few_months', label: 'Every few months', icon: '📱', description: 'Occasional purchases', impact: 'Medium', color: '#f59e0b' },
      { value: 'monthly', label: 'Monthly', icon: '🛍️', description: 'I buy new items often', impact: 'High', color: '#ef4444' }
    ]
  },
  {
    id: 8,
    question: "How do you handle waste?",
    subtitle: "Proper waste management reduces landfill emissions and conserves resources.",
    category: 'lifestyle' as keyof AssessmentData,
    field: 'waste_management',
    circularText: 'WASTE ✦ RECYCLE ✦ COMPOST ✦ REDUCE ✦ ',
    options: [
      { value: 'compost_too', label: 'Compost too', icon: '♻️', description: 'Recycle + compost', impact: 'Very Low', color: '#16a34a' },
      { value: 'mostly_recycle', label: 'Mostly recycle', icon: '🌿', description: 'Careful separation', impact: 'Low', color: '#22c55e' },
      { value: 'some_recycling', label: 'Some recycling', icon: '🔄', description: 'Basic recycling', impact: 'Medium', color: '#f59e0b' },
      { value: 'everything_trash', label: 'Everything in trash', icon: '🗑️', description: 'Most waste to the bin', impact: 'High', color: '#ef4444' }
    ]
  }
]

const totalQuestions = questions.length

export default function CalculatorForm({ userId }: CalculatorFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    transport: {},
    energy: {},
    diet: {},
    lifestyle: {}
  })
  const [results, setResults] = useState<{
    transport_emissions: number
    energy_emissions: number
    diet_emissions: number
    lifestyle_emissions: number
    travel_emissions: number
    other_emissions: number
    total_emissions: number
    confidence_score: number
  } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const { toast } = useToast()
  const localStorage = useLocalCalculationStorage()

  const updateAssessmentData = useCallback((category: keyof AssessmentData, data: any) => {
    setAssessmentData((prev: AssessmentData) => ({
      ...prev,
      [category]: { ...prev[category], ...data }
    }))
  }, [])

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      calculateFootprint()
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const calculateFootprint = async () => {
    setIsCalculating(true)
    
    try {
      // Convert assessment data to calculation inputs
      const inputs = convertAssessmentToResponses(assessmentData)
      
      // Calculate emissions using the new engine
      const calculations = await calculateEmissions(inputs)
      
      // Save to database only if user is authenticated
      if (userId) {
        try {
          const calculationData: any = {
            user_id: userId,
            calculation_date: new Date().toISOString().split('T')[0],
            assessment_data: assessmentData as any,
            transport_emissions: calculations.transport_emissions,
            energy_emissions: calculations.energy_emissions,
            diet_emissions: calculations.diet_emissions,
            lifestyle_emissions: calculations.lifestyle_emissions,
            travel_emissions: calculations.travel_emissions,
            other_emissions: calculations.other_emissions,
            calculation_method: 'local_enhanced',
            calculation_confidence: calculations.confidence_score
          }

          await saveCalculation(calculationData)
          
          toast({
            title: "Calculation Complete!",
            description: "Your carbon footprint has been calculated and saved to your account.",
          })
        } catch (saveError) {
          console.error('Error saving calculation:', saveError)
          // Still show results even if save fails
          toast({
            title: "Calculation Complete!",
            description: "Your carbon footprint has been calculated. Sign up to save your progress!",
          })
        }
      } else {
        // Anonymous user - save to localStorage and prompt to sign up
        localStorage.saveCalculation(calculations, assessmentData)
        
        toast({
          title: "Calculation Complete!",
          description: "Sign up to save your results and track progress over time.",
        })
      }
      
      setResults(calculations)
      setShowResults(true)
      
    } catch (error) {
      console.error('Error calculating footprint:', error)
      toast({
        title: "Calculation Error",
        description: "Failed to calculate your carbon footprint. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const restartCalculator = () => {
    setCurrentQuestion(1)
    setAssessmentData({
      transport: {},
      energy: {},
      diet: {},
      lifestyle: {}
    })
    setResults(null)
    setShowResults(false)
  }

  const getCurrentQuestion = () => {
    return questions[currentQuestion - 1]
  }

  const getCurrentValue = () => {
    const question = getCurrentQuestion()
    if (!question) return ''
    
    const categoryData = assessmentData[question.category] as any
    return categoryData?.[question.field] || ''
  }

  const handleQuestionChange = (value: string) => {
    const question = getCurrentQuestion()
    if (!question) return
    
    updateAssessmentData(question.category, { [question.field]: value })
  }

  if (showResults && results) {
    return (
      <ResultsDisplay 
        results={results}
        assessmentData={assessmentData}
        onRestart={restartCalculator}
        isAuthenticated={!!userId}
      />
    )
  }

  const currentQuestionData = getCurrentQuestion()

  return (
    <div className="flex relative full-content-height max-w-[1440px] mx-auto w-full">
      {/* Left Side - Question Text and Progress */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 relative z-10">
        
        {/* Progress Indicator - Minimalistic */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-2 text-sm font-mono text-text-secondary">
            <span className="text-accent-green">{currentQuestion.toString().padStart(2, '0')}</span>
            <span>/</span>
            <span>{totalQuestions.toString().padStart(2, '0')}</span>
          </div>
          
          {/* Progress line */}
          <div className="w-24 h-0.5 bg-surface-darker mt-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent-green rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Question Content */}
        <AnimatePresence mode="wait">
          {currentQuestionData && (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-lg"
            >
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-outfit leading-tight mb-6">
                {currentQuestionData.question}
              </h1>
              
              <p className="text-lg text-text-secondary font-mono leading-relaxed">
                {currentQuestionData.subtitle}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Circular Text - Visual Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="absolute top-8 right-8 lg:right-16 xl:right-24"
        >
          <div className="relative">
            <CircularText 
              text={currentQuestionData?.circularText || 'CALCULATE ✦ IMPACT ✦ REDUCE ✦ PLANET ✦ '}
              spinDuration={30}
              onHover="speedUp"
              className="w-32 h-32 lg:w-56 lg:h-56 text-accent-green"
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
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                ✦
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Question Cards */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-16">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {currentQuestionData && (
              <QuestionCard
                key={currentQuestion}
                question=""
                subtitle=""
                options={currentQuestionData.options}
                currentValue={getCurrentValue()}
                onChange={handleQuestionChange}
                questionNumber={currentQuestion}
                totalQuestions={totalQuestions}
                compact={true}
              />
            )}
          </AnimatePresence>

          {/* Navigation - Positioned after question cards for better UX flow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center justify-between mt-8"
          >
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestion === 1}
              className="bg-surface-darker/80 border-accent-green/30 text-text-secondary hover:bg-accent-green/15 hover:border-accent-green/50 hover:scale-[1.02] transition-all duration-300 disabled:opacity-30 disabled:hover:scale-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={nextQuestion}
              disabled={isCalculating || !getCurrentValue()}
              className="bg-accent-green hover:bg-accent-green/90 hover:scale-[1.02] text-primary-dark font-medium px-8 transition-all duration-300 disabled:hover:scale-100"
            >
              {isCalculating ? (
                <>
                  <Calculator className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : currentQuestion === totalQuestions ? (
                <>
                  Calculate Results
                  <Calculator className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Layout - Stacked */}
      <div className="lg:hidden fixed inset-x-0 flex flex-col z-20 bg-primary-dark" style={{ top: '96px', bottom: '60px' }}>
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-sm font-mono text-text-secondary">
              <span className="text-accent-green">{currentQuestion.toString().padStart(2, '0')}</span>
              <span>/</span>
              <span>{totalQuestions.toString().padStart(2, '0')}</span>
            </div>
            <div className="w-16 h-0.5 bg-surface-darker mt-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent-green rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            {currentQuestionData && (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mb-6"
              >
                <h1 className="text-2xl font-outfit font-bold text-text-primary leading-tight mb-3">
                  {currentQuestionData.question}
                </h1>
                <p className="text-text-secondary font-mono text-sm leading-relaxed">
                  {currentQuestionData.subtitle}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Options */}
          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              {currentQuestionData && (
                <QuestionCard
                  key={currentQuestion}
                  question=""
                  subtitle=""
                  options={currentQuestionData.options}
                  currentValue={getCurrentValue()}
                  onChange={handleQuestionChange}
                  questionNumber={currentQuestion}
                  totalQuestions={totalQuestions}
                  mobile={true}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestion === 1}
              className="bg-surface-darker/80 border-accent-green/30 text-text-secondary hover:bg-accent-green/15 hover:border-accent-green/50 hover:scale-[1.02] transition-all duration-300 disabled:opacity-30 disabled:hover:scale-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <Button
              onClick={nextQuestion}
              disabled={isCalculating || !getCurrentValue()}
              className="bg-accent-green hover:bg-accent-green/90 hover:scale-[1.02] text-primary-dark font-medium px-8 transition-all duration-300 disabled:hover:scale-100"
            >
              {isCalculating ? (
                <Calculator className="w-4 h-4 animate-spin" />
              ) : currentQuestion === totalQuestions ? (
                <>
                  Calculate
                  <Calculator className="w-4 h-4 ml-2" />
                </>
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
