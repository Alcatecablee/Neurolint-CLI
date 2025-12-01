import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectPath, options = {} } = body;

    if (!projectPath || typeof projectPath !== "string") {
      return NextResponse.json(
        { error: "projectPath is required for security - cannot use server working directory" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const { React192FeatureDetector } = require("../../../../scripts/react192-feature-detector");
    const detector = new React192FeatureDetector({
      verbose: options.verbose || false,
      projectPath,
    });
    
    const result = await detector.detect();

    return NextResponse.json({
      success: true,
      command: "detect-react192",
      viewTransitions: result.viewTransitions || [],
      useEffectEvent: result.useEffectEvent || [],
      activity: result.activity || [],
      totalOpportunities: result.total || 0,
      executionTime: Date.now() - startTime,
      metadata: {
        version: "1.3.9",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "React 19.2 detection failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    command: "detect-react192",
    description: "Detect React 19.2 feature opportunities (View Transitions, useEffectEvent, Activity)",
    method: "POST",
    parameters: {
      projectPath: "string (required) - Absolute path to the project to analyze",
      options: "object (optional) - Additional options like verbose: true",
    },
  });
}
