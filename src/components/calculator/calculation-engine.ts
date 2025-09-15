import type { AssessmentData,CarbonCalculationInsert } from '../../../types/database'

import { 
  EMISSION_FACTORS, 
  getDefaultElectricityFactor, 
  getDefaultTransportFactor, 
  getEmissionFactor} from './emission-factors'

// Legacy EU emission factors for backwards compatibility
export const EU_EMISSION_FACTORS = {
  // Energy (per kWh)
  naturalGas: 0.202,
  electricity: 0.266, // EU average grid electricity
  renewableElectricity: 0.02,
  oil: 0.267,
  
  // Transport (per km)
  carGasoline: 0.21,
  carDiesel: 0.169,
  carElectric: 0.053,
  carHybrid: 0.109,
  publicTransport: 0.04,
  
  // Aviation (per km)
  flightShort: 0.255, // <3 hours
  flightMedium: 0.195, // 3-6 hours  
  flightLong: 0.150, // >6 hours
  
  // Diet (tonnes CO2e per year)
  dietVegan: 1.0,
  dietVegetarian: 1.5,
  dietPescatarian: 2.0,
  dietOmnivore: 3.0,
  
  // Lifestyle (kg CO2e per item/year)
  shoppingFrequent: 1200, // monthly
  shoppingModerate: 800,  // every few months
  shoppingLow: 400,       // yearly
  shoppingMinimal: 200,   // rarely
  
  // Waste (reduction factor)
  wasteReduction: {
    everything_trash: 1.0,
    some_recycling: 0.85,
    mostly_recycle: 0.6,
    compost_too: 0.4
  }
}

export interface QuestionResponses {
  // Energy
  heating_type: 'gas' | 'electric' | 'renewable' | 'oil'
  monthly_energy_bill: number
  home_size?: number
  
  // Transport  
  primary_transport: 'car_alone' | 'car_carpool' | 'public_transport' | 'bike_walk'
  fuel_type?: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
  weekly_km: number
  
  // Aviation
  short_flights: number
  medium_flights: number
  long_flights: number
  
  // Diet
  diet_type: 'vegan' | 'vegetarian' | 'pescatarian' | 'omnivore'
  
  // Lifestyle
  shopping_frequency: 'monthly' | 'every_few_months' | 'yearly' | 'rarely'
  
  // Waste
  waste_management: 'everything_trash' | 'some_recycling' | 'mostly_recycle' | 'compost_too'
}

export interface EmissionCalculation {
  transport_emissions: number
  energy_emissions: number
  diet_emissions: number
  lifestyle_emissions: number
  travel_emissions: number
  other_emissions: number
  total_emissions: number
  confidence_score: number
}

/**
 * Calculate emissions using external API (placeholder for future integrations)
 * Currently disabled in favor of local calculation
 */
export async function calculateWithExternalAPI(inputs: QuestionResponses): Promise<EmissionCalculation | null> {
  // Disabled: External API integration removed in favor of comprehensive local calculation
  // Future integrations can be added here (EPA API, EU ETS API, etc.)
  console.info('External API calculation disabled - using local calculation instead')
  return null
}

/**
 * Enhanced local emission calculation using comprehensive emission factors
 */
export function calculateLocal(inputs: QuestionResponses): EmissionCalculation {
  // Energy emissions (annual)
  const energy_emissions = calculateEnergyEmissionsEnhanced(inputs)
  
  // Transport emissions (annual)
  const transport_emissions = calculateTransportEmissionsEnhanced(inputs)
  
  // Aviation emissions (annual)
  const travel_emissions = calculateAviationEmissionsEnhanced(inputs)
  
  // Diet emissions (annual)
  const diet_emissions = calculateDietEmissionsEnhanced(inputs)
  
  // Lifestyle emissions (annual)
  const lifestyle_emissions = calculateLifestyleEmissionsEnhanced(inputs)
  
  // Waste emissions (annual)
  const waste_emissions = calculateWasteEmissions(inputs)
  
  const total_emissions = energy_emissions + transport_emissions + travel_emissions + diet_emissions + lifestyle_emissions + waste_emissions
  
  return {
    transport_emissions: Math.round(transport_emissions),
    energy_emissions: Math.round(energy_emissions),
    diet_emissions: Math.round(diet_emissions),
    lifestyle_emissions: Math.round(lifestyle_emissions),
    travel_emissions: Math.round(travel_emissions),
    other_emissions: Math.round(waste_emissions),
    total_emissions: Math.round(total_emissions),
    confidence_score: 0.90 // Higher confidence with comprehensive factors
  }
}

