-- =====================================================
-- COMPLETE ECOZYNC DATABASE SCHEMA
-- Unified schema with Stripe integration + OAuth + Social features
-- Run this after manually dropping all existing tables in Supabase
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. CORE USER PROFILES TABLE
-- =====================================================

-- Comprehensive user profiles combining all requirements
CREATE TABLE profiles (
  -- UUID from auth.users (primary key)
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Basic profile information  
  display_name TEXT,
  full_name TEXT, -- Keep for Stripe compatibility
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  
  -- Ecozync-specific features
  carbon_goal_tonnes DECIMAL(5,2) DEFAULT 2.0, -- Annual carbon goal in tonnes
  privacy_level TEXT DEFAULT 'friends' CHECK (privacy_level IN ('public', 'friends', 'private')),
  notification_preferences JSONB DEFAULT '{"achievements": true, "challenges": true, "friend_activity": true, "weekly_summary": true, "reduction_tips": true, "offset_reminders": true}'::jsonb,
  streak_count INTEGER DEFAULT 0,
  total_calculations INTEGER DEFAULT 0,
  
  -- Stripe billing information
  billing_address JSONB, -- The customer's billing address, stored in JSON format
  payment_method JSONB,  -- Stores your customer's payment instruments
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. STRIPE INTEGRATION TABLES
-- =====================================================

-- Customers table for Stripe mapping
CREATE TABLE customers (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  stripe_customer_id TEXT
);

-- Products table (synced from Stripe)
CREATE TABLE products (
  id TEXT PRIMARY KEY, -- Product ID from Stripe, e.g. prod_1234
  active BOOLEAN,
  name TEXT,
  description TEXT,
  image TEXT,
  metadata JSONB
);

-- Prices table (synced from Stripe)
CREATE TABLE prices (
  id TEXT PRIMARY KEY, -- Price ID from Stripe, e.g. price_1234
  product_id TEXT REFERENCES products,
  active BOOLEAN,
  description TEXT,
  unit_amount BIGINT,
  currency TEXT CHECK (char_length(currency) = 3),
  type TEXT CHECK (type IN ('one_time', 'recurring')),
  interval TEXT CHECK (interval IN ('month', 'year')),
  interval_count INTEGER,
  trial_period_days INTEGER,
  metadata JSONB
);

-- Subscriptions table (synced from Stripe)
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY, -- Subscription ID from Stripe, e.g. sub_1234
  user_id UUID REFERENCES auth.users NOT NULL,
  status TEXT,
  metadata JSONB,
  price_id TEXT REFERENCES prices,
  quantity INTEGER,
  cancel_at_period_end BOOLEAN,
  created TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  cancel_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  canceled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  trial_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  trial_end TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- 3. ECOZYNC SOCIAL FEATURES TABLES
-- =====================================================

-- Carbon footprint calculations
CREATE TABLE carbon_calculations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  calculation_date DATE NOT NULL,
  
  -- 8-question assessment data (stored as JSONB for flexibility)
  assessment_data JSONB NOT NULL, -- Raw form responses
  
  -- Calculated emissions by category (in kg CO2e)
  transport_emissions DECIMAL(8,2) NOT NULL DEFAULT 0,
  energy_emissions DECIMAL(8,2) NOT NULL DEFAULT 0,
  diet_emissions DECIMAL(8,2) NOT NULL DEFAULT 0,
  lifestyle_emissions DECIMAL(8,2) NOT NULL DEFAULT 0,
  travel_emissions DECIMAL(8,2) NOT NULL DEFAULT 0,
  other_emissions DECIMAL(8,2) NOT NULL DEFAULT 0,
  
  -- Total emissions
  total_emissions DECIMAL(8,2) GENERATED ALWAYS AS (
    transport_emissions + energy_emissions + diet_emissions + 
    lifestyle_emissions + travel_emissions + other_emissions
  ) STORED,
  
  -- Metadata
  calculation_method TEXT DEFAULT 'local_enhanced',
  calculation_confidence DECIMAL(3,2) DEFAULT 0.8, -- 0-1 confidence score
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one calculation per user per day
  UNIQUE(user_id, calculation_date)
);

