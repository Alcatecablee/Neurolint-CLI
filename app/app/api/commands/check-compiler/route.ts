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

    const checkCompiler = require("../../../../scripts/check-compiler");
    const result = await checkCompiler.check(code, {
      filename: filename || "unknown.tsx",
      verbose: options.verbose || false,
      ...options,
    });

    return NextResponse.json({
      success: true,
      command: "check-compiler",
      opportunities: result.opportunities || [],
      opportunityCount: result.opportunityCount || 0,
      recommendCompiler: result.recommendCompiler || false,
      potentialSavings: result.potentialSavings || {},
      executionTime: Date.now() - startTime,
      metadata: {
        version: "1.3.9",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Compiler check failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    command: "check-compiler",
    description: "Detect React Compiler optimization opportunities",
    method: "POST",
    parameters: {
      code: "string (required) - The code to analyze",
      filename: "string (optional) - The filename",
      options: "object (optional) - Additional options",
    },
  });
}
