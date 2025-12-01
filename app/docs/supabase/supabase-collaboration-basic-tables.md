-- Basic Collaboration Tables for NeuroLint Pro
-- Create tables first, then add constraints and policies

-- Collaboration Sessions
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  document_content TEXT NOT NULL DEFAULT '',
  document_filename TEXT NOT NULL DEFAULT 'untitled.tsx',
  document_language TEXT NOT NULL DEFAULT 'typescript',
  host_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_locked BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  max_participants INTEGER DEFAULT 10,
  session_settings JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Collaboration Participants
CREATE TABLE IF NOT EXISTS collaboration_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  user_color TEXT NOT NULL DEFAULT '#2196F3',
  user_avatar TEXT,
  role TEXT NOT NULL DEFAULT 'participant',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  cursor_position JSONB DEFAULT '{}',
  permissions JSONB DEFAULT '{}',
  UNIQUE(session_id, user_id)
);

-- Collaboration Operations
CREATE TABLE IF NOT EXISTS collaboration_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  operation_type TEXT NOT NULL,
  position INTEGER NOT NULL,
  content TEXT,
  length INTEGER,
  old_length INTEGER,
  base_revision INTEGER NOT NULL DEFAULT 0,
  revision INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Collaboration Cursors
CREATE TABLE IF NOT EXISTS collaboration_cursors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  cursor_line INTEGER NOT NULL DEFAULT 0,
  cursor_column INTEGER NOT NULL DEFAULT 0,
  selection_start_line INTEGER,
  selection_start_column INTEGER,
  selection_end_line INTEGER,
  selection_end_column INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Collaboration Comments
CREATE TABLE IF NOT EXISTS collaboration_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  file_path TEXT,
  line_number INTEGER,
  column_number INTEGER DEFAULT 0,
  is_resolved BOOLEAN DEFAULT FALSE,
  comment_type TEXT DEFAULT 'comment',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
);

-- Collaboration Analysis
CREATE TABLE IF NOT EXISTS collaboration_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  triggered_by UUID NOT NULL,
  input_code TEXT NOT NULL,
  output_code TEXT,
  layers_executed INTEGER[] DEFAULT '{}',
  dry_run BOOLEAN NOT NULL DEFAULT TRUE,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  execution_time INTEGER NOT NULL DEFAULT 0,
  detected_issues JSONB DEFAULT '[]',
  analysis_results JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_host ON collaboration_sessions(host_user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_active ON collaboration_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_collaboration_participants_session ON collaboration_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_participants_active ON collaboration_participants(session_id, is_active);
CREATE INDEX IF NOT EXISTS idx_collaboration_operations_session ON collaboration_operations(session_id, revision);
CREATE INDEX IF NOT EXISTS idx_collaboration_cursors_session ON collaboration_cursors(session_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_comments_session ON collaboration_comments(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaboration_analysis_session ON collaboration_analysis(session_id, created_at DESC);

-- Enable RLS
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_cursors ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_analysis ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for sessions
DROP POLICY IF EXISTS "Users can view public sessions or their own" ON collaboration_sessions;
CREATE POLICY "Users can view public sessions or their own" ON collaboration_sessions
  FOR SELECT USING (
    is_public = true OR 
    host_user_id = auth.uid() OR
    id IN (
      SELECT session_id FROM collaboration_participants 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create sessions" ON collaboration_sessions;
CREATE POLICY "Users can create sessions" ON collaboration_sessions
  FOR INSERT WITH CHECK (host_user_id = auth.uid());

DROP POLICY IF EXISTS "Hosts can modify their sessions" ON collaboration_sessions;
CREATE POLICY "Hosts can modify their sessions" ON collaboration_sessions
  FOR ALL USING (host_user_id = auth.uid());

-- Basic RLS policies for participants
DROP POLICY IF EXISTS "Users can view session participants" ON collaboration_participants;
CREATE POLICY "Users can view session participants" ON collaboration_participants
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM collaboration_sessions 
      WHERE is_public = true OR host_user_id = auth.uid()
    ) OR
    session_id IN (
      SELECT session_id FROM collaboration_participants 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage their own participation" ON collaboration_participants;
CREATE POLICY "Users can manage their own participation" ON collaboration_participants
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Session hosts can manage participants" ON collaboration_participants;
CREATE POLICY "Session hosts can manage participants" ON collaboration_participants
  FOR ALL USING (
    session_id IN (
      SELECT id FROM collaboration_sessions 
      WHERE host_user_id = auth.uid()
    )
  );

-- Basic RLS policies for comments
DROP POLICY IF EXISTS "Users can view session comments" ON collaboration_comments;
CREATE POLICY "Users can view session comments" ON collaboration_comments
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM collaboration_sessions 
      WHERE is_public = true OR host_user_id = auth.uid()
    ) OR
    session_id IN (
      SELECT session_id FROM collaboration_participants 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create comments" ON collaboration_comments;
CREATE POLICY "Users can create comments" ON collaboration_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    session_id IN (
      SELECT session_id FROM collaboration_participants 
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Users can modify their own comments" ON collaboration_comments;
CREATE POLICY "Users can modify their own comments" ON collaboration_comments
  FOR UPDATE USING (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON collaboration_sessions TO authenticated;
GRANT ALL ON collaboration_participants TO authenticated;
GRANT ALL ON collaboration_operations TO authenticated;
GRANT ALL ON collaboration_cursors TO authenticated;
GRANT ALL ON collaboration_comments TO authenticated;
GRANT ALL ON collaboration_analysis TO authenticated;
