import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client'

interface CalculationStats {
  total_calculations: number
  avg_total_emissions: number
  avg_transport_emissions: number
  avg_energy_emissions: number
  avg_diet_emissions: number
  avg_lifestyle_emissions: number
  avg_travel_emissions: number
  monthly_trend: Array<{
    month: string
    avg_emissions: number
    calculation_count: number
  }>
  category_breakdown: {
    transport_percentage: number
    energy_percentage: number
    diet_percentage: number
    lifestyle_percentage: number
    travel_percentage: number
  }
  reduction_progress: {
    first_calculation_date: string
    latest_calculation_date: string
    first_emissions: number
    latest_emissions: number
    reduction_percentage: number
  } | null
  comparison_metrics: {
    vs_eu_average: number // percentage difference from EU average (8500 kg)
    vs_global_average: number // percentage difference from global average (4800 kg)
    vs_paris_target: number // percentage difference from Paris target (2300 kg)
    trees_to_offset: number
    equivalent_car_kilometers: number
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get('months') || '12') // Default to 12 months

    // Fetch all user calculations
    const { data: calculations, error } = await supabase
      .from('carbon_calculations')
      .select('*')
      .eq('user_id', user.id)
      .order('calculation_date', { ascending: true })

    if (error) {
      console.error('Error fetching calculations for stats:', error)
      return NextResponse.json({ error: 'Failed to fetch calculation statistics' }, { status: 500 })
    }

    if (!calculations || calculations.length === 0) {
      return NextResponse.json({
        total_calculations: 0,
        avg_total_emissions: 0,
        avg_transport_emissions: 0,
        avg_energy_emissions: 0,
        avg_diet_emissions: 0,
        avg_lifestyle_emissions: 0,
        avg_travel_emissions: 0,
        monthly_trend: [],
        category_breakdown: {
          transport_percentage: 0,
          energy_percentage: 0,
          diet_percentage: 0,
          lifestyle_percentage: 0,
          travel_percentage: 0
        },
        reduction_progress: null,
        comparison_metrics: {
          vs_eu_average: 0,
          vs_global_average: 0,
          vs_paris_target: 0,
          trees_to_offset: 0,
          equivalent_car_kilometers: 0
        }
      })
    }

    // Calculate basic statistics
    const totalCalculations = calculations.length
    const avgTotalEmissions = calculations.reduce((sum, calc) => sum + calc.total_emissions, 0) / totalCalculations
    const avgTransportEmissions = calculations.reduce((sum, calc) => sum + calc.transport_emissions, 0) / totalCalculations
    const avgEnergyEmissions = calculations.reduce((sum, calc) => sum + calc.energy_emissions, 0) / totalCalculations
    const avgDietEmissions = calculations.reduce((sum, calc) => sum + calc.diet_emissions, 0) / totalCalculations
    const avgLifestyleEmissions = calculations.reduce((sum, calc) => sum + calc.lifestyle_emissions, 0) / totalCalculations
    const avgTravelEmissions = calculations.reduce((sum, calc) => sum + calc.travel_emissions, 0) / totalCalculations

    // Calculate category breakdown percentages
    const totalAvgEmissions = avgTransportEmissions + avgEnergyEmissions + avgDietEmissions + avgLifestyleEmissions + avgTravelEmissions
    const categoryBreakdown = {
      transport_percentage: totalAvgEmissions > 0 ? (avgTransportEmissions / totalAvgEmissions) * 100 : 0,
      energy_percentage: totalAvgEmissions > 0 ? (avgEnergyEmissions / totalAvgEmissions) * 100 : 0,
      diet_percentage: totalAvgEmissions > 0 ? (avgDietEmissions / totalAvgEmissions) * 100 : 0,
      lifestyle_percentage: totalAvgEmissions > 0 ? (avgLifestyleEmissions / totalAvgEmissions) * 100 : 0,
      travel_percentage: totalAvgEmissions > 0 ? (avgTravelEmissions / totalAvgEmissions) * 100 : 0
    }

    // Calculate monthly trend (last N months)
    const monthlyData = new Map<string, { total: number, count: number }>()
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - months)

    calculations
      .filter(calc => new Date(calc.calculation_date) >= cutoffDate)
      .forEach(calc => {
        const monthKey = calc.calculation_date.substring(0, 7) // YYYY-MM format
        const existing = monthlyData.get(monthKey) || { total: 0, count: 0 }
        monthlyData.set(monthKey, {
          total: existing.total + calc.total_emissions,
          count: existing.count + 1
        })
      })

    const monthlyTrend = Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        avg_emissions: Math.round(data.total / data.count),
        calculation_count: data.count
      }))

    // Calculate reduction progress
    let reductionProgress = null
    if (calculations.length >= 2) {
      const firstCalc = calculations[0]
      const latestCalc = calculations[calculations.length - 1]
      
      reductionProgress = {
        first_calculation_date: firstCalc.calculation_date,
        latest_calculation_date: latestCalc.calculation_date,
        first_emissions: firstCalc.total_emissions,
        latest_emissions: latestCalc.total_emissions,
        reduction_percentage: firstCalc.total_emissions > 0 
          ? ((firstCalc.total_emissions - latestCalc.total_emissions) / firstCalc.total_emissions) * 100 
          : 0
      }
    }

    // Calculate comparison metrics
    const euAverage = 8500 // kg CO2e per person per year
    const globalAverage = 4800
    const parisTarget = 2300 // 1.5°C pathway target

    const comparisonMetrics = {
      vs_eu_average: euAverage > 0 ? ((avgTotalEmissions - euAverage) / euAverage) * 100 : 0,
      vs_global_average: globalAverage > 0 ? ((avgTotalEmissions - globalAverage) / globalAverage) * 100 : 0,
      vs_paris_target: parisTarget > 0 ? ((avgTotalEmissions - parisTarget) / parisTarget) * 100 : 0,
      trees_to_offset: Math.ceil(avgTotalEmissions / 22), // Average tree absorbs 22kg CO2/year
      equivalent_car_kilometers: Math.round(avgTotalEmissions / 0.21) // 0.21 kg CO2/km average
    }

    const stats: CalculationStats = {
      total_calculations: totalCalculations,
      avg_total_emissions: Math.round(avgTotalEmissions),
      avg_transport_emissions: Math.round(avgTransportEmissions),
      avg_energy_emissions: Math.round(avgEnergyEmissions),
      avg_diet_emissions: Math.round(avgDietEmissions),
      avg_lifestyle_emissions: Math.round(avgLifestyleEmissions),
      avg_travel_emissions: Math.round(avgTravelEmissions),
      monthly_trend: monthlyTrend,
      category_breakdown: categoryBreakdown,
      reduction_progress: reductionProgress,
      comparison_metrics: comparisonMetrics
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error in calculation stats route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