/**
 * Fallback calculation using simplified EU factors
 */
export function calculateLocalLegacy(inputs: QuestionResponses): EmissionCalculation {
  // Energy emissions (annual)
  const energy_emissions = calculateEnergyEmissions(inputs)
  
  // Transport emissions (annual)
  const transport_emissions = calculateTransportEmissions(inputs)
  
  // Aviation emissions (annual)
  const travel_emissions = calculateAviationEmissions(inputs)
  
  // Diet emissions (annual)
  const diet_emissions = calculateDietEmissions(inputs)
  
  // Lifestyle emissions (annual)
  const lifestyle_emissions = calculateLifestyleEmissions(inputs)
  
  // Apply waste reduction factor
  const wasteReduction = EU_EMISSION_FACTORS.wasteReduction[inputs.waste_management] || 1.0
  const adjustedLifestyle = lifestyle_emissions * wasteReduction
  
  const total_emissions = energy_emissions + transport_emissions + travel_emissions + diet_emissions + adjustedLifestyle
  
  return {
    transport_emissions: Math.round(transport_emissions),
    energy_emissions: Math.round(energy_emissions),
    diet_emissions: Math.round(diet_emissions),
    lifestyle_emissions: Math.round(adjustedLifestyle),
    travel_emissions: Math.round(travel_emissions),
    other_emissions: 0,
    total_emissions: Math.round(total_emissions),
    confidence_score: 0.85
  }
}

function calculateEnergyEmissions(inputs: QuestionResponses): number {
  // Estimate annual kWh from monthly bill (assuming €0.25/kWh EU average)
  const estimatedAnnualKwh = (inputs.monthly_energy_bill * 12) / 0.25
  
  let emissionFactor: number
  switch (inputs.heating_type) {
    case 'gas':
      emissionFactor = EU_EMISSION_FACTORS.naturalGas
      break
    case 'renewable':
      emissionFactor = EU_EMISSION_FACTORS.renewableElectricity
      break
    case 'oil':
      emissionFactor = EU_EMISSION_FACTORS.oil
      break
    case 'electric':
    default:
      emissionFactor = EU_EMISSION_FACTORS.electricity
      break
  }
  
  return estimatedAnnualKwh * emissionFactor
}

function calculateTransportEmissions(inputs: QuestionResponses): number {
  if (inputs.primary_transport === 'bike_walk') {
    return 0
  }
  
  const annualKm = inputs.weekly_km * 52
  
  if (inputs.primary_transport === 'public_transport') {
    return annualKm * EU_EMISSION_FACTORS.publicTransport
  }
  
  // Car emissions
  let emissionFactor: number
  switch (inputs.fuel_type) {
    case 'electric':
      emissionFactor = EU_EMISSION_FACTORS.carElectric
      break
    case 'hybrid':
      emissionFactor = EU_EMISSION_FACTORS.carHybrid
      break
    case 'diesel':
      emissionFactor = EU_EMISSION_FACTORS.carDiesel
      break
    case 'gasoline':
    default:
      emissionFactor = EU_EMISSION_FACTORS.carGasoline
      break
  }
  
  // Apply carpool reduction
  const carpoolFactor = inputs.primary_transport === 'car_carpool' ? 0.5 : 1.0
  
  return annualKm * emissionFactor * carpoolFactor
}

function calculateAviationEmissions(inputs: QuestionResponses): number {
  const shortFlightEmissions = inputs.short_flights * 500 * EU_EMISSION_FACTORS.flightShort // 500km average
  const mediumFlightEmissions = inputs.medium_flights * 1500 * EU_EMISSION_FACTORS.flightMedium // 1500km average
  const longFlightEmissions = inputs.long_flights * 8000 * EU_EMISSION_FACTORS.flightLong // 8000km average
  
  return shortFlightEmissions + mediumFlightEmissions + longFlightEmissions
}

function calculateDietEmissions(inputs: QuestionResponses): number {
  const dietFactors = {
    vegan: EU_EMISSION_FACTORS.dietVegan,
    vegetarian: EU_EMISSION_FACTORS.dietVegetarian,
    pescatarian: EU_EMISSION_FACTORS.dietPescatarian,
    omnivore: EU_EMISSION_FACTORS.dietOmnivore
  }
  
  return (dietFactors[inputs.diet_type] || dietFactors.omnivore) * 1000 // Convert to kg
}

