-- Create analysis_jobs table for async job queue
CREATE TABLE IF NOT EXISTS public.analysis_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    code TEXT NOT NULL,
    filename TEXT,
    layers INTEGER[] NOT NULL DEFAULT ARRAY[1, 2, 3, 4, 5, 6, 7],
    options JSONB DEFAULT '{}',
    result JSONB,
    error TEXT,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_user_id ON public.analysis_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON public.analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_priority_created ON public.analysis_jobs(priority DESC, created_at ASC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_expires_at ON public.analysis_jobs(expires_at) WHERE status IN ('pending', 'processing');

-- Enable Row Level Security
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own jobs
CREATE POLICY "Users can view own analysis jobs"
    ON public.analysis_jobs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Users can only create their own jobs
CREATE POLICY "Users can create own analysis jobs"
    ON public.analysis_jobs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own jobs (for cancellation)
CREATE POLICY "Users can update own analysis jobs"
    ON public.analysis_jobs
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can do everything (for job processing)
CREATE POLICY "Service role has full access to analysis jobs"
    ON public.analysis_jobs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_analysis_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_analysis_jobs_updated_at ON public.analysis_jobs;
CREATE TRIGGER trigger_update_analysis_jobs_updated_at
    BEFORE UPDATE ON public.analysis_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_analysis_jobs_updated_at();

-- Function to cleanup expired jobs (run via cron or scheduled function)
CREATE OR REPLACE FUNCTION cleanup_expired_analysis_jobs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.analysis_jobs
    WHERE expires_at < NOW()
    AND status IN ('completed', 'failed', 'cancelled');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION cleanup_expired_analysis_jobs() TO service_role;

COMMENT ON TABLE public.analysis_jobs IS 'Async analysis job queue for code analysis requests';
COMMENT ON COLUMN public.analysis_jobs.status IS 'Job status: pending, processing, completed, failed, cancelled';
COMMENT ON COLUMN public.analysis_jobs.priority IS 'Job priority: low, normal, high, urgent';
COMMENT ON COLUMN public.analysis_jobs.layers IS 'Array of layer IDs to run (1-7)';
COMMENT ON COLUMN public.analysis_jobs.result IS 'JSON result of the analysis when completed';
COMMENT ON COLUMN public.analysis_jobs.progress IS 'Progress percentage (0-100)';
