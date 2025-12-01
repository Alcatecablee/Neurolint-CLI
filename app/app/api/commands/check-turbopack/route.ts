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

    const { TurbopackMigrationAssistant } = require("../../../../scripts/turbopack-migration-assistant");
    const assistant = new TurbopackMigrationAssistant({
      verbose: options.verbose || false,
      projectPath,
    });
    
    const result = await assistant.analyze();

    return NextResponse.json({
      success: true,
      command: "check-turbopack",
      compatible: result.compatible !== false,
      issues: result.issues || [],
      suggestions: result.suggestions || [],
      migrationSteps: result.migrationSteps || [],
      executionTime: Date.now() - startTime,
      metadata: {
        version: "1.3.9",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Turbopack check failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    command: "check-turbopack",
    description: "Analyze Turbopack migration compatibility",
    method: "POST",
    parameters: {
      projectPath: "string (required) - Absolute path to the project to analyze",
      options: "object (optional) - Additional options like verbose: true",
    },
  });
}
