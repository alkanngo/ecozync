import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client'
import type { CarbonCalculation } from '@/libs/supabase/types'

interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  page_size: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

interface CalculationFilters {
  start_date?: string
  end_date?: string
  min_emissions?: number
  max_emissions?: number
}

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(parseInt(searchParams.get('page_size') || '20'), 100) // Max 100 items
    const offset = (page - 1) * pageSize

    // Filter parameters
    const filters: CalculationFilters = {
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      min_emissions: searchParams.get('min_emissions') ? parseFloat(searchParams.get('min_emissions')!) : undefined,
      max_emissions: searchParams.get('max_emissions') ? parseFloat(searchParams.get('max_emissions')!) : undefined,
    }

    // Build query
    let query = supabase
      .from('carbon_calculations')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('calculation_date', { ascending: false })

    // Apply filters
    if (filters.start_date) {
      query = query.gte('calculation_date', filters.start_date)
    }
    if (filters.end_date) {
      query = query.lte('calculation_date', filters.end_date)
    }
    if (filters.min_emissions) {
      query = query.gte('total_emissions', filters.min_emissions)
    }
    if (filters.max_emissions) {
      query = query.lte('total_emissions', filters.max_emissions)
    }

    // Execute query with pagination
    const { data, error, count } = await query
      .range(offset, offset + pageSize - 1)

    if (error) {
      console.error('Error fetching calculations:', error)
      return NextResponse.json({ error: 'Failed to fetch calculations' }, { status: 500 })
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / pageSize)
    const hasNext = page < totalPages
    const hasPrevious = page > 1

    const response: PaginatedResponse<CarbonCalculation> = {
      data: data || [],
      count: count || 0,
      page,
      page_size: pageSize,
      total_pages: totalPages,
      has_next: hasNext,
      has_previous: hasPrevious
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in calculations API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const calculationData = await request.json()
    
    // Validate required fields
    if (!calculationData.calculation_date || !calculationData.total_emissions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Add user ID and timestamp
    const dataToInsert = {
      ...calculationData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Check if calculation already exists for this date
    const { data: existingCalculation } = await supabase
      .from('carbon_calculations')
      .select('id')
      .eq('user_id', user.id)
      .eq('calculation_date', calculationData.calculation_date)
      .single()

    let result
    if (existingCalculation) {
      // Update existing calculation
      const { data, error } = await (supabase as any)
        .from('carbon_calculations')
        .update({
          ...dataToInsert,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCalculation.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating calculation:', error)
        return NextResponse.json({ error: 'Failed to update calculation' }, { status: 500 })
      }
      result = data
    } else {
      // Insert new calculation
      const { data, error } = await supabase
        .from('carbon_calculations')
        .insert(dataToInsert)
        .select()
        .single()

      if (error) {
        console.error('Error inserting calculation:', error)
        return NextResponse.json({ error: 'Failed to save calculation' }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json(result, { status: existingCalculation ? 200 : 201 })

  } catch (error) {
    console.error('Error in calculations POST route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
