import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nextConfig, webpackConfig, options = {} } = body;

    const startTime = Date.now();

    const checkTurbopack = require("../../../../scripts/check-turbopack");
    const result = await checkTurbopack.check({
      nextConfig,
      webpackConfig,
      verbose: options.verbose || false,
      ...options,
    });

    return NextResponse.json({
      success: true,
      command: "check-turbopack",
      compatible: result.compatible || false,
      incompatibilities: result.incompatibilities || [],
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
      nextConfig: "string (optional) - next.config.js content",
      webpackConfig: "string (optional) - webpack.config.js content",
      options: "object (optional) - Additional options",
    },
  });
}
