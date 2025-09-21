// Service to handle calculations that need to be saved after OAuth
import type { EmissionCalculation } from '@/components/calculator/calculation-engine'
import type { AssessmentData } from '@/libs/supabase/types'

const PENDING_CALCULATION_KEY = 'ecozync_pending_calculation'

export interface PendingCalculation {
  results: EmissionCalculation
  assessmentData: AssessmentData
  timestamp: string
}

export const PendingCalculationService = {
  // Store calculation data during OAuth flow
  storePendingCalculation(results: EmissionCalculation, assessmentData: AssessmentData): void {
    try {
      const pendingCalculation: PendingCalculation = {
        results,
        assessmentData,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(PENDING_CALCULATION_KEY, JSON.stringify(pendingCalculation))
      console.log('Stored pending calculation for post-OAuth save')
    } catch (error) {
      console.error('Failed to store pending calculation:', error)
    }
  },

  // Retrieve pending calculation
  getPendingCalculation(): PendingCalculation | null {
    try {
      const stored = localStorage.getItem(PENDING_CALCULATION_KEY)
      if (!stored) return null
      
      const pendingCalculation = JSON.parse(stored) as PendingCalculation
      
      // Check if calculation is too old (more than 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      if (new Date(pendingCalculation.timestamp) < oneHourAgo) {
        this.clearPendingCalculation()
        return null
      }
      
      return pendingCalculation
    } catch (error) {
      console.error('Failed to retrieve pending calculation:', error)
      return null
    }
  },

  // Clear pending calculation after successful save
  clearPendingCalculation(): void {
    try {
      localStorage.removeItem(PENDING_CALCULATION_KEY)
      console.log('Cleared pending calculation')
    } catch (error) {
      console.error('Failed to clear pending calculation:', error)
    }
  },

  // Check if there's a pending calculation
  hasPendingCalculation(): boolean {
    return this.getPendingCalculation() !== null
  }
}