-- Friend relationships
CREATE TABLE friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate friendship requests
  UNIQUE(requester_id, addressee_id),
  -- Prevent self-friendship
  CHECK (requester_id != addressee_id)
);

-- Achievement definitions
CREATE TABLE achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE, -- Unique identifier for code references
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('first_steps', 'consistency', 'impact', 'social')),
  icon_name TEXT NOT NULL, -- Icon identifier for UI
  badge_color TEXT NOT NULL DEFAULT '#4ade80',
  
  -- Achievement criteria
  criteria_type TEXT NOT NULL CHECK (criteria_type IN ('count', 'streak', 'reduction', 'social', 'milestone')),
  criteria_value INTEGER NOT NULL, -- Target value to achieve
  criteria_data JSONB, -- Additional criteria parameters
  
  -- Points and rarity
  points INTEGER NOT NULL DEFAULT 10,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievement progress and unlocks
CREATE TABLE user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  
  -- Progress tracking
  current_progress INTEGER DEFAULT 0,
  target_progress INTEGER NOT NULL, -- Copied from achievement criteria_value
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  progress_data JSONB, -- Additional progress tracking data
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_id)
);

-- Community challenges
CREATE TABLE challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('reduction', 'streak', 'calculation', 'social')),
  
  -- Challenge parameters
  target_value DECIMAL(8,2) NOT NULL, -- Target to achieve
  target_unit TEXT NOT NULL, -- Unit of measurement (kg, days, count, etc.)
  
  -- Timing
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Rewards
  points_reward INTEGER DEFAULT 50,
  badge_icon TEXT,
  badge_color TEXT DEFAULT '#22d3ee',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  participant_limit INTEGER, -- NULL for unlimited
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CHECK (end_date > start_date)
);

-- Challenge participation
CREATE TABLE challenge_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Progress tracking
  current_progress DECIMAL(8,2) DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Final ranking
  final_rank INTEGER,
  points_earned INTEGER DEFAULT 0,
  
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(challenge_id, user_id)
);

-- Activity feed for social features
CREATE TABLE activity_feed (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('achievement', 'calculation', 'challenge_join', 'challenge_complete', 'friendship', 'streak_milestone')),
  
  -- Activity data
  title TEXT NOT NULL,
  description TEXT,
  activity_data JSONB, -- Flexible data for different activity types
  
  -- Visibility
  is_public BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can view public profiles and friends" 
  ON profiles FOR SELECT 
  USING (
    privacy_level = 'public' 
    OR id = auth.uid()
    OR (privacy_level = 'friends' AND EXISTS (
      SELECT 1 FROM friendships 
      WHERE (requester_id = auth.uid() AND addressee_id = profiles.id)
         OR (addressee_id = auth.uid() AND requester_id = profiles.id)
      AND status = 'accepted'
    ))
  );

-- Customers policies (private table)
CREATE POLICY "Users can view own customer data" 
  ON customers FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Users can insert own customer data" 
  ON customers FOR INSERT 
  WITH CHECK (id = auth.uid());

-- Carbon calculations policies
CREATE POLICY "Users can view own calculations" 
  ON carbon_calculations FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can view friends' calculations if profile allows" 
  ON carbon_calculations FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN friendships f ON (f.requester_id = auth.uid() AND f.addressee_id = p.id)
                         OR (f.addressee_id = auth.uid() AND f.requester_id = p.id)
      WHERE p.id = carbon_calculations.user_id
        AND f.status = 'accepted'
        AND p.privacy_level IN ('public', 'friends')
    )
  );

CREATE POLICY "Users can insert own calculations" 
  ON carbon_calculations FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own calculations" 
  ON carbon_calculations FOR UPDATE 
  USING (user_id = auth.uid());

