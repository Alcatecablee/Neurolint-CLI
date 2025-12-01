import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authGuard, createProtectedHandler, AuthenticatedUser } from "../../../../lib/auth-guard";
import { AnalysisJobQueueClient, runSynchronousAnalysis, JobPriority } from "../../../../lib/analysis-job-queue";

export const dynamic = "force-dynamic";

function getAuthenticatedSupabase(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase not configured');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export const POST = createProtectedHandler(
  async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      const body = await request.json();
      const { code, filename, layers, options, priority, async: useAsync = false } = body;

      if (!code || typeof code !== "string") {
        return NextResponse.json(
          { error: "Code is required and must be a string" },
          { status: 400 }
        );
      }

      if (code.length > 500000) {
        return NextResponse.json(
          { error: "Code exceeds maximum size of 500KB" },
          { status: 400 }
        );
      }

      const validLayers = layers?.filter((l: number) => l >= 1 && l <= 7) || [1, 2, 3, 4, 5, 6, 7];

      let jobPriority: JobPriority = 'normal';
      if (user.tier === 'enterprise') {
        jobPriority = priority || 'high';
      } else if (user.tier === 'premium') {
        jobPriority = priority === 'urgent' ? 'high' : (priority || 'normal');
      }

      if (useAsync) {
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
          return NextResponse.json({ error: "Authorization required for async" }, { status: 401 });
        }
        
        const token = authHeader.replace("Bearer ", "");
        const supabase = getAuthenticatedSupabase(token);
        const client = new AnalysisJobQueueClient(supabase, user.id);
        
        const job = await client.createJob({
          code,
          filename,
          layers: validLayers,
          options: options || {},
          priority: jobPriority,
        });

        return NextResponse.json({
          success: true,
          jobId: job.id,
          status: job.status,
          message: "Analysis job queued successfully",
          estimatedWait: getEstimatedWait(jobPriority),
        });
      }

      const result = runSynchronousAnalysis(code, {
        filename: filename || 'temp.tsx',
        layers: validLayers,
      });

      return NextResponse.json({
        success: result.success,
        result: result,
        userId: user.id,
        metadata: {
          version: "1.4.0",
          timestamp: new Date().toISOString(),
          userTier: user.tier,
        },
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      return NextResponse.json(
        { error: "Analysis failed", message: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    }
  },
  { requireAuth: true }
);

export const GET = createProtectedHandler(
  async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      const { searchParams } = new URL(request.url);
      const jobId = searchParams.get("jobId");

      if (!jobId) {
        return NextResponse.json(
          { error: "jobId parameter is required" },
          { status: 400 }
        );
      }

      const authHeader = request.headers.get("authorization");
      if (!authHeader) {
        return NextResponse.json({ error: "Authorization required" }, { status: 401 });
      }
      
      const token = authHeader.replace("Bearer ", "");
      const supabase = getAuthenticatedSupabase(token);
      const client = new AnalysisJobQueueClient(supabase, user.id);

      const job = await client.getJob(jobId);

      if (!job) {
        return NextResponse.json(
          { error: "Job not found or access denied" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        job: {
          id: job.id,
          status: job.status,
          progress: job.progress,
          result: job.result,
          error: job.error,
          createdAt: job.createdAt,
          startedAt: job.startedAt,
          completedAt: job.completedAt,
        },
      });
    } catch (error) {
      console.error("Failed to get job status:", error);
      return NextResponse.json(
        { error: "Failed to get job status" },
        { status: 500 }
      );
    }
  },
  { requireAuth: true }
);

export const DELETE = createProtectedHandler(
  async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      const { searchParams } = new URL(request.url);
      const jobId = searchParams.get("jobId");

      if (!jobId) {
        return NextResponse.json(
          { error: "jobId parameter is required" },
          { status: 400 }
        );
      }

      const authHeader = request.headers.get("authorization");
      if (!authHeader) {
        return NextResponse.json({ error: "Authorization required" }, { status: 401 });
      }
      
      const token = authHeader.replace("Bearer ", "");
      const supabase = getAuthenticatedSupabase(token);
      const client = new AnalysisJobQueueClient(supabase, user.id);

      const cancelled = await client.cancelJob(jobId);

      if (!cancelled) {
        return NextResponse.json(
          { error: "Job not found, already completed, or access denied" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Job cancelled successfully",
      });
    } catch (error) {
      console.error("Failed to cancel job:", error);
      return NextResponse.json(
        { error: "Failed to cancel job" },
        { status: 500 }
      );
    }
  },
  { requireAuth: true }
);

function getEstimatedWait(priority: JobPriority): string {
  switch (priority) {
    case 'urgent':
      return '< 10 seconds';
    case 'high':
      return '< 30 seconds';
    case 'normal':
      return '1-2 minutes';
    case 'low':
      return '2-5 minutes';
    default:
      return '1-2 minutes';
  }
}