function calculateLifestyleEmissions(inputs: QuestionResponses): number {
  const shoppingFactors = {
    monthly: EU_EMISSION_FACTORS.shoppingFrequent,
    every_few_months: EU_EMISSION_FACTORS.shoppingModerate,
    yearly: EU_EMISSION_FACTORS.shoppingLow,
    rarely: EU_EMISSION_FACTORS.shoppingMinimal
  }
  
  return shoppingFactors[inputs.shopping_frequency] || shoppingFactors.yearly
}

// Enhanced calculation functions using comprehensive emission factors
function calculateEnergyEmissionsEnhanced(inputs: QuestionResponses): number {
  // Estimate annual kWh from monthly bill (assuming €0.25/kWh EU average)
  const estimatedAnnualKwh = (inputs.monthly_energy_bill * 12) / 0.25
  
  let emissionFactor: number
  switch (inputs.heating_type) {
    case 'gas':
      emissionFactor = EMISSION_FACTORS.heating.natural_gas.factor
      break
    case 'renewable':
      emissionFactor = EMISSION_FACTORS.electricity.renewable.factor
      break
    case 'oil':
      emissionFactor = EMISSION_FACTORS.heating.heating_oil.factor
      break
    case 'electric':
    default:
      emissionFactor = getDefaultElectricityFactor('eu').factor
      break
  }
  
  return estimatedAnnualKwh * emissionFactor
}

function calculateTransportEmissionsEnhanced(inputs: QuestionResponses): number {
  if (inputs.primary_transport === 'bike_walk') {
    return 0
  }
  
  const annualKm = inputs.weekly_km * 52
  
  if (inputs.primary_transport === 'public_transport') {
    return annualKm * EMISSION_FACTORS.transport.bus_local.factor
  }
  
  // Car emissions with detailed fuel types
  let emissionFactor: number
  switch (inputs.fuel_type) {
    case 'electric':
      emissionFactor = EMISSION_FACTORS.transport.car_electric.factor
      break
    case 'hybrid':
      emissionFactor = EMISSION_FACTORS.transport.car_hybrid.factor
      break
    case 'diesel':
      emissionFactor = EMISSION_FACTORS.transport.car_diesel_medium.factor
      break
    case 'gasoline':
    default:
      emissionFactor = EMISSION_FACTORS.transport.car_petrol_medium.factor
      break
  }
  
  // Apply carpool reduction
  const carpoolFactor = inputs.primary_transport === 'car_carpool' ? 0.5 : 1.0
  
  return annualKm * emissionFactor * carpoolFactor
}

function calculateAviationEmissionsEnhanced(inputs: QuestionResponses): number {
  // More accurate flight distances and emissions
  const shortFlightEmissions = inputs.short_flights * 500 * EMISSION_FACTORS.aviation.flight_short_economy.factor
  const mediumFlightEmissions = inputs.medium_flights * 1500 * EMISSION_FACTORS.aviation.flight_medium_economy.factor
  const longFlightEmissions = inputs.long_flights * 8000 * EMISSION_FACTORS.aviation.flight_long_economy.factor
  
  return shortFlightEmissions + mediumFlightEmissions + longFlightEmissions
}

function calculateDietEmissionsEnhanced(inputs: QuestionResponses): number {
  const dietFactors = {
    vegan: EMISSION_FACTORS.diet.vegan.factor,
    vegetarian: EMISSION_FACTORS.diet.vegetarian.factor,
    pescatarian: EMISSION_FACTORS.diet.meat_sometimes.factor, // Map pescatarian to medium meat
    omnivore: EMISSION_FACTORS.diet.meat_daily.factor
  }
  
  return dietFactors[inputs.diet_type] || dietFactors.omnivore
}

function calculateLifestyleEmissionsEnhanced(inputs: QuestionResponses): number {
  const shoppingFactors = {
    monthly: EMISSION_FACTORS.consumption.shopping_monthly.factor,
    every_few_months: EMISSION_FACTORS.consumption.shopping_quarterly.factor,
    yearly: EMISSION_FACTORS.consumption.shopping_yearly.factor,
    rarely: EMISSION_FACTORS.consumption.shopping_rarely.factor
  }
  
  return shoppingFactors[inputs.shopping_frequency] || shoppingFactors.yearly
}

