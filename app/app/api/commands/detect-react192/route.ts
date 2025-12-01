import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, filename, options = {} } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code is required and must be a string" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const detectReact192 = require("../../../../scripts/detect-react192");
    const result = await detectReact192.detect(code, {
      filename: filename || "unknown.tsx",
      verbose: options.verbose || false,
      ...options,
    });

    return NextResponse.json({
      success: true,
      command: "detect-react192",
      opportunities: result.opportunities || [],
      viewTransitions: result.viewTransitions || [],
      useEffectEvent: result.useEffectEvent || [],
      activityComponents: result.activityComponents || [],
      totalOpportunities: result.totalOpportunities || 0,
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
      code: "string (required) - The code to analyze",
      filename: "string (optional) - The filename",
      options: "object (optional) - Additional options",
    },
  });
}
