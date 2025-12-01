import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageJson, fix = false, options = {} } = body;

    if (!packageJson) {
      return NextResponse.json(
        { error: "packageJson is required" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const checkDeps = require("../../../../scripts/check-deps");
    const result = await checkDeps.check(packageJson, {
      fix,
      verbose: options.verbose || false,
      ...options,
    });

    return NextResponse.json({
      success: true,
      command: "check-deps",
      compatible: result.compatible || false,
      incompatibleDeps: result.incompatibleDeps || [],
      suggestions: result.suggestions || [],
      fixes: result.fixes || [],
      fixApplied: fix,
      executionTime: Date.now() - startTime,
      metadata: {
        version: "1.3.9",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Dependency check failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    command: "check-deps",
    description: "Check React 19 dependency compatibility",
    method: "POST",
    parameters: {
      packageJson: "object (required) - The package.json content",
      fix: "boolean (default: false) - Apply fixes automatically",
      options: "object (optional) - Additional options",
    },
  });
}
