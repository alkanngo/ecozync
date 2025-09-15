'use server'

import { revalidatePath } from 'next/cache'

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client'

import type { CarbonCalculationInsert } from '../../../types/database'

export async function saveCalculation(calculationData: any) {
  try {
    const supabase = await createSupabaseServerClient()

    // Check if user already has a calculation for today
    const today = new Date().toISOString().split('T')[0]
    const { data: existingCalculation } = await supabase
      .from('carbon_calculations')
      .select('id')
      .eq('user_id', calculationData.user_id)
      .eq('calculation_date', today)
      .single()

    if (existingCalculation) {
      // Update existing calculation
      // @ts-ignore - Temporary type bypass until database types are regenerated
      const { error } = await supabase
        .from('carbon_calculations')
        // @ts-ignore
        .update({
          assessment_data: calculationData.assessment_data,
          transport_emissions: calculationData.transport_emissions,
          energy_emissions: calculationData.energy_emissions,
          diet_emissions: calculationData.diet_emissions,
          lifestyle_emissions: calculationData.lifestyle_emissions,
          travel_emissions: calculationData.travel_emissions,
          other_emissions: calculationData.other_emissions,
          calculation_method: calculationData.calculation_method || 'local_enhanced',
          calculation_confidence: calculationData.calculation_confidence
        })
        .eq('id', (existingCalculation as any).id)

      if (error) {
        console.error('Error updating calculation:', error)
        throw new Error('Failed to update carbon calculation')
      }
    } else {
      // Insert new calculation
      // @ts-ignore - Temporary type bypass until database types are regenerated
      const { error } = await supabase
        .from('carbon_calculations')
        .insert(calculationData)

      if (error) {
        console.error('Error inserting calculation:', error)
        throw new Error('Failed to save carbon calculation')
      }
    }

    // Revalidate relevant pages
    revalidatePath('/calculator')
    revalidatePath('/account')

    return { success: true }
  } catch (error) {
    console.error('Error in saveCalculation:', error)
    throw error
  }
}

export async function getUserCalculations(userId: string, limit: number = 30) {
  try {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
      .from('carbon_calculations')
      .select('*')
      .eq('user_id', userId)
      .order('calculation_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching calculations:', error)
      throw new Error('Failed to fetch calculations')
    }

    return data
  } catch (error) {
    console.error('Error in getUserCalculations:', error)
    throw error
  }
}

export async function getLeaderboardData(timePeriod: string = 'month') {
  try {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await (supabase as any)
      .rpc('get_leaderboard_rankings', { time_period: timePeriod })

    if (error) {
      console.error('Error fetching leaderboard:', error)
      throw new Error('Failed to fetch leaderboard data')
    }

    return data
  } catch (error) {
    console.error('Error in getLeaderboardData:', error)
    throw error
  }
}