-- Friendships policies
CREATE POLICY "Users can view own friendships" 
  ON friendships FOR SELECT 
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can create friendship requests" 
  ON friendships FOR INSERT 
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update friendships they're part of" 
  ON friendships FOR UPDATE 
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- User achievements policies
CREATE POLICY "Users can view own achievements" 
  ON user_achievements FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can view friends' unlocked achievements" 
  ON user_achievements FOR SELECT 
  USING (
    is_unlocked = true AND EXISTS (
      SELECT 1 FROM friendships f
      JOIN profiles p ON p.id = user_achievements.user_id
      WHERE (f.requester_id = auth.uid() AND f.addressee_id = user_achievements.user_id)
         OR (f.addressee_id = auth.uid() AND f.requester_id = user_achievements.user_id)
      AND f.status = 'accepted'
      AND p.privacy_level IN ('public', 'friends')
    )
  );

-- Challenge participants policies
CREATE POLICY "Users can view own challenge participation" 
  ON challenge_participants FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can view public challenge leaderboards" 
  ON challenge_participants FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM challenges c 
      WHERE c.id = challenge_participants.challenge_id 
        AND c.is_active = true
    )
  );

CREATE POLICY "Users can join challenges" 
  ON challenge_participants FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own participation" 
  ON challenge_participants FOR UPDATE 
  USING (user_id = auth.uid());

-- Activity feed policies
CREATE POLICY "Users can view public activities and friends' activities" 
  ON activity_feed FOR SELECT 
  USING (
    is_public = true 
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM friendships f 
      WHERE (f.requester_id = auth.uid() AND f.addressee_id = activity_feed.user_id)
         OR (f.addressee_id = auth.uid() AND f.requester_id = activity_feed.user_id)
      AND f.status = 'accepted'
    )
  );

CREATE POLICY "System can insert activities" 
  ON activity_feed FOR INSERT 
  WITH CHECK (true); -- Allow system inserts via functions

-- Subscriptions policies
CREATE POLICY "Users can view own subscription data" 
  ON subscriptions FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscription data" 
  ON subscriptions FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscription data" 
  ON subscriptions FOR UPDATE 
  USING (user_id = auth.uid());

-- =====================================================
-- 5. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Auto-create profile on user signup (OAuth compatible)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    display_name, 
    full_name, 
    avatar_url,
    carbon_goal_tonnes,
    privacy_level,
    notification_preferences,
    streak_count,
    total_calculations
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name', 
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    2.0, -- Default carbon goal
    'friends', -- Default privacy level
    '{"achievements": true, "challenges": true, "friend_activity": true, "weekly_summary": true, "reduction_tips": true, "offset_reminders": true}'::jsonb,
    0, -- Initial streak count
    0  -- Initial calculations count
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carbon_calculations_updated_at
  BEFORE UPDATE ON carbon_calculations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at
  BEFORE UPDATE ON user_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenge_participants_updated_at
  BEFORE UPDATE ON challenge_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Calculate user streak (consecutive days with calculations)
CREATE OR REPLACE FUNCTION calculate_user_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_count INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  found_calculation BOOLEAN;
BEGIN
  -- Check each day going backwards from today
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM carbon_calculations 
      WHERE user_id = user_uuid 
        AND calculation_date = check_date
    ) INTO found_calculation;
    
    IF found_calculation THEN
      streak_count := streak_count + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT; -- Break the loop when we find a gap
    END IF;
    
    -- Safety limit to prevent infinite loops
    IF streak_count > 365 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update achievement progress for a user
