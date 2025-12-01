import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageJson, options = {} } = body;

    if (!packageJson || typeof packageJson !== "object") {
      return NextResponse.json(
        { error: "packageJson object is required" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const { React19DependencyChecker } = require("../../../../scripts/react19-dependency-checker");
    const checker = new React19DependencyChecker({
      verbose: options.verbose || false,
    });
    
    const result = await checker.checkPackageJson(packageJson);

    return NextResponse.json({
      success: true,
      command: "check-deps",
      compatible: result.compatible !== false,
      incompatibleDeps: result.incompatibleDeps || [],
      suggestions: result.suggestions || [],
      fixes: result.fixes || [],
      executionTime: Date.now() - startTime,
      metadata: {
        version: "1.4.0",
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
      packageJson: "object (required) - The package.json content as JSON object",
      options: "object (optional) - Additional options like verbose: true",
    },
  });
}
