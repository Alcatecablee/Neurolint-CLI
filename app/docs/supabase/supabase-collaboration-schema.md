-- NeuroLint Pro Complete Schema
-- Supabase tables and RLS policies for collaborative code editing and GitHub repository scanning

-- Enable real-time for the schema
ALTER PUBLICATION supabase_realtime ADD TABLE collaboration_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE collaboration_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE collaboration_operations;
ALTER PUBLICATION supabase_realtime ADD TABLE collaboration_cursors;
ALTER PUBLICATION supabase_realtime ADD TABLE collaboration_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE repository_scans;
ALTER PUBLICATION supabase_realtime ADD TABLE repository_scan_results;

-- Collaboration Sessions
CREATE TABLE collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document_content TEXT NOT NULL DEFAULT '',
  document_filename TEXT NOT NULL DEFAULT 'untitled.tsx',
  document_language TEXT NOT NULL DEFAULT 'typescript',
  host_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_locked BOOLEAN DEFAULT FALSE,
  max_participants INTEGER DEFAULT 10,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Collaboration Participants
CREATE TABLE collaboration_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_color TEXT NOT NULL,
  user_avatar TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  is_host BOOLEAN DEFAULT FALSE,
  UNIQUE(session_id, user_id)
);

-- Collaborative Operations (for operational transform)
CREATE TABLE collaboration_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('insert', 'delete', 'replace')),
  position INTEGER NOT NULL,
  content TEXT,
  length INTEGER,
  old_length INTEGER,
  base_revision INTEGER NOT NULL,
  revision INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Live Cursors and Selections
CREATE TABLE collaboration_cursors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cursor_line INTEGER NOT NULL DEFAULT 0,
  cursor_column INTEGER NOT NULL DEFAULT 0,
  selection_start_line INTEGER,
  selection_start_column INTEGER,
  selection_end_line INTEGER,
  selection_end_column INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Comments and Chat
