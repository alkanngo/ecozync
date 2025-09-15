-- =====================================================
-- ECOZYNC DATABASE SCHEMA
-- Complete SQL setup for social carbon tracking PWA
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. CORE TABLES
-- =====================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  carbon_goal_tonnes DECIMAL(5,2) DEFAULT 2.0, -- Annual carbon goal in tonnes
  privacy_level TEXT DEFAULT 'friends' CHECK (privacy_level IN ('public', 'friends', 'private')),
  notification_preferences JSONB DEFAULT '{"achievements": true, "challenges": true, "friend_activity": true}'::jsonb,
  streak_count INTEGER DEFAULT 0,
  total_calculations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carbon footprint calculations
CREATE TABLE IF NOT EXISTS carbon_calculations (
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
CREATE TABLE IF NOT EXISTS friendships (
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
CREATE TABLE IF NOT EXISTS achievements (
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
CREATE TABLE IF NOT EXISTS user_achievements (
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
CREATE TABLE IF NOT EXISTS challenges (
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
CREATE TABLE IF NOT EXISTS challenge_participants (
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
CREATE TABLE IF NOT EXISTS activity_feed (
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
-- 2. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view public profiles and friends" ON profiles;
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

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (id = auth.uid());

-- Carbon calculations policies
DROP POLICY IF EXISTS "Users can view own calculations" ON carbon_calculations;
CREATE POLICY "Users can view own calculations" 
  ON carbon_calculations FOR SELECT 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view friends' calculations if profile allows" ON carbon_calculations;
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

DROP POLICY IF EXISTS "Users can insert own calculations" ON carbon_calculations;
CREATE POLICY "Users can insert own calculations" 
  ON carbon_calculations FOR INSERT 
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own calculations" ON carbon_calculations;
CREATE POLICY "Users can update own calculations" 
  ON carbon_calculations FOR UPDATE 
  USING (user_id = auth.uid());

-- Friendships policies
DROP POLICY IF EXISTS "Users can view own friendships" ON friendships;
CREATE POLICY "Users can view own friendships" 
  ON friendships FOR SELECT 
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

DROP POLICY IF EXISTS "Users can create friendship requests" ON friendships;
CREATE POLICY "Users can create friendship requests" 
  ON friendships FOR INSERT 
  WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "Users can update friendships they're part of" ON friendships;
CREATE POLICY "Users can update friendships they're part of" 
  ON friendships FOR UPDATE 
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- User achievements policies
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements" 
  ON user_achievements FOR SELECT 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view friends' unlocked achievements" ON user_achievements;
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
DROP POLICY IF EXISTS "Users can view own challenge participation" ON challenge_participants;
CREATE POLICY "Users can view own challenge participation" 
  ON challenge_participants FOR SELECT 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view public challenge leaderboards" ON challenge_participants;
CREATE POLICY "Users can view public challenge leaderboards" 
  ON challenge_participants FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM challenges c 
      WHERE c.id = challenge_participants.challenge_id 
        AND c.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can join challenges" ON challenge_participants;
CREATE POLICY "Users can join challenges" 
  ON challenge_participants FOR INSERT 
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own participation" ON challenge_participants;
CREATE POLICY "Users can update own participation" 
  ON challenge_participants FOR UPDATE 
  USING (user_id = auth.uid());

-- Activity feed policies
DROP POLICY IF EXISTS "Users can view public activities and friends' activities" ON activity_feed;
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

DROP POLICY IF EXISTS "System can insert activities" ON activity_feed;
CREATE POLICY "System can insert activities" 
  ON activity_feed FOR INSERT 
  WITH CHECK (true); -- Allow system inserts via functions

-- =====================================================
-- 3. HELPER FUNCTIONS
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

-- Get leaderboard rankings for reduction percentages
CREATE OR REPLACE FUNCTION get_leaderboard_rankings(time_period TEXT DEFAULT 'month')
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  reduction_percentage DECIMAL,
  current_emissions DECIMAL,
  baseline_emissions DECIMAL,
  ranking INTEGER
) AS $$
DECLARE
  start_date DATE;
  baseline_start DATE;
BEGIN
  -- Calculate date ranges based on time period
  CASE time_period
    WHEN 'week' THEN
      start_date := CURRENT_DATE - INTERVAL '7 days';
      baseline_start := start_date - INTERVAL '7 days';
    WHEN 'month' THEN
      start_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
      baseline_start := (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month')::DATE;
    WHEN 'year' THEN
      start_date := DATE_TRUNC('year', CURRENT_DATE)::DATE;
      baseline_start := (DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 year')::DATE;
    ELSE
      -- Default to month
      start_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
      baseline_start := (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month')::DATE;
  END CASE;
  
  RETURN QUERY
  WITH current_period AS (
    SELECT 
      cc.user_id,
      AVG(cc.total_emissions) as avg_current_emissions
    FROM carbon_calculations cc
    WHERE cc.calculation_date >= start_date
    GROUP BY cc.user_id
    HAVING COUNT(*) >= 3 -- Minimum 3 calculations for ranking
  ),
  baseline_period AS (
    SELECT 
      cc.user_id,
      AVG(cc.total_emissions) as avg_baseline_emissions
    FROM carbon_calculations cc
    WHERE cc.calculation_date >= baseline_start 
      AND cc.calculation_date < start_date
    GROUP BY cc.user_id
    HAVING COUNT(*) >= 3 -- Minimum 3 calculations for baseline
  ),
  reductions AS (
    SELECT 
      p.id as user_id,
      p.display_name,
      p.avatar_url,
      cp.avg_current_emissions,
      bp.avg_baseline_emissions,
      CASE 
        WHEN bp.avg_baseline_emissions > 0 THEN
          ((bp.avg_baseline_emissions - cp.avg_current_emissions) / bp.avg_baseline_emissions * 100)
        ELSE 0
      END as reduction_percentage
    FROM profiles p
    JOIN current_period cp ON p.id = cp.user_id
    JOIN baseline_period bp ON p.id = bp.user_id
    WHERE p.privacy_level IN ('public', 'friends')
  )
  SELECT 
    r.user_id,
    r.display_name,
    r.avatar_url,
    ROUND(r.reduction_percentage, 2) as reduction_percentage,
    ROUND(r.avg_current_emissions, 2) as current_emissions,
    ROUND(r.avg_baseline_emissions, 2) as baseline_emissions,
    RANK() OVER (ORDER BY r.reduction_percentage DESC) as ranking
  FROM reductions r
  WHERE r.reduction_percentage > 0 -- Only show actual reductions
  ORDER BY r.reduction_percentage DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. TRIGGERS
-- =====================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to relevant tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carbon_calculations_updated_at ON carbon_calculations;
CREATE TRIGGER update_carbon_calculations_updated_at
  BEFORE UPDATE ON carbon_calculations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_friendships_updated_at ON friendships;
CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_achievements_updated_at ON user_achievements;
CREATE TRIGGER update_user_achievements_updated_at
  BEFORE UPDATE ON user_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_challenge_participants_updated_at ON challenge_participants;
CREATE TRIGGER update_challenge_participants_updated_at
  BEFORE UPDATE ON challenge_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Achievement progress tracking on calculation insert
CREATE OR REPLACE FUNCTION track_calculation_achievements()
RETURNS TRIGGER AS $$
BEGIN
  -- Track total calculations
  PERFORM update_achievement_progress(NEW.user_id, 'first_calculation', 1);
  PERFORM update_achievement_progress(NEW.user_id, 'calculation_warrior', 1);
  PERFORM update_achievement_progress(NEW.user_id, 'data_driven', 1);
  
  -- Update user's total calculation count
  UPDATE profiles 
  SET total_calculations = total_calculations + 1
  WHERE id = NEW.user_id;
  
  -- Update streak and track streak achievements
  DECLARE
    new_streak INTEGER;
  BEGIN
    new_streak := calculate_user_streak(NEW.user_id);
    
    UPDATE profiles 
    SET streak_count = new_streak
    WHERE id = NEW.user_id;
    
    -- Check streak achievements
    IF new_streak >= 7 THEN
      PERFORM update_achievement_progress(NEW.user_id, 'week_streak', 0);
    END IF;
    
    IF new_streak >= 30 THEN
      PERFORM update_achievement_progress(NEW.user_id, 'month_streak', 0);
    END IF;
  END;
  
  -- Create activity feed entry
  INSERT INTO activity_feed (user_id, activity_type, title, description, activity_data)
  VALUES (
    NEW.user_id,
    'calculation',
    'Carbon footprint calculated',
    'Calculated ' || ROUND(NEW.total_emissions, 1) || ' kg CO2e for ' || NEW.calculation_date,
    jsonb_build_object(
      'total_emissions', NEW.total_emissions,
      'calculation_date', NEW.calculation_date,
      'categories', jsonb_build_object(
        'transport', NEW.transport_emissions,
        'energy', NEW.energy_emissions,
        'diet', NEW.diet_emissions,
        'lifestyle', NEW.lifestyle_emissions,
        'travel', NEW.travel_emissions,
        'other', NEW.other_emissions
      )
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_calculation_achievements_trigger ON carbon_calculations;
CREATE TRIGGER track_calculation_achievements_trigger
  AFTER INSERT ON carbon_calculations
  FOR EACH ROW EXECUTE FUNCTION track_calculation_achievements();

-- Track friendship achievements
CREATE OR REPLACE FUNCTION track_friendship_achievements()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Both users get credit for making a friend
    PERFORM update_achievement_progress(NEW.requester_id, 'social_butterfly', 1);
    PERFORM update_achievement_progress(NEW.addressee_id, 'social_butterfly', 1);
    
    -- Create activity feed entries
    INSERT INTO activity_feed (user_id, activity_type, title, description, activity_data)
    VALUES (
      NEW.requester_id,
      'friendship',
      'New friend connection',
      'Connected with a new eco-warrior!',
      jsonb_build_object('friend_id', NEW.addressee_id)
    );
    
    INSERT INTO activity_feed (user_id, activity_type, title, description, activity_data)
    VALUES (
      NEW.addressee_id,
      'friendship',
      'New friend connection',
      'Connected with a new eco-warrior!',
      jsonb_build_object('friend_id', NEW.requester_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_friendship_achievements_trigger ON friendships;
CREATE TRIGGER track_friendship_achievements_trigger
  AFTER UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION track_friendship_achievements();

-- =====================================================
-- 5. SEED DATA - ACHIEVEMENTS
-- =====================================================

-- Clear existing achievements if re-running
DELETE FROM achievements WHERE code IN (
  'first_calculation', 'calculation_warrior', 'data_driven', 'consistency_king',
  'week_streak', 'month_streak', 'carbon_cutter', 'eco_warrior', 'climate_champion',
  'green_machine', 'emission_eliminator', 'planet_protector', 'social_butterfly',
  'community_leader', 'challenge_champion', 'trend_setter', 'eco_influencer',
  'impact_multiplier', 'milestone_maker', 'carbon_crusher'
);

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
-- 6. INITIAL CHALLENGE SETUP
-- =====================================================

-- Create a sample ongoing challenge
INSERT INTO challenges (title, description, challenge_type, target_value, target_unit, start_date, end_date, points_reward, badge_icon, badge_color)
VALUES (
  'October Carbon Reduction Challenge',
  'Reduce your daily carbon footprint by 15% compared to your September average. Track daily and see your progress!',
  'reduction',
  15.0,
  'percentage',
  '2024-10-01',
  '2024-10-31',
  100,
  'trending-down',
  '#22d3ee'
);

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_carbon_calculations_user_date ON carbon_calculations(user_id, calculation_date DESC);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status) WHERE status = 'accepted';
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(user_id, is_unlocked) WHERE is_unlocked = true;
CREATE INDEX IF NOT EXISTS idx_activity_feed_public ON activity_feed(created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_timeline ON activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_active ON challenge_participants(challenge_id, current_progress DESC);

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable realtime for activity feeds and live updates
ALTER PUBLICATION supabase_realtime ADD TABLE activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE challenge_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE user_achievements;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE 'Ecozync database schema setup complete!';
  RAISE NOTICE 'Tables created: %, %, %, %, %, %, %, %', 
    'profiles', 'carbon_calculations', 'friendships', 'achievements', 
    'user_achievements', 'challenges', 'challenge_participants', 'activity_feed';
  RAISE NOTICE 'Achievements seeded: % total', (SELECT COUNT(*) FROM achievements);
  RAISE NOTICE 'Ready to start building Ecozync features!';
END $$;
