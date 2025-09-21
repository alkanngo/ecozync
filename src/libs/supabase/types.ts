// =====================================================
// UNIFIED DATABASE TYPES
// Combines Stripe payment features with Ecozync social features
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // =====================================================
      // UNIFIED PROFILES TABLE (replaces users)
      // =====================================================
      profiles: {
        Row: {
          // UUID from auth.users (primary key)
          id: string
          
          // Basic profile information  
          display_name: string | null
          full_name: string | null // Keep for Stripe compatibility
          avatar_url: string | null
          bio: string | null
          location: string | null
          website: string | null
          
          // Ecozync-specific features
          carbon_goal_tonnes: number
          privacy_level: 'public' | 'friends' | 'private'
          notification_preferences: Json
          streak_count: number
          total_calculations: number
          
          // Stripe billing information (from original users table)
          billing_address: Json | null // The customer's billing address, stored in JSON format
          payment_method: Json | null  // Stores your customer's payment instruments
          
          // Timestamps
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          carbon_goal_tonnes?: number
          privacy_level?: 'public' | 'friends' | 'private'
          notification_preferences?: Json
          streak_count?: number
          total_calculations?: number
          billing_address?: Json | null
          payment_method?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          carbon_goal_tonnes?: number
          privacy_level?: 'public' | 'friends' | 'private'
          notification_preferences?: Json
          streak_count?: number
          total_calculations?: number
          billing_address?: Json | null
          payment_method?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // =====================================================
      // STRIPE TABLES
      // =====================================================
      customers: {
        Row: {
          id: string;
          stripe_customer_id: string | null;
        };
        Insert: {
          id: string;
          stripe_customer_id?: string | null;
        };
        Update: {
          id?: string;
          stripe_customer_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'customers_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'profiles'; // Updated to reference profiles
            referencedColumns: ['id'];
          }
        ];
      };
      prices: {
        Row: {
          active: boolean | null;
          currency: string | null;
          description: string | null;
          id: string;
          interval: Database['public']['Enums']['pricing_plan_interval'] | null;
          interval_count: number | null;
          metadata: Json | null;
          product_id: string | null;
          trial_period_days: number | null;
          type: Database['public']['Enums']['pricing_type'] | null;
          unit_amount: number | null;
        };
        Insert: {
          active?: boolean | null;
          currency?: string | null;
          description?: string | null;
          id: string;
          interval?: Database['public']['Enums']['pricing_plan_interval'] | null;
          interval_count?: number | null;
          metadata?: Json | null;
          product_id?: string | null;
          trial_period_days?: number | null;
          type?: Database['public']['Enums']['pricing_type'] | null;
          unit_amount?: number | null;
        };
        Update: {
          active?: boolean | null;
          currency?: string | null;
          description?: string | null;
          id?: string;
          interval?: Database['public']['Enums']['pricing_plan_interval'] | null;
          interval_count?: number | null;
          metadata?: Json | null;
          product_id?: string | null;
          trial_period_days?: number | null;
          type?: Database['public']['Enums']['pricing_type'] | null;
          unit_amount?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'prices_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      products: {
        Row: {
          active: boolean | null;
          description: string | null;
          id: string;
          image: string | null;
          metadata: Json | null;
          name: string | null;
        };
        Insert: {
          active?: boolean | null;
          description?: string | null;
          id: string;
          image?: string | null;
          metadata?: Json | null;
          name?: string | null;
        };
        Update: {
          active?: boolean | null;
          description?: string | null;
          id?: string;
          image?: string | null;
          metadata?: Json | null;
          name?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          cancel_at: string | null;
          cancel_at_period_end: boolean | null;
          canceled_at: string | null;
          created: string;
          current_period_end: string;
          current_period_start: string;
          ended_at: string | null;
          id: string;
          metadata: Json | null;
          price_id: string | null;
          quantity: number | null;
          status: Database['public']['Enums']['subscription_status'] | null;
          trial_end: string | null;
          trial_start: string | null;
          user_id: string;
        };
        Insert: {
          cancel_at?: string | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: string | null;
          created?: string;
          current_period_end?: string;
          current_period_start?: string;
          ended_at?: string | null;
          id: string;
          metadata?: Json | null;
          price_id?: string | null;
          quantity?: number | null;
          status?: Database['public']['Enums']['subscription_status'] | null;
          trial_end?: string | null;
          trial_start?: string | null;
          user_id: string;
        };
        Update: {
          cancel_at?: string | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: string | null;
          created?: string;
          current_period_end?: string;
          current_period_start?: string;
          ended_at?: string | null;
          id?: string;
          metadata?: Json | null;
          price_id?: string | null;
          quantity?: number | null;
          status?: Database['public']['Enums']['subscription_status'] | null;
          trial_end?: string | null;
          trial_start?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_price_id_fkey';
            columns: ['price_id'];
            isOneToOne: false;
            referencedRelation: 'prices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'subscriptions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles'; // Updated to reference profiles
            referencedColumns: ['id'];
          }
        ];
      };
      
      // =====================================================
      // ECOZYNC SOCIAL FEATURES TABLES
      // =====================================================
      carbon_calculations: {
        Row: {
          id: string
          user_id: string
          calculation_date: string
          assessment_data: Json
          transport_emissions: number
          energy_emissions: number
          diet_emissions: number
          lifestyle_emissions: number
          travel_emissions: number
          other_emissions: number
          total_emissions: number
          calculation_method: string | null
          calculation_confidence: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          calculation_date: string
          assessment_data: Json
          transport_emissions?: number
          energy_emissions?: number
          diet_emissions?: number
          lifestyle_emissions?: number
          travel_emissions?: number
          other_emissions?: number
          calculation_method?: string | null
          calculation_confidence?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          calculation_date?: string
          assessment_data?: Json
          transport_emissions?: number
          energy_emissions?: number
          diet_emissions?: number
          lifestyle_emissions?: number
          travel_emissions?: number
          other_emissions?: number
          calculation_method?: string | null
          calculation_confidence?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carbon_calculations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: 'pending' | 'accepted' | 'declined' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: 'pending' | 'accepted' | 'declined' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          addressee_id?: string
          status?: 'pending' | 'accepted' | 'declined' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      achievements: {
        Row: {
          id: string
          code: string
          title: string
          description: string
          category: 'first_steps' | 'consistency' | 'impact' | 'social'
          icon_name: string
          badge_color: string
          criteria_type: 'count' | 'streak' | 'reduction' | 'social' | 'milestone'
          criteria_value: number
          criteria_data: Json | null
          points: number
          rarity: 'common' | 'rare' | 'epic' | 'legendary'
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          title: string
          description: string
          category: 'first_steps' | 'consistency' | 'impact' | 'social'
          icon_name: string
          badge_color?: string
          criteria_type: 'count' | 'streak' | 'reduction' | 'social' | 'milestone'
          criteria_value: number
          criteria_data?: Json | null
          points?: number
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          title?: string
          description?: string
          category?: 'first_steps' | 'consistency' | 'impact' | 'social'
          icon_name?: string
          badge_color?: string
          criteria_type?: 'count' | 'streak' | 'reduction' | 'social' | 'milestone'
          criteria_value?: number
          criteria_data?: Json | null
          points?: number
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          current_progress: number
          target_progress: number
          is_unlocked: boolean
          unlocked_at: string | null
          progress_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          current_progress?: number
          target_progress: number
          is_unlocked?: boolean
          unlocked_at?: string | null
          progress_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          current_progress?: number
          target_progress?: number
          is_unlocked?: boolean
          unlocked_at?: string | null
          progress_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          }
        ]
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string
          challenge_type: 'reduction' | 'streak' | 'calculation' | 'social'
          target_value: number
          target_unit: string
          start_date: string
          end_date: string
          points_reward: number
          badge_icon: string | null
          badge_color: string
          is_active: boolean
          participant_limit: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          challenge_type: 'reduction' | 'streak' | 'calculation' | 'social'
          target_value: number
          target_unit: string
          start_date: string
          end_date: string
          points_reward?: number
          badge_icon?: string | null
          badge_color?: string
          is_active?: boolean
          participant_limit?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          challenge_type?: 'reduction' | 'streak' | 'calculation' | 'social'
          target_value?: number
          target_unit?: string
          start_date?: string
          end_date?: string
          points_reward?: number
          badge_icon?: string | null
          badge_color?: string
          is_active?: boolean
          participant_limit?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          current_progress: number
          is_completed: boolean
          completed_at: string | null
          final_rank: number | null
          points_earned: number
          joined_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          user_id: string
          current_progress?: number
          is_completed?: boolean
          completed_at?: string | null
          final_rank?: number | null
          points_earned?: number
          joined_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          user_id?: string
          current_progress?: number
          is_completed?: boolean
          completed_at?: string | null
          final_rank?: number | null
          points_earned?: number
          joined_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_feed: {
        Row: {
          id: string
          user_id: string
          activity_type: 'achievement' | 'calculation' | 'challenge_join' | 'challenge_complete' | 'friendship' | 'streak_milestone'
          title: string
          description: string | null
          activity_data: Json | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: 'achievement' | 'calculation' | 'challenge_join' | 'challenge_complete' | 'friendship' | 'streak_milestone'
          title: string
          description?: string | null
          activity_data?: Json | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: 'achievement' | 'calculation' | 'challenge_join' | 'challenge_complete' | 'friendship' | 'streak_milestone'
          title?: string
          description?: string | null
          activity_data?: Json | null
          is_public?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_user_streak: {
        Args: {
          user_uuid: string
        }
        Returns: number
      }
      update_achievement_progress: {
        Args: {
          user_uuid: string
          achievement_code: string
          progress_increment?: number
        }
        Returns: boolean
      }
      get_leaderboard_rankings: {
        Args: {
          time_period?: string
        }
        Returns: {
          user_id: string
          display_name: string | null
          avatar_url: string | null
          reduction_percentage: number
          current_emissions: number
          baseline_emissions: number
          ranking: number
        }[]
      }
    }
    Enums: {
      pricing_plan_interval: 'day' | 'week' | 'month' | 'year';
      pricing_type: 'one_time' | 'recurring';
      subscription_status:
        | 'trialing'
        | 'active'
        | 'canceled'
        | 'incomplete'
        | 'incomplete_expired'
        | 'past_due'
        | 'unpaid'
        | 'paused';
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// =====================================================
// CONVENIENCE TYPES
// =====================================================

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] & Database['public']['Views'])
  ? (Database['public']['Tables'] & Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof Database['public']['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
  ? Database['public']['Enums'][PublicEnumNameOrOptions]
  : never;

// =====================================================
// TABLE ROW TYPES FOR EASIER ACCESS
// =====================================================

// Stripe tables
export type Customer = Database['public']['Tables']['customers']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Price = Database['public']['Tables']['prices']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']

// Unified profile (replaces User)
export type Profile = Database['public']['Tables']['profiles']['Row']

// Ecozync tables
export type CarbonCalculation = Database['public']['Tables']['carbon_calculations']['Row']
export type Friendship = Database['public']['Tables']['friendships']['Row']
export type Achievement = Database['public']['Tables']['achievements']['Row']
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row']
export type Challenge = Database['public']['Tables']['challenges']['Row']
export type ChallengeParticipant = Database['public']['Tables']['challenge_participants']['Row']
export type ActivityFeed = Database['public']['Tables']['activity_feed']['Row']

// Insert types for form data
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type CarbonCalculationInsert = Database['public']['Tables']['carbon_calculations']['Insert']
export type FriendshipInsert = Database['public']['Tables']['friendships']['Insert']
export type AchievementInsert = Database['public']['Tables']['achievements']['Insert']
export type UserAchievementInsert = Database['public']['Tables']['user_achievements']['Insert']
export type ChallengeInsert = Database['public']['Tables']['challenges']['Insert']
export type ChallengeParticipantInsert = Database['public']['Tables']['challenge_participants']['Insert']
export type ActivityFeedInsert = Database['public']['Tables']['activity_feed']['Insert']

// Update types for partial updates
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type CarbonCalculationUpdate = Database['public']['Tables']['carbon_calculations']['Update']
export type FriendshipUpdate = Database['public']['Tables']['friendships']['Update']
export type AchievementUpdate = Database['public']['Tables']['achievements']['Update']
export type UserAchievementUpdate = Database['public']['Tables']['user_achievements']['Update']
export type ChallengeUpdate = Database['public']['Tables']['challenges']['Update']
export type ChallengeParticipantUpdate = Database['public']['Tables']['challenge_participants']['Update']
export type ActivityFeedUpdate = Database['public']['Tables']['activity_feed']['Update']

// =====================================================
// EXTENDED TYPES WITH RELATIONSHIPS
// =====================================================

// Profile with related data
export interface ProfileWithStats extends Profile {
  friend_count?: number
  achievements_unlocked?: number
  total_points?: number
  current_streak?: number
  avg_emissions?: number
}

// Carbon calculation with profile data
export interface CarbonCalculationWithProfile extends CarbonCalculation {
  profile: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>
}

// Achievement with user progress
export interface AchievementWithProgress extends Achievement {
  user_achievement?: UserAchievement
  progress_percentage?: number
  is_unlocked?: boolean
}

// User achievement with achievement details
export interface UserAchievementWithDetails extends UserAchievement {
  achievement: Achievement
}

// Friendship with profile data
export interface FriendshipWithProfiles extends Friendship {
  requester: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>
  addressee: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>
}

// Challenge with participation data
export interface ChallengeWithParticipation extends Challenge {
  participant_count?: number
  user_participation?: ChallengeParticipant
  is_participating?: boolean
}

// Challenge participant with user and challenge details
export interface ChallengeParticipantWithDetails extends ChallengeParticipant {
  challenge: Pick<Challenge, 'id' | 'title' | 'challenge_type' | 'target_value' | 'target_unit'>
  profile: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>
}

// Activity feed with profile data
export interface ActivityFeedWithProfile extends ActivityFeed {
  profile: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>
}

// =====================================================
// ASSESSMENT DATA TYPES
// =====================================================

// 8-Question Assessment structure
export interface AssessmentData {
  transport: {
    car_miles_per_week?: number
    fuel_type?: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
    public_transport_hours_per_week?: number
    flights_per_year?: number
  }
  energy: {
    home_size_sqft?: number
    electricity_source?: 'grid' | 'renewable' | 'mixed'
    heating_type?: 'gas' | 'electric' | 'oil' | 'renewable'
    energy_efficiency_rating?: 'low' | 'medium' | 'high'
  }
  diet: {
    diet_type?: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian'
    meat_meals_per_week?: number
    local_food_percentage?: number
    food_waste_level?: 'low' | 'medium' | 'high'
  }
  lifestyle: {
    shopping_frequency?: 'low' | 'medium' | 'high'
    second_hand_percentage?: number
    recycling_level?: 'low' | 'medium' | 'high'
    waste_reduction_efforts?: boolean
  }
}

// =====================================================
// NOTIFICATION PREFERENCES
// =====================================================

export interface NotificationPreferences {
  achievements: boolean
  challenges: boolean
  friend_activity: boolean
  weekly_summary: boolean
  reduction_tips: boolean
  offset_reminders: boolean
}

// =====================================================
// STRIPE BILLING TYPES
// =====================================================

export type BillingInterval = 'year' | 'month'
export type PricingType = Enums<'pricing_type'>
export type PricingPlanInterval = Enums<'pricing_plan_interval'>
export type SubscriptionStatus = Enums<'subscription_status'>

// =====================================================
// ECOZYNC ENUM TYPES
// =====================================================

export type PrivacyLevel = 'public' | 'friends' | 'private'
export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked'
export type AchievementCategory = 'first_steps' | 'consistency' | 'impact' | 'social'
export type AchievementCriteriaType = 'count' | 'streak' | 'reduction' | 'social' | 'milestone'
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'
export type ChallengeType = 'reduction' | 'streak' | 'calculation' | 'social'
export type ActivityType = 'achievement' | 'calculation' | 'challenge_join' | 'challenge_complete' | 'friendship' | 'streak_milestone'

// =====================================================
// LEADERBOARD TYPES
// =====================================================

export interface LeaderboardEntry {
  user_id: string
  display_name: string | null
  avatar_url: string | null
  reduction_percentage: number
  current_emissions: number
  baseline_emissions: number
  ranking: number
}

// =====================================================
// FUNCTION RETURN TYPES
// =====================================================

export type CalculateUserStreakResult = number
export type UpdateAchievementProgressResult = boolean
export type GetLeaderboardRankingsResult = LeaderboardEntry[]

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  page_size: number
  total_pages: number
}

// =====================================================
// FORM TYPES
// =====================================================

export interface CarbonCalculationForm {
  calculation_date: string
  assessment_data: AssessmentData
}

export interface ProfileUpdateForm {
  display_name?: string
  full_name?: string
  bio?: string
  location?: string
  website?: string
  carbon_goal_tonnes?: number
  privacy_level?: PrivacyLevel
  notification_preferences?: NotificationPreferences
}

export interface ChallengeCreateForm {
  title: string
  description: string
  challenge_type: ChallengeType
  target_value: number
  target_unit: string
  start_date: string
  end_date: string
  points_reward?: number
  participant_limit?: number
}

// =====================================================
// BACKWARD COMPATIBILITY ALIASES
// =====================================================

// For backward compatibility with existing Stripe code
export type User = Profile // Alias Profile as User for existing code
export type UserInsert = ProfileInsert
export type UserUpdate = ProfileUpdate