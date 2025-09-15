// Comprehensive emission factors database using public sources
// Sources: EPA, DEFRA, IPCC, UK Government GHG Conversion Factors

export interface EmissionFactor {
  factor: number
  unit: string
  source: string
  region: string
  year: number
  category: string
  subcategory: string
}

// All emission factors in kg CO2e per unit
export const EMISSION_FACTORS = {
  // ENERGY & ELECTRICITY (kg CO2e/kWh)
  electricity: {
    eu_average: { factor: 0.295, unit: 'kg CO2e/kWh', source: 'EEA 2023', region: 'EU', year: 2023, category: 'energy', subcategory: 'electricity' },
    germany: { factor: 0.420, unit: 'kg CO2e/kWh', source: 'UBA 2023', region: 'DE', year: 2023, category: 'energy', subcategory: 'electricity' },
    france: { factor: 0.057, unit: 'kg CO2e/kWh', source: 'RTE 2023', region: 'FR', year: 2023, category: 'energy', subcategory: 'electricity' },
    uk: { factor: 0.193, unit: 'kg CO2e/kWh', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'energy', subcategory: 'electricity' },
    us_average: { factor: 0.393, unit: 'kg CO2e/kWh', source: 'EPA 2023', region: 'US', year: 2023, category: 'energy', subcategory: 'electricity' },
    renewable: { factor: 0.020, unit: 'kg CO2e/kWh', source: 'IPCC 2014', region: 'Global', year: 2014, category: 'energy', subcategory: 'renewable' }
  },

  // HEATING FUELS (kg CO2e/kWh)
  heating: {
    natural_gas: { factor: 0.202, unit: 'kg CO2e/kWh', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'energy', subcategory: 'natural_gas' },
    heating_oil: { factor: 0.245, unit: 'kg CO2e/kWh', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'energy', subcategory: 'heating_oil' },
    lpg: { factor: 0.214, unit: 'kg CO2e/kWh', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'energy', subcategory: 'lpg' },
    coal: { factor: 0.364, unit: 'kg CO2e/kWh', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'energy', subcategory: 'coal' }
  },

  // TRANSPORTATION (kg CO2e/km)
  transport: {
    // Cars by fuel type
    car_petrol_small: { factor: 0.154, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'car_petrol_small' },
    car_petrol_medium: { factor: 0.192, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'car_petrol_medium' },
    car_petrol_large: { factor: 0.282, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'car_petrol_large' },
    car_diesel_small: { factor: 0.142, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'car_diesel_small' },
    car_diesel_medium: { factor: 0.171, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'car_diesel_medium' },
    car_diesel_large: { factor: 0.209, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'car_diesel_large' },
    car_hybrid: { factor: 0.109, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'car_hybrid' },
    car_electric: { factor: 0.047, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'car_electric' },
    
    // Public transport
    bus_local: { factor: 0.082, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'bus_local' },
    bus_coach: { factor: 0.028, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'bus_coach' },
    train_local: { factor: 0.035, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'train_local' },
    train_intercity: { factor: 0.028, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'train_intercity' },
    metro_tram: { factor: 0.030, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'metro' },
    
    // Active transport
    bicycle: { factor: 0.006, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'bicycle' },
    walking: { factor: 0.000, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'walking' },
    
    // Motorcycles
    motorcycle_small: { factor: 0.084, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'motorcycle_small' },
    motorcycle_large: { factor: 0.134, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'transport', subcategory: 'motorcycle_large' }
  },

  // AVIATION (kg CO2e/km per passenger)
  aviation: {
    // Short haul flights (<3 hours)
    flight_short_economy: { factor: 0.255, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'aviation', subcategory: 'short_economy' },
    flight_short_business: { factor: 0.383, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'aviation', subcategory: 'short_business' },
    
    // Medium haul flights (3-6 hours)
    flight_medium_economy: { factor: 0.195, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'aviation', subcategory: 'medium_economy' },
    flight_medium_business: { factor: 0.312, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'aviation', subcategory: 'medium_business' },
    
    // Long haul flights (>6 hours)
    flight_long_economy: { factor: 0.150, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'aviation', subcategory: 'long_economy' },
    flight_long_premium: { factor: 0.240, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'aviation', subcategory: 'long_premium' },
    flight_long_business: { factor: 0.435, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'aviation', subcategory: 'long_business' },
    flight_long_first: { factor: 0.600, unit: 'kg CO2e/km', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'aviation', subcategory: 'long_first' }
  },

  // DIET & FOOD (kg CO2e/kg of food, converted to annual estimates)
  diet: {
    // Annual emissions by diet type (kg CO2e/year)
    meat_daily: { factor: 3300, unit: 'kg CO2e/year', source: 'Oxford 2023', region: 'Global', year: 2023, category: 'diet', subcategory: 'high_meat' },
    meat_sometimes: { factor: 2000, unit: 'kg CO2e/year', source: 'Oxford 2023', region: 'Global', year: 2023, category: 'diet', subcategory: 'medium_meat' },
    vegetarian: { factor: 1700, unit: 'kg CO2e/year', source: 'Oxford 2023', region: 'Global', year: 2023, category: 'diet', subcategory: 'vegetarian' },
    vegan: { factor: 1200, unit: 'kg CO2e/year', source: 'Oxford 2023', region: 'Global', year: 2023, category: 'diet', subcategory: 'vegan' },
    
    // Individual food items (kg CO2e/kg)
    beef: { factor: 60.0, unit: 'kg CO2e/kg', source: 'Poore & Nemecek 2018', region: 'Global', year: 2018, category: 'food', subcategory: 'beef' },
    lamb: { factor: 24.5, unit: 'kg CO2e/kg', source: 'Poore & Nemecek 2018', region: 'Global', year: 2018, category: 'food', subcategory: 'lamb' },
    pork: { factor: 7.6, unit: 'kg CO2e/kg', source: 'Poore & Nemecek 2018', region: 'Global', year: 2018, category: 'food', subcategory: 'pork' },
    chicken: { factor: 6.9, unit: 'kg CO2e/kg', source: 'Poore & Nemecek 2018', region: 'Global', year: 2018, category: 'food', subcategory: 'chicken' },
    fish_farmed: { factor: 13.6, unit: 'kg CO2e/kg', source: 'Poore & Nemecek 2018', region: 'Global', year: 2018, category: 'food', subcategory: 'fish_farmed' },
    fish_wild: { factor: 5.4, unit: 'kg CO2e/kg', source: 'Poore & Nemecek 2018', region: 'Global', year: 2018, category: 'food', subcategory: 'fish_wild' },
    dairy_milk: { factor: 3.2, unit: 'kg CO2e/kg', source: 'Poore & Nemecek 2018', region: 'Global', year: 2018, category: 'food', subcategory: 'dairy_milk' },
    cheese: { factor: 21.2, unit: 'kg CO2e/kg', source: 'Poore & Nemecek 2018', region: 'Global', year: 2018, category: 'food', subcategory: 'cheese' },
    vegetables: { factor: 2.0, unit: 'kg CO2e/kg', source: 'Poore & Nemecek 2018', region: 'Global', year: 2018, category: 'food', subcategory: 'vegetables' },
    fruits: { factor: 1.1, unit: 'kg CO2e/kg', source: 'Poore & Nemecek 2018', region: 'Global', year: 2018, category: 'food', subcategory: 'fruits' },
    grains: { factor: 1.4, unit: 'kg CO2e/kg', source: 'Poore & Nemecek 2018', region: 'Global', year: 2018, category: 'food', subcategory: 'grains' }
  },

  // CONSUMPTION & LIFESTYLE (kg CO2e/year or per item)
  consumption: {
    // Clothing (kg CO2e/item)
    t_shirt: { factor: 8.5, unit: 'kg CO2e/item', source: 'Ellen MacArthur 2017', region: 'Global', year: 2017, category: 'clothing', subcategory: 't_shirt' },
    jeans: { factor: 33.4, unit: 'kg CO2e/item', source: 'Ellen MacArthur 2017', region: 'Global', year: 2017, category: 'clothing', subcategory: 'jeans' },
    dress: { factor: 47.0, unit: 'kg CO2e/item', source: 'Ellen MacArthur 2017', region: 'Global', year: 2017, category: 'clothing', subcategory: 'dress' },
    shoes: { factor: 30.0, unit: 'kg CO2e/item', source: 'Ellen MacArthur 2017', region: 'Global', year: 2017, category: 'clothing', subcategory: 'shoes' },
    
    // Electronics (kg CO2e/item)
    smartphone: { factor: 85.0, unit: 'kg CO2e/item', source: 'Apple 2023', region: 'Global', year: 2023, category: 'electronics', subcategory: 'smartphone' },
    laptop: { factor: 300.0, unit: 'kg CO2e/item', source: 'Dell 2023', region: 'Global', year: 2023, category: 'electronics', subcategory: 'laptop' },
    tablet: { factor: 130.0, unit: 'kg CO2e/item', source: 'Apple 2023', region: 'Global', year: 2023, category: 'electronics', subcategory: 'tablet' },
    tv_55inch: { factor: 1200.0, unit: 'kg CO2e/item', source: 'Samsung 2023', region: 'Global', year: 2023, category: 'electronics', subcategory: 'tv' },
    
    // Annual consumption estimates by frequency
    shopping_monthly: { factor: 2400, unit: 'kg CO2e/year', source: 'C40 Cities 2019', region: 'Global', year: 2019, category: 'consumption', subcategory: 'high_consumption' },
    shopping_quarterly: { factor: 1200, unit: 'kg CO2e/year', source: 'C40 Cities 2019', region: 'Global', year: 2019, category: 'consumption', subcategory: 'medium_consumption' },
    shopping_yearly: { factor: 600, unit: 'kg CO2e/year', source: 'C40 Cities 2019', region: 'Global', year: 2019, category: 'consumption', subcategory: 'low_consumption' },
    shopping_rarely: { factor: 300, unit: 'kg CO2e/year', source: 'C40 Cities 2019', region: 'Global', year: 2019, category: 'consumption', subcategory: 'minimal_consumption' }
  },

  // WASTE MANAGEMENT (kg CO2e/kg waste)
  waste: {
    landfill: { factor: 1.84, unit: 'kg CO2e/kg', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'waste', subcategory: 'landfill' },
    recycling: { factor: 0.02, unit: 'kg CO2e/kg', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'waste', subcategory: 'recycling' },
    composting: { factor: 0.15, unit: 'kg CO2e/kg', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'waste', subcategory: 'composting' },
    incineration: { factor: 0.21, unit: 'kg CO2e/kg', source: 'DEFRA 2023', region: 'UK', year: 2023, category: 'waste', subcategory: 'incineration' },
    
    // Annual waste estimates by household size and management
    waste_everything_trash: { factor: 580, unit: 'kg CO2e/year', source: 'EPA 2023', region: 'US', year: 2023, category: 'waste', subcategory: 'no_recycling' },
    waste_some_recycling: { factor: 350, unit: 'kg CO2e/year', source: 'EPA 2023', region: 'US', year: 2023, category: 'waste', subcategory: 'some_recycling' },
    waste_mostly_recycle: { factor: 150, unit: 'kg CO2e/year', source: 'EPA 2023', region: 'US', year: 2023, category: 'waste', subcategory: 'high_recycling' },
    waste_compost_recycle: { factor: 80, unit: 'kg CO2e/year', source: 'EPA 2023', region: 'US', year: 2023, category: 'waste', subcategory: 'compost_recycle' }
  }
} as const