CREATE TABLE collaboration_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  column_number INTEGER NOT NULL DEFAULT 0,
  is_resolved BOOLEAN DEFAULT FALSE,
  comment_type TEXT DEFAULT 'comment' CHECK (comment_type IN ('comment', 'chat', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- NeuroLint Analysis Results (shared in session)
CREATE TABLE collaboration_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  triggered_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  input_code TEXT NOT NULL,
  output_code TEXT,
  layers_executed INTEGER[] NOT NULL,
  dry_run BOOLEAN NOT NULL DEFAULT TRUE,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  execution_time INTEGER NOT NULL DEFAULT 0,
  detected_issues JSONB DEFAULT '[]'::jsonb,
  analysis_results JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_collaboration_sessions_host ON collaboration_sessions(host_user_id);
CREATE INDEX idx_collaboration_sessions_active ON collaboration_sessions(last_activity DESC) WHERE expires_at > NOW();
CREATE INDEX idx_collaboration_participants_session ON collaboration_participants(session_id);
CREATE INDEX idx_collaboration_participants_active ON collaboration_participants(session_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_collaboration_operations_session ON collaboration_operations(session_id, revision);
CREATE INDEX idx_collaboration_cursors_session ON collaboration_cursors(session_id);
CREATE INDEX idx_collaboration_comments_session ON collaboration_comments(session_id, created_at DESC);
CREATE INDEX idx_collaboration_analysis_session ON collaboration_analysis(session_id, created_at DESC);

-- Update triggers
CREATE OR REPLACE FUNCTION update_collaboration_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE collaboration_sessions 
  SET last_activity = NOW(), updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_activity_operations
  AFTER INSERT ON collaboration_operations
  FOR EACH ROW EXECUTE FUNCTION update_collaboration_session_activity();

CREATE TRIGGER trigger_update_session_activity_cursors
  AFTER INSERT OR UPDATE ON collaboration_cursors
  FOR EACH ROW EXECUTE FUNCTION update_collaboration_session_activity();

CREATE TRIGGER trigger_update_session_activity_comments
  AFTER INSERT ON collaboration_comments
  FOR EACH ROW EXECUTE FUNCTION update_collaboration_session_activity();

-- Cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM collaboration_sessions 
  WHERE expires_at < NOW() OR (last_activity < NOW() - INTERVAL '30 minutes');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_cursors ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_analysis ENABLE ROW LEVEL SECURITY;

-- Sessions: Can view if participant, can modify if host
CREATE POLICY "Users can view sessions they participate in" ON collaboration_sessions
  FOR SELECT USING (
    id IN (
      SELECT session_id FROM collaboration_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Hosts can modify their sessions" ON collaboration_sessions
  FOR ALL USING (host_user_id = auth.uid());

CREATE POLICY "Anyone can create sessions" ON collaboration_sessions
  FOR INSERT WITH CHECK (host_user_id = auth.uid());

-- Participants: Can view session participants, can modify own participation
CREATE POLICY "Users can view session participants" ON collaboration_participants
  FOR SELECT USING (
    session_id IN (
      SELECT session_id FROM collaboration_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own participation" ON collaboration_participants
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Session hosts can manage participants" ON collaboration_participants
  FOR ALL USING (
    session_id IN (
      SELECT id FROM collaboration_sessions 
      WHERE host_user_id = auth.uid()
    )
  );

-- Operations: Can view/create if participant
CREATE POLICY "Participants can view session operations" ON collaboration_operations
  FOR SELECT USING (
    session_id IN (
      SELECT session_id FROM collaboration_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can create operations" ON collaboration_operations
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    session_id IN (
      SELECT session_id FROM collaboration_participants 
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- Cursors: Can view/modify if participant
CREATE POLICY "Participants can view session cursors" ON collaboration_cursors
  FOR SELECT USING (
    session_id IN (
      SELECT session_id FROM collaboration_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own cursor" ON collaboration_cursors
  FOR ALL USING (user_id = auth.uid());

-- Comments: Can view if participant, can modify own comments
CREATE POLICY "Participants can view session comments" ON collaboration_comments
  FOR SELECT USING (
    session_id IN (
      SELECT session_id FROM collaboration_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments in their sessions" ON collaboration_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    session_id IN (
      SELECT session_id FROM collaboration_participants 
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Users can modify their own comments" ON collaboration_comments
  FOR UPDATE USING (user_id = auth.uid());

-- Analysis: Can view if participant, can create if participant
CREATE POLICY "Participants can view session analysis" ON collaboration_analysis
  FOR SELECT USING (
    session_id IN (
      SELECT session_id FROM collaboration_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can create analysis" ON collaboration_analysis
  FOR INSERT WITH CHECK (
    triggered_by = auth.uid() AND
    session_id IN (
      SELECT session_id FROM collaboration_participants 
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- Grant permissions
GRANT ALL ON collaboration_sessions TO authenticated;
GRANT ALL ON collaboration_participants TO authenticated;
GRANT ALL ON collaboration_operations TO authenticated;
GRANT ALL ON collaboration_cursors TO authenticated;
GRANT ALL ON collaboration_comments TO authenticated;
GRANT ALL ON collaboration_analysis TO authenticated;

-- =================================================================
-- GITHUB REPOSITORY SCANNER SCHEMA
-- =================================================================

-- GitHub integrations table
CREATE TABLE github_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  github_user_id BIGINT NOT NULL,
  github_username TEXT NOT NULL,
  github_email TEXT,
  github_name TEXT,
  avatar_url TEXT,
  access_token TEXT NOT NULL, -- Encrypted in production
  scope TEXT NOT NULL,
  public_repos INTEGER DEFAULT 0,
  private_repos INTEGER DEFAULT 0,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, github_user_id)
);

-- Repository scans table
CREATE TABLE repository_scans (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repository_id BIGINT NOT NULL,
  repository_name TEXT NOT NULL,
  repository_full_name TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress JSONB DEFAULT '{"current": 0, "total": 0, "percentage": 0}',
  scan_data JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repository scan results table (for detailed file-by-file results)
CREATE TABLE repository_scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id TEXT REFERENCES repository_scans(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_sha TEXT,
  analysis_success BOOLEAN DEFAULT FALSE,
  recommended_layers INTEGER[] DEFAULT '{}',
  detected_issues JSONB DEFAULT '[]',
  technical_debt_score INTEGER DEFAULT 100,
  technical_debt_category TEXT DEFAULT 'excellent',
  original_code TEXT,
  transformed_code TEXT,
  execution_time INTEGER DEFAULT 0,
  confidence_score REAL DEFAULT 0.0,
  estimated_fix_time TEXT DEFAULT '0m',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repository analysis summary table
CREATE TABLE repository_analysis_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id TEXT REFERENCES repository_scans(id) ON DELETE CASCADE,
  total_files INTEGER DEFAULT 0,
  analyzed_files INTEGER DEFAULT 0,
  issues_found INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  high_issues INTEGER DEFAULT 0,
  medium_issues INTEGER DEFAULT 0,
  low_issues INTEGER DEFAULT 0,
  average_technical_debt REAL DEFAULT 100.0,
  estimated_fix_time TEXT DEFAULT '0m',
  modernization_priority JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE github_scanner_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_id TEXT REFERENCES repository_scans(id) ON DELETE CASCADE,
  files_analyzed INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,4) DEFAULT 0.0000,
  plan_type TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GitHub scanner indexes for performance
CREATE INDEX idx_github_integrations_user_id ON github_integrations(user_id);
CREATE INDEX idx_github_integrations_github_user_id ON github_integrations(github_user_id);
CREATE INDEX idx_repository_scans_user_id ON repository_scans(user_id);
CREATE INDEX idx_repository_scans_status ON repository_scans(status);
CREATE INDEX idx_repository_scans_created_at ON repository_scans(created_at DESC);
CREATE INDEX idx_repository_scan_results_scan_id ON repository_scan_results(scan_id);
CREATE INDEX idx_repository_scan_results_file_path ON repository_scan_results(file_path);
CREATE INDEX idx_repository_analysis_summary_scan_id ON repository_analysis_summary(scan_id);
CREATE INDEX idx_github_scanner_usage_user_id ON github_scanner_usage(user_id);
CREATE INDEX idx_github_scanner_usage_created_at ON github_scanner_usage(created_at DESC);

-- GitHub scanner RLS
ALTER TABLE github_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_analysis_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_scanner_usage ENABLE ROW LEVEL SECURITY;

-- GitHub scanner RLS Policies
CREATE POLICY "Users can manage their own GitHub integrations" ON github_integrations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own repository scans" ON repository_scans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view scan results for their scans" ON repository_scan_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM repository_scans
      WHERE repository_scans.id = repository_scan_results.scan_id
      AND repository_scans.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert scan results" ON repository_scan_results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view analysis summary for their scans" ON repository_analysis_summary
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM repository_scans
      WHERE repository_scans.id = repository_analysis_summary.scan_id
      AND repository_scans.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage analysis summaries" ON repository_analysis_summary
  FOR ALL WITH CHECK (true);

CREATE POLICY "Users can view their usage data" ON github_scanner_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage data" ON github_scanner_usage
  FOR INSERT WITH CHECK (true);

-- GitHub scanner functions and triggers
CREATE OR REPLACE FUNCTION update_repository_scan_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_repository_scans_timestamp
  BEFORE UPDATE ON repository_scans
  FOR EACH ROW
  EXECUTE FUNCTION update_repository_scan_timestamp();

-- Function to calculate technical debt statistics
CREATE OR REPLACE FUNCTION calculate_repository_technical_debt(scan_id_param TEXT)
RETURNS TABLE (
  average_score REAL,
  total_issues INTEGER,
  critical_count INTEGER,
  high_count INTEGER,
  medium_count INTEGER,
  low_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(AVG(technical_debt_score), 100.0)::REAL as average_score,
    COALESCE(SUM(jsonb_array_length(detected_issues)), 0)::INTEGER as total_issues,
    COALESCE(SUM((SELECT COUNT(*) FROM jsonb_array_elements(detected_issues) issue WHERE issue->>'severity' = 'critical')), 0)::INTEGER as critical_count,
    COALESCE(SUM((SELECT COUNT(*) FROM jsonb_array_elements(detected_issues) issue WHERE issue->>'severity' = 'high')), 0)::INTEGER as high_count,
    COALESCE(SUM((SELECT COUNT(*) FROM jsonb_array_elements(detected_issues) issue WHERE issue->>'severity' = 'medium')), 0)::INTEGER as medium_count,
    COALESCE(SUM((SELECT COUNT(*) FROM jsonb_array_elements(detected_issues) issue WHERE issue->>'severity' = 'low')), 0)::INTEGER as low_count
  FROM repository_scan_results
  WHERE scan_id = scan_id_param AND analysis_success = true;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's GitHub integration
CREATE OR REPLACE FUNCTION get_user_github_integration(user_id_param UUID)
RETURNS TABLE (
  integration_id UUID,
  github_username TEXT,
  access_token TEXT,
  connected_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id as integration_id,
    github_username,
    access_token,
    connected_at
  FROM github_integrations
  WHERE user_id = user_id_param AND is_active = true
  ORDER BY connected_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for GitHub scanner tables
GRANT ALL ON github_integrations TO authenticated;
GRANT ALL ON repository_scans TO authenticated;
GRANT ALL ON repository_scan_results TO authenticated;
GRANT ALL ON repository_analysis_summary TO authenticated;
GRANT ALL ON github_scanner_usage TO authenticated;
