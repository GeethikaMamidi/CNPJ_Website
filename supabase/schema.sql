-- ====================================================================
-- TechTatva Event Management Dashboard Database Schema
-- Compatible with PostgreSQL / Supabase
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Technical',
    description TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Judges Table
CREATE TABLE IF NOT EXISTS judges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    organization TEXT,
    designation TEXT,
    assigned_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Participants / Teams Table
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    registration_id TEXT,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    category TEXT DEFAULT 'Technical',
    college TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Judging Criteria Table
CREATE TABLE IF NOT EXISTS criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    max_marks NUMERIC NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Evaluations Table
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    total_score NUMERIC DEFAULT 0,
    remarks TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'submitted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_judge_participant_eval UNIQUE (judge_id, participant_id, event_id)
);

-- 6. Criterion Scores Table
CREATE TABLE IF NOT EXISTS scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    criteria_id UUID NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
    marks NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_eval_criteria_score UNIQUE (evaluation_id, criteria_id)
);

-- 7. Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    items_supplied TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
    delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'partial', 'delivered')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Mementos Table
CREATE TABLE IF NOT EXISTS mementos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'trophy',
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    quantity_required INTEGER NOT NULL DEFAULT 0,
    quantity_received INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'partial', 'received', 'delivered')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Auto-Calculated Leaderboard View (results_view)
CREATE OR REPLACE VIEW results_view AS
WITH eval_summary AS (
    SELECT 
        e.participant_id,
        e.event_id,
        p.name AS participant_name,
        p.registration_id,
        ev.name AS event_name,
        ev.category AS event_category,
        AVG(e.total_score) AS final_score,
        COUNT(e.id) AS num_judges,
        json_agg(json_build_object(
            'judge_name', j.name,
            'score', e.total_score,
            'remarks', e.remarks
        )) AS judge_breakdown
    FROM evaluations e
    JOIN participants p ON e.participant_id = p.id
    JOIN events ev ON e.event_id = ev.id
    JOIN judges j ON e.judge_id = j.id
    WHERE e.status = 'submitted'
    GROUP BY e.participant_id, e.event_id, p.name, p.registration_id, ev.name, ev.category
)
SELECT 
    participant_id,
    participant_name,
    registration_id,
    event_id,
    event_name,
    event_category,
    ROUND(final_score::numeric, 2) AS final_score,
    num_judges,
    judge_breakdown,
    DENSE_RANK() OVER (PARTITION BY event_id ORDER BY final_score DESC) AS position
FROM eval_summary;

-- 10. Indexes for Fast Realtime Queries
CREATE INDEX IF NOT EXISTS idx_judges_assigned_event ON judges(assigned_event_id);
CREATE INDEX IF NOT EXISTS idx_participants_event ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_criteria_event ON criteria(event_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_event_judge ON evaluations(event_id, judge_id);
CREATE INDEX IF NOT EXISTS idx_scores_evaluation ON scores(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_mementos_vendor ON mementos(vendor_id);

-- 11. Row Level Security Policies (Allow Public Read & Write for Demo Anon Key)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mementos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Events" ON events FOR SELECT USING (true);
CREATE POLICY "Public Write Events" ON events FOR ALL USING (true);

CREATE POLICY "Public Read Judges" ON judges FOR SELECT USING (true);
CREATE POLICY "Public Write Judges" ON judges FOR ALL USING (true);

CREATE POLICY "Public Read Participants" ON participants FOR SELECT USING (true);
CREATE POLICY "Public Write Participants" ON participants FOR ALL USING (true);

CREATE POLICY "Public Read Criteria" ON criteria FOR SELECT USING (true);
CREATE POLICY "Public Write Criteria" ON criteria FOR ALL USING (true);

CREATE POLICY "Public Read Evaluations" ON evaluations FOR SELECT USING (true);
CREATE POLICY "Public Write Evaluations" ON evaluations FOR ALL USING (true);

CREATE POLICY "Public Read Scores" ON scores FOR SELECT USING (true);
CREATE POLICY "Public Write Scores" ON scores FOR ALL USING (true);

CREATE POLICY "Public Read Vendors" ON vendors FOR SELECT USING (true);
CREATE POLICY "Public Write Vendors" ON vendors FOR ALL USING (true);

CREATE POLICY "Public Read Mementos" ON mementos FOR SELECT USING (true);
CREATE POLICY "Public Write Mementos" ON mementos FOR ALL USING (true);