function calculateWasteEmissions(inputs: QuestionResponses): number {
  const wasteFactors = {
    everything_trash: EMISSION_FACTORS.waste.waste_everything_trash.factor,
    some_recycling: EMISSION_FACTORS.waste.waste_some_recycling.factor,
    mostly_recycle: EMISSION_FACTORS.waste.waste_mostly_recycle.factor,
    compost_too: EMISSION_FACTORS.waste.waste_compost_recycle.factor
  }
  
  return wasteFactors[inputs.waste_management] || wasteFactors.some_recycling
}

/**
 * Main calculation function - uses comprehensive local calculation
 */
export async function calculateEmissions(inputs: QuestionResponses): Promise<EmissionCalculation> {
  // Use comprehensive local calculation as primary and only method
  try {
    console.info('Using enhanced local emission calculation with comprehensive factors')
    return calculateLocal(inputs)
  } catch (error) {
    console.error('Enhanced calculation failed, falling back to legacy calculation:', error)
    
    // Fallback to legacy calculation if enhanced calculation fails
    return calculateLocalLegacy(inputs)
  }
}

/**
 * Convert AssessmentData to QuestionResponses format
 */
export function convertAssessmentToResponses(assessment: AssessmentData): QuestionResponses {
  // Convert monthly energy cost to monthly bill estimate
  const convertEnergyBill = (costRange: string): number => {
    switch (costRange) {
      case '0-50': return 25
      case '50-100': return 75
      case '100-200': return 150
      case '200+': return 250
      default: return 150
    }
  }

  // Convert weekly distance to km
  const convertWeeklyDistance = (distanceRange: string): number => {
    switch (distanceRange) {
      case '0-50': return 25
      case '50-150': return 100
      case '150-300': return 225
      case '300+': return 400
      default: return 100
    }
  }

  // Convert annual flights to numbers for different categories
  const convertAnnualFlights = (flightRange: string): { short: number; medium: number; long: number } => {
    switch (flightRange) {
      case 'none': return { short: 0, medium: 0, long: 0 }
      case '1-2': return { short: 1, medium: 1, long: 0 }
      case '3-5': return { short: 2, medium: 2, long: 1 }
      case '6+': return { short: 3, medium: 3, long: 2 }
      default: return { short: 0, medium: 0, long: 0 }
    }
  }

  const flightData = convertAnnualFlights((assessment.transport as any)?.annual_flights || 'none')

  return {
    // Energy
    heating_type: assessment.energy?.heating_type as any || 'electric',
    monthly_energy_bill: (assessment.energy as any)?.monthly_energy_cost 
      ? convertEnergyBill((assessment.energy as any).monthly_energy_cost)
      : 150,
    
    // Transport
    primary_transport: (assessment.transport as any)?.primary_transport || 'car_alone',
    fuel_type: assessment.transport?.fuel_type as any || 'gasoline',
    weekly_km: (assessment.transport as any)?.weekly_distance
      ? convertWeeklyDistance((assessment.transport as any).weekly_distance)
      : 100,
    
    // Aviation
    short_flights: flightData.short,
    medium_flights: flightData.medium,
    long_flights: flightData.long,
    
    // Diet
    diet_type: assessment.diet?.diet_type as any || 'omnivore',
    
    // Lifestyle
    shopping_frequency: assessment.lifestyle?.shopping_frequency as any || 'yearly',
    
    // Waste
    waste_management: (assessment.lifestyle as any)?.waste_management || 'some_recycling'
  }
}

/**
 * Get comparison metrics for context
 */
export function getComparisonMetrics(totalEmissions: number) {
  const euAverage = 8500 // kg CO2e per person per year
  const globalAverage = 4800
  const parisTarget = 2300 // 1.5°C pathway target
  
  return {
    vsEuAverage: ((totalEmissions - euAverage) / euAverage * 100),
    vsGlobalAverage: ((totalEmissions - globalAverage) / globalAverage * 100),
    vsParisTarget: ((totalEmissions - parisTarget) / parisTarget * 100),
    treesToOffset: Math.ceil(totalEmissions / 22), // Average tree absorbs 22kg CO2/year
    carsOffRoad: totalEmissions / 4600, // Average car emits 4.6 tonnes/year
    householdsDays: totalEmissions / (euAverage / 365) // Days of average household emissions
  }
}
