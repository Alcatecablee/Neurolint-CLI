import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseSr = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Import the neurolint engine
const getNeuroLintEngine = async () => {
  // Always return null during any build phase to avoid webpack issues
  if (
    typeof window === "undefined" &&
    (process.env.NEXT_PHASE === "phase-production-build" ||
      process.env.NODE_ENV === "test")
  ) {
    console.log("Skipping engine import during build/test time");
    return null;
  }

  try {
    // Use require for CommonJS module
    const engine = require("../../../../neurolint-pro.js");
    return engine;
  } catch (error) {
    console.error("Failed to load NeuroLint engine:", error);
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      layers,
      dryRun,
      collaborative = true,
      realTimeUpdates = true,
      participantId,
      sessionLocking = false,
      conflictResolution = "merge",
    } = body;

    const authHeader = request.headers.get("authorization");
    const hasBearer = !!authHeader?.startsWith("Bearer ");
    const token = hasBearer ? authHeader!.replace("Bearer ", "") : null;

    const guestUserId = request.headers.get("x-user-id");
    const guestUserName = request.headers.get("x-user-name") || "Anonymous";

    let userId: string | null = null;

    if (hasBearer && token) {
      const { data: { user }, error: authError } = await supabaseSr.auth.getUser(token);
      if (authError || !user) {
        return NextResponse.json(
          { error: "Invalid authentication" },
          { status: 401 },
        );
      }
      userId = user.id;
    } else if (guestUserId) {
      userId = guestUserId;
    } else {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 },
      );
    }

    // Get session from Supabase
    const { data: session, error: sessionError } = await supabaseSr
      .from('collaboration_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const code = session.document_content;
    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: "No code to analyze" },
        { status: 400 },
      );
    }

    // Load NeuroLint engine
    const engine = await getNeuroLintEngine();
    if (!engine) {
      return NextResponse.json(
        { error: "Analysis engine not available" },
        { status: 503 },
      );
    }

    // Check for session locking
    if (
      sessionLocking &&
      session.is_locked &&
      session.host_user_id !== userId
    ) {
      return NextResponse.json(
        { error: "Session is locked by host" },
        { status: 403 },
      );
    }

    // Implement collaborative conflict resolution
    const conflictCheck = await checkForConflicts(
      sessionId,
      userId!,
      code,
      conflictResolution,
    );

    if (conflictCheck.hasConflict && conflictResolution === "strict") {
      return NextResponse.json(
        {
          error: "Conflict detected",
          conflictDetails: conflictCheck.details,
          requiresResolution: true,
        },
        { status: 409 },
      );
    }

    // Perform analysis via engine
    const start = Date.now();
    const analysisResult = await engine.runAnalysis({
      code,
      layers,
      dryRun: !!dryRun,
    });
    const totalExecutionTime = Date.now() - start;

    const resultPayload = {
      analysisId: `analysis_${Date.now()}`,
      success: !!analysisResult?.success,
      transformed: analysisResult?.transformedCode || code,
      totalExecutionTime,
      analysis: analysisResult?.analysis || null,
      error: analysisResult?.error || null,
    };

    // Store analysis record
    try {
      await supabaseSr.from('collaboration_analyses').insert({
        id: resultPayload.analysisId,
        session_id: sessionId,
        input_code: code,
        output_code: resultPayload.transformed,
        layers_executed: layers || [],
        dry_run: !!dryRun,
        execution_time: totalExecutionTime,
        success: resultPayload.success,
        analysis_results: resultPayload.analysis,
        triggered_by: userId,
        triggered_by_name: guestUserName,
      });
    } catch (insertError) {
      // Continue without storing the record if table doesn't exist
    }

    return NextResponse.json({ result: resultPayload });
  } catch (error) {
    console.error('Collaboration analyze POST error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    const authHeader = request.headers.get("authorization");
    const hasBearer = !!authHeader?.startsWith("Bearer ");
    const token = hasBearer ? authHeader!.replace("Bearer ", "") : null;

    const guestUserId = request.headers.get("x-user-id");

    if (!hasBearer && !guestUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 },
      );
    }

    // Get analysis results for session from DB
    // Handle missing table gracefully
    let analyses = [];
    try {
      const { data, error } = await supabaseSr
        .from('collaboration_analyses')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        analyses = [];
      } else {
        analyses = data || [];
      }
    } catch (tableError) {
      analyses = [];
    }

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error("Collaboration analyze GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Helper Functions for Collaborative Features

async function checkForConflicts(
  sessionId: string,
  userId: string,
  currentCode: string,
  conflictResolution: string,
): Promise<{ hasConflict: boolean; details?: any }> {
  // Placeholder conflict check; always return no conflict for now
  return { hasConflict: false };
}
