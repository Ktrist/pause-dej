-- Reviews & Ratings System
-- Complete review functionality with voting and moderation

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  photos TEXT[] DEFAULT '{}',
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true, -- For moderation
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, dish_id) -- One review per user per dish
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_dish_id ON reviews(dish_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);

-- ============================================
-- REVIEW VOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id) -- One vote per user per review
);

-- Index for votes
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON review_votes(user_id);

-- ============================================
-- ADD RATING FIELDS TO DISHES TABLE
-- ============================================
ALTER TABLE dishes
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Index for sorting by rating
CREATE INDEX IF NOT EXISTS idx_dishes_average_rating ON dishes(average_rating DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Reviews: Anyone can view approved reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can view their own reviews"
  ON reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reviews"
  ON reviews FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update all reviews"
  ON reviews FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Review Votes: Users can view and manage their votes
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vote counts"
  ON review_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can create votes"
  ON review_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their votes"
  ON review_votes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their votes"
  ON review_votes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update dish rating statistics
CREATE OR REPLACE FUNCTION update_dish_rating_stats(p_dish_id UUID)
RETURNS VOID AS $$
DECLARE
  v_avg_rating DECIMAL(3,2);
  v_review_count INTEGER;
BEGIN
  -- Calculate average rating and count for approved reviews only
  SELECT
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO v_avg_rating, v_review_count
  FROM reviews
  WHERE dish_id = p_dish_id
    AND is_approved = true;

  -- Update dish table
  UPDATE dishes
  SET
    average_rating = v_avg_rating,
    review_count = v_review_count
  WHERE id = p_dish_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update review vote counts
CREATE OR REPLACE FUNCTION update_review_vote_counts(p_review_id UUID)
RETURNS VOID AS $$
DECLARE
  v_helpful_count INTEGER;
  v_not_helpful_count INTEGER;
BEGIN
  -- Count votes
  SELECT
    COUNT(*) FILTER (WHERE vote_type = 'helpful'),
    COUNT(*) FILTER (WHERE vote_type = 'not_helpful')
  INTO v_helpful_count, v_not_helpful_count
  FROM review_votes
  WHERE review_id = p_review_id;

  -- Update review
  UPDATE reviews
  SET
    helpful_count = v_helpful_count,
    not_helpful_count = v_not_helpful_count
  WHERE id = p_review_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if purchase is verified
CREATE OR REPLACE FUNCTION check_verified_purchase(p_user_id UUID, p_dish_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM orders o
    INNER JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = p_user_id
      AND oi.dish_id = p_dish_id
      AND o.status = 'delivered'
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update dish stats when review is added/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_dish_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stats for the affected dish
  IF TG_OP = 'DELETE' THEN
    PERFORM update_dish_rating_stats(OLD.dish_id);
  ELSE
    PERFORM update_dish_rating_stats(NEW.dish_id);
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_review_dish_rating ON reviews;
CREATE TRIGGER trigger_review_dish_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_dish_rating();

-- Trigger to update review vote counts
CREATE OR REPLACE FUNCTION trigger_update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_review_vote_counts(OLD.review_id);
  ELSE
    PERFORM update_review_vote_counts(NEW.review_id);
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_review_votes ON review_votes;
CREATE TRIGGER trigger_review_votes
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_vote_counts();

-- Trigger to auto-verify purchase on review creation
CREATE OR REPLACE FUNCTION trigger_verify_purchase()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_verified_purchase := check_verified_purchase(NEW.user_id, NEW.dish_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_review_verify_purchase ON reviews;
CREATE TRIGGER trigger_review_verify_purchase
  BEFORE INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_verify_purchase();

-- Updated_at trigger for reviews
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON reviews;
CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE reviews IS 'User reviews and ratings for dishes';
COMMENT ON TABLE review_votes IS 'Helpful/not helpful votes on reviews';
COMMENT ON COLUMN reviews.is_verified_purchase IS 'Automatically set to true if user ordered and received this dish';
COMMENT ON COLUMN reviews.is_approved IS 'Admin moderation flag';
COMMENT ON COLUMN dishes.average_rating IS 'Calculated average rating from approved reviews';
COMMENT ON COLUMN dishes.review_count IS 'Total count of approved reviews';