// Helper functions for accessing emission factors
export function getEmissionFactor(category: keyof typeof EMISSION_FACTORS, subcategory: string): EmissionFactor | null {
  const categoryData = EMISSION_FACTORS[category]
  if (!categoryData) return null
  
  const factor = (categoryData as any)[subcategory]
  return factor || null
}

export function getDefaultElectricityFactor(region: string = 'eu'): EmissionFactor {
  const regionMapping: { [key: string]: keyof typeof EMISSION_FACTORS.electricity } = {
    'eu': 'eu_average',
    'europe': 'eu_average',
    'de': 'germany',
    'germany': 'germany',
    'fr': 'france',
    'france': 'france',
    'uk': 'uk',
    'united kingdom': 'uk',
    'us': 'us_average',
    'usa': 'us_average',
    'united states': 'us_average'
  }
  
  const key = regionMapping[region.toLowerCase()] || 'eu_average'
  return EMISSION_FACTORS.electricity[key]
}

export function getDefaultTransportFactor(type: string): EmissionFactor {
  // Map common transport types to our detailed categories
  const mapping: { [key: string]: keyof typeof EMISSION_FACTORS.transport } = {
    'car': 'car_petrol_medium',
    'car_alone': 'car_petrol_medium',
    'car_carpool': 'car_petrol_medium', // Will be divided by occupancy
    'public_transport': 'bus_local',
    'bus': 'bus_local',
    'train': 'train_local',
    'metro': 'metro_tram',
    'bike': 'bicycle',
    'bicycle': 'bicycle',
    'walk': 'walking',
    'walking': 'walking'
  }
  
  const key = mapping[type.toLowerCase()] || 'car_petrol_medium'
  return EMISSION_FACTORS.transport[key]
}

// Data sources and references
export const DATA_SOURCES = {
  defra: {
    name: 'UK Department for Environment, Food and Rural Affairs',
    url: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023',
    year: 2023
  },
  epa: {
    name: 'US Environmental Protection Agency',
    url: 'https://www.epa.gov/egrid/summary-data',
    year: 2023
  },
  ipcc: {
    name: 'Intergovernmental Panel on Climate Change',
    url: 'https://www.ipcc.ch/report/ar5/wg3/',
    year: 2014
  },
  oxford: {
    name: 'University of Oxford - Environmental Research Letters',
    url: 'https://iopscience.iop.org/article/10.1088/1748-9326/ac861c',
    year: 2023
  },
  poore_nemecek: {
    name: 'Poore & Nemecek - Science Journal',
    url: 'https://science.sciencemag.org/content/360/6392/987',
    year: 2018
  }
}
