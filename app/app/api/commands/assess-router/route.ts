import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectStructure, files, options = {} } = body;

    const startTime = Date.now();

    const assessRouter = require("../../../../scripts/assess-router");
    const result = await assessRouter.assess({
      projectStructure,
      files,
      verbose: options.verbose || false,
      ...options,
    });

    return NextResponse.json({
      success: true,
      command: "assess-router",
      complexityScore: result.complexityScore || 0,
      routerType: result.routerType || "unknown",
      recommendation: result.recommendation || "",
      simplificationOpportunities: result.simplificationOpportunities || [],
      features: result.features || {},
      executionTime: Date.now() - startTime,
      metadata: {
        version: "1.3.9",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Router assessment failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    command: "assess-router",
    description: "Assess Next.js router complexity and recommend optimal setup",
    method: "POST",
    parameters: {
      projectStructure: "object (optional) - Project directory structure",
      files: "array (optional) - List of files to analyze",
      options: "object (optional) - Additional options",
    },
  });
}
