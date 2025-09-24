import z from 'zod';

export const priceCardVariantSchema = z.enum(['personal', 'household', 'family']);

export const productMetadataSchema = z
  .object({
    price_card_variant: priceCardVariantSchema,
    carbon_offset_tonnes: z.string(),
    target_audience: z.string(),
    features: z.string(),
    offset_type: z.string(),
    calculation_frequency: z.string(),
    social_features: z.enum(['basic', 'enhanced', 'premium']),
    support_level: z.enum(['community', 'email', 'priority']),
  })
  .transform((data) => ({
    priceCardVariant: data.price_card_variant,
    carbonOffsetTonnes: parseInt(data.carbon_offset_tonnes),
    targetAudience: data.target_audience,
    features: data.features.split(', '), // Convert comma-separated string to array
    offsetType: data.offset_type,
    calculationFrequency: data.calculation_frequency,
    socialFeatures: data.social_features,
    supportLevel: data.support_level,
  }));

export type ProductMetadata = z.infer<typeof productMetadataSchema>;
export type PriceCardVariant = z.infer<typeof priceCardVariantSchema>;
