// Local storage utilities for anonymous users
import type { AssessmentData } from '@/libs/supabase/types'

import type { EmissionCalculation } from './calculation-engine'

const STORAGE_KEYS = {
  ASSESSMENT_DATA: 'ecozync_assessment_data',
  LAST_CALCULATION: 'ecozync_last_calculation',
  CALCULATION_HISTORY: 'ecozync_calculation_history'
} as const

interface StoredCalculation {
  date: string
  results: EmissionCalculation
  assessmentData: AssessmentData
}

export const LocalStorage = {
  // Assessment data (for preserving form state)
  saveAssessmentData(data: AssessmentData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSESSMENT_DATA, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save assessment data to localStorage:', error)
    }
  },

  getAssessmentData(): AssessmentData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ASSESSMENT_DATA)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn('Failed to retrieve assessment data from localStorage:', error)
      return null
    }
  },

  clearAssessmentData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ASSESSMENT_DATA)
    } catch (error) {
      console.warn('Failed to clear assessment data from localStorage:', error)
    }
  },

  // Last calculation (for showing recent results)
  saveLastCalculation(results: EmissionCalculation, assessmentData: AssessmentData): void {
    try {
      const calculation: StoredCalculation = {
        date: new Date().toISOString(),
        results,
        assessmentData
      }
      localStorage.setItem(STORAGE_KEYS.LAST_CALCULATION, JSON.stringify(calculation))
    } catch (error) {
      console.warn('Failed to save calculation to localStorage:', error)
    }
  },

  getLastCalculation(): StoredCalculation | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAST_CALCULATION)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn('Failed to retrieve calculation from localStorage:', error)
      return null
    }
  },

  // Calculation history (limited for anonymous users)
  saveToHistory(results: EmissionCalculation, assessmentData: AssessmentData): void {
    try {
      const calculation: StoredCalculation = {
        date: new Date().toISOString(),
        results,
        assessmentData
      }

      const history = this.getCalculationHistory()
      const updatedHistory = [calculation, ...history].slice(0, 5) // Keep only last 5

      localStorage.setItem(STORAGE_KEYS.CALCULATION_HISTORY, JSON.stringify(updatedHistory))
    } catch (error) {
      console.warn('Failed to save calculation history to localStorage:', error)
    }
  },

  getCalculationHistory(): StoredCalculation[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CALCULATION_HISTORY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Failed to retrieve calculation history from localStorage:', error)
      return []
    }
  },

  // Clear all anonymous data (for privacy)
  clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.warn('Failed to clear localStorage data:', error)
    }
  },

  // Check if data exists (for showing hints to sign up)
  hasStoredData(): boolean {
    try {
      return !!(
        localStorage.getItem(STORAGE_KEYS.LAST_CALCULATION) ||
        localStorage.getItem(STORAGE_KEYS.CALCULATION_HISTORY)
      )
    } catch (error) {
      return false
    }
  },

  // Get storage usage estimate (for showing value to user)
  getStorageStats(): { calculations: number, lastCalculationDate: string | null } {
    try {
      const history = this.getCalculationHistory()
      const lastCalc = this.getLastCalculation()
      
      return {
        calculations: history.length,
        lastCalculationDate: lastCalc?.date || null
      }
    } catch (error) {
      return { calculations: 0, lastCalculationDate: null }
    }
  }
}

// Hook for React components
export function useLocalCalculationStorage() {
  const saveCalculation = (results: EmissionCalculation, assessmentData: AssessmentData) => {
    LocalStorage.saveLastCalculation(results, assessmentData)
    LocalStorage.saveToHistory(results, assessmentData)
  }

  const getLastCalculation = () => LocalStorage.getLastCalculation()
  
  const getHistory = () => LocalStorage.getCalculationHistory()
  
  const hasData = () => LocalStorage.hasStoredData()
  
  const clearData = () => LocalStorage.clearAllData()

  const getStats = () => LocalStorage.getStorageStats()

  return {
    saveCalculation,
    getLastCalculation,
    getHistory,
    hasData,
    clearData,
    getStats
  }
}
