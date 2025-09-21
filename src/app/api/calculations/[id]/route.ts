import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const calculationId = params.id

    // Fetch specific calculation
    const { data, error } = await (supabase as any)
      .from('carbon_calculations')
      .select('*')
      .eq('id', calculationId)
      .eq('user_id', user.id) // Ensure user can only access their own calculations
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Calculation not found' }, { status: 404 })
      }
      console.error('Error fetching calculation:', error)
      return NextResponse.json({ error: 'Failed to fetch calculation' }, { status: 500 })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in calculation detail route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const calculationId = params.id
    const updateData = await request.json()

    // Build update object manually to avoid type issues
    const fieldsToUpdate: Record<string, any> = {}

    // Only allow specific fields to be updated
    const allowedFields = [
      'calculation_date',
      'assessment_data',
      'transport_emissions',
      'energy_emissions',
      'diet_emissions',
      'lifestyle_emissions',
      'travel_emissions',
      'other_emissions',
      'calculation_method',
      'calculation_confidence'
    ]

    // Add only the allowed fields that are present in updateData
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        fieldsToUpdate[field] = updateData[field]
      }
    }

    // Always update the timestamp
    fieldsToUpdate.updated_at = new Date().toISOString()

    // Use type assertion to bypass the typing issues
    const { data, error } = await (supabase as any)
      .from('carbon_calculations')
      .update(fieldsToUpdate)
      .eq('id', calculationId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Calculation not found' }, { status: 404 })
      }
      console.error('Error updating calculation:', error)
      return NextResponse.json({ error: 'Failed to update calculation' }, { status: 500 })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in calculation update route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const calculationId = params.id

    // Delete calculation
    const { error } = await supabase
      .from('carbon_calculations')
      .delete()
      .eq('id', calculationId)
      .eq('user_id', user.id) // Ensure user can only delete their own calculations

    if (error) {
      console.error('Error deleting calculation:', error)
      return NextResponse.json({ error: 'Failed to delete calculation' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Calculation deleted successfully' })

  } catch (error) {
    console.error('Error in calculation delete route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
