-- Add trigger to automatically update total_calculations in profiles table
-- when carbon_calculations are inserted or deleted

-- Function to update total_calculations count
CREATE OR REPLACE FUNCTION update_profile_calculation_count()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT, increment the count
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET total_calculations = total_calculations + 1,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;
  
  -- For DELETE, decrement the count
  IF TG_OP = 'DELETE' THEN
    UPDATE profiles 
    SET total_calculations = GREATEST(0, total_calculations - 1),
        updated_at = NOW()
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for INSERT and DELETE on carbon_calculations
CREATE TRIGGER update_profile_calculation_count_insert
  AFTER INSERT ON carbon_calculations
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_calculation_count();

CREATE TRIGGER update_profile_calculation_count_delete
  AFTER DELETE ON carbon_calculations
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_calculation_count();

-- Fix any existing profiles that might have incorrect counts
UPDATE profiles 
SET total_calculations = (
  SELECT COUNT(*) 
  FROM carbon_calculations 
  WHERE carbon_calculations.user_id = profiles.id
),
updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM carbon_calculations 
  WHERE carbon_calculations.user_id = profiles.id
);