CREATE OR REPLACE FUNCTION update_achievement_progress(user_uuid UUID, achievement_code TEXT, progress_increment INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  achievement_record achievements%ROWTYPE;
  current_progress INTEGER;
  was_unlocked BOOLEAN;
BEGIN
  -- Get achievement details
  SELECT * INTO achievement_record 
  FROM achievements 
  WHERE code = achievement_code AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Insert or update user achievement progress
  INSERT INTO user_achievements (user_id, achievement_id, current_progress, target_progress)
  VALUES (user_uuid, achievement_record.id, progress_increment, achievement_record.criteria_value)
  ON CONFLICT (user_id, achievement_id) 
  DO UPDATE SET 
    current_progress = user_achievements.current_progress + progress_increment,
    updated_at = NOW()
  RETURNING current_progress, is_unlocked INTO current_progress, was_unlocked;
  
  -- Check if achievement should be unlocked
  IF NOT was_unlocked AND current_progress >= achievement_record.criteria_value THEN
    UPDATE user_achievements 
    SET is_unlocked = true, unlocked_at = NOW()
    WHERE user_id = user_uuid AND achievement_id = achievement_record.id;
    
    -- Create activity feed entry
    INSERT INTO activity_feed (user_id, activity_type, title, description, activity_data)
    VALUES (
      user_uuid,
      'achievement',
      'Achievement Unlocked: ' || achievement_record.title,
      achievement_record.description,
      jsonb_build_object(
        'achievement_id', achievement_record.id,
        'achievement_code', achievement_record.code,
        'points', achievement_record.points,
        'rarity', achievement_record.rarity
      )
    );
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. ACHIEVEMENT SEED DATA
-- =====================================================

-- First Steps Category
INSERT INTO achievements (code, title, description, category, icon_name, badge_color, criteria_type, criteria_value, points, rarity) VALUES
('first_calculation', 'First Steps', 'Complete your first carbon footprint calculation', 'first_steps', 'calculator', '#4ade80', 'count', 1, 10, 'common'),
('calculation_warrior', 'Calculation Warrior', 'Complete 10 carbon footprint calculations', 'first_steps', 'chart-line', '#4ade80', 'count', 10, 25, 'common'),
('data_driven', 'Data Driven', 'Complete 50 carbon footprint calculations', 'first_steps', 'database', '#4ade80', 'count', 50, 75, 'rare'),
('consistency_king', 'Consistency King', 'Complete calculations for 7 days in a row', 'first_steps', 'crown', '#4ade80', 'streak', 7, 50, 'rare'),
('milestone_maker', 'Milestone Maker', 'Complete 100 carbon footprint calculations', 'first_steps', 'target', '#4ade80', 'count', 100, 150, 'epic');

-- Consistency Category  
INSERT INTO achievements (code, title, description, category, icon_name, badge_color, criteria_type, criteria_value, points, rarity) VALUES
('week_streak', 'Week Warrior', 'Maintain a 7-day calculation streak', 'consistency', 'flame', '#f59e0b', 'streak', 7, 30, 'common'),
('month_streak', 'Monthly Master', 'Maintain a 30-day calculation streak', 'consistency', 'trophy', '#f59e0b', 'streak', 30, 100, 'rare'),
('carbon_cutter', 'Carbon Cutter', 'Reduce emissions by 10% from baseline', 'consistency', 'scissors', '#f59e0b', 'reduction', 10, 75, 'rare'),
('eco_warrior', 'Eco Warrior', 'Reduce emissions by 25% from baseline', 'consistency', 'shield', '#f59e0b', 'reduction', 25, 150, 'epic'),
('climate_champion', 'Climate Champion', 'Reduce emissions by 50% from baseline', 'consistency', 'medal', '#f59e0b', 'reduction', 50, 300, 'legendary');

-- Impact Category
INSERT INTO achievements (code, title, description, category, icon_name, badge_color, criteria_type, criteria_value, points, rarity) VALUES
('green_machine', 'Green Machine', 'Keep daily emissions under 10kg for a week', 'impact', 'leaf', '#22d3ee', 'milestone', 1, 50, 'common'),
('emission_eliminator', 'Emission Eliminator', 'Achieve net-zero day (emissions + offsets)', 'impact', 'minus-circle', '#22d3ee', 'milestone', 1, 100, 'rare'),
('planet_protector', 'Planet Protector', 'Offset 1 tonne of CO2 through subscriptions', 'impact', 'globe', '#22d3ee', 'milestone', 1, 75, 'rare'),
('carbon_crusher', 'Carbon Crusher', 'Reduce daily average below 5kg CO2e', 'impact', 'hammer', '#22d3ee', 'milestone', 1, 200, 'epic'),
('impact_multiplier', 'Impact Multiplier', 'Inspire 5 friends to start tracking', 'impact', 'users', '#22d3ee', 'social', 5, 150, 'epic');

-- Social Category
INSERT INTO achievements (code, title, description, category, icon_name, badge_color, criteria_type, criteria_value, points, rarity) VALUES
('social_butterfly', 'Social Butterfly', 'Connect with 5 eco-conscious friends', 'social', 'heart', '#ec4899', 'social', 5, 40, 'common'),
('community_leader', 'Community Leader', 'Connect with 25 friends in your network', 'social', 'users-cog', '#ec4899', 'social', 25, 100, 'rare'),
('challenge_champion', 'Challenge Champion', 'Complete your first community challenge', 'social', 'flag', '#ec4899', 'milestone', 1, 60, 'common'),
('trend_setter', 'Trend Setter', 'Finish in top 10 of a community challenge', 'social', 'trending-up', '#ec4899', 'milestone', 1, 125, 'rare'),
('eco_influencer', 'Eco Influencer', 'Get 50 reactions on your achievements', 'social', 'thumbs-up', '#ec4899', 'social', 50, 175, 'epic');

-- =====================================================
-- 8. INITIAL CHALLENGE
-- =====================================================

-- Create a sample ongoing challenge
INSERT INTO challenges (title, description, challenge_type, target_value, target_unit, start_date, end_date, points_reward, badge_icon, badge_color)
VALUES (
  'January Carbon Reduction Challenge',
  'Reduce your daily carbon footprint by 15% compared to your December average. Track daily and see your progress!',
  'reduction',
  15.0,
  'percentage',
  '2025-01-01',
  '2025-01-31',
  100,
  'trending-down',
  '#22d3ee'
);

-- =====================================================
-- 9. PERFORMANCE INDEXES
-- =====================================================

-- Indexes for efficient queries
CREATE INDEX idx_carbon_calculations_user_date ON carbon_calculations(user_id, calculation_date DESC);
CREATE INDEX idx_friendships_status ON friendships(status) WHERE status = 'accepted';
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(user_id, is_unlocked) WHERE is_unlocked = true;
CREATE INDEX idx_activity_feed_public ON activity_feed(created_at DESC) WHERE is_public = true;
CREATE INDEX idx_activity_feed_user_timeline ON activity_feed(user_id, created_at DESC);
CREATE INDEX idx_challenge_participants_active ON challenge_participants(challenge_id, current_progress DESC);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_prices_product ON prices(product_id);

-- =====================================================
-- 10. PERMISSIONS AND REALTIME
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable realtime for social features
ALTER PUBLICATION supabase_realtime ADD TABLE activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE challenge_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE user_achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'ECOZYNC DATABASE SETUP COMPLETE!';
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Core Tables: profiles, customers';
  RAISE NOTICE 'Stripe Tables: products, prices, subscriptions';
  RAISE NOTICE 'Social Tables: carbon_calculations, friendships, achievements, user_achievements, challenges, challenge_participants, activity_feed';
  RAISE NOTICE 'Achievements seeded: % total', (SELECT COUNT(*) FROM achievements);
  RAISE NOTICE 'OAuth user creation: ENABLED';
  RAISE NOTICE 'RLS policies: CONFIGURED';
  RAISE NOTICE 'Realtime: ENABLED for social features';
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Ready to test OAuth signup flow!';
END $$;
