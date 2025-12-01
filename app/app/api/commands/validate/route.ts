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

    const TransformationValidator = require("../../../../validator");
    const result = TransformationValidator.validateCode(code, {
      filename: filename || "unknown.tsx",
      verbose: options.verbose || false,
      ...options,
    });

    return NextResponse.json({
      success: true,
      command: "validate",
      isValid: result.isValid || false,
      errors: result.errors || [],
      warnings: result.warnings || [],
      syntaxValid: result.syntaxValid || false,
      semanticValid: result.semanticValid || false,
      executionTime: Date.now() - startTime,
      metadata: {
        version: "1.3.9",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Validation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    command: "validate",
    description: "Validate files without applying fixes",
    method: "POST",
    parameters: {
      code: "string (required) - The code to validate",
      filename: "string (optional) - The filename",
      options: "object (optional) - Additional validation options",
    },
  });
}
