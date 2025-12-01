import { NextRequest, NextResponse } from "next/server";
import { createProtectedHandler, createOptionalAuthHandler, AuthenticatedUser } from "../../../../lib/auth-guard";

export const dynamic = "force-dynamic";

export const POST = createOptionalAuthHandler(
  async (request: NextRequest, user: AuthenticatedUser | null) => {
    try {
      const body = await request.json();
      const { code, filename, options = {} } = body;

      if (!code || typeof code !== "string") {
        return NextResponse.json(
          { error: "Code is required and must be a string" },
          { status: 400 }
        );
      }

      if (code.length > 500000) {
        return NextResponse.json(
          { error: "Code exceeds maximum size of 500KB" },
          { status: 400 }
        );
      }

      const startTime = Date.now();

      const sharedCore = require("../../../../shared-core");
      const analysisResult = await sharedCore.analyze(code, {
        filename: filename || "temp.tsx",
        layers: [1, 2, 3, 4, 5, 6, 7],
        verbose: options.verbose || false,
      });

      const issues = analysisResult.issues || analysisResult.detectedIssues || [];
      const errors = issues.filter((i: any) => i.severity === "critical" || i.severity === "error");
      const warnings = issues.filter((i: any) => i.severity === "warning" || i.severity === "medium" || i.severity === "high");

      return NextResponse.json({
        success: true,
        command: "validate",
        userId: user?.id || 'anonymous',
        isValid: errors.length === 0,
        errors: errors.map((i: any) => ({
          type: i.type,
          description: i.description || i.reason,
          line: i.line,
          column: i.column,
        })),
        warnings: warnings.map((i: any) => ({
          type: i.type,
          description: i.description || i.reason,
          line: i.line,
          column: i.column,
        })),
        syntaxValid: !errors.some((e: any) => e.type === "syntax"),
        totalIssues: issues.length,
        executionTime: Date.now() - startTime,
        metadata: {
          version: "1.4.0",
          timestamp: new Date().toISOString(),
          userTier: user?.tier || 'anonymous',
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const isSyntaxError = message.includes("SyntaxError") || message.includes("Unexpected");
      
      return NextResponse.json({
        success: true,
        command: "validate",
        isValid: false,
        errors: [{
          type: isSyntaxError ? "syntax" : "validation",
          description: message,
        }],
        warnings: [],
        syntaxValid: !isSyntaxError,
        executionTime: 0,
      });
    }
  }
);

export async function GET() {
  return NextResponse.json({
    command: "validate",
    description: "Validate files without applying fixes - checks for issues across all 7 layers",
    method: "POST",
    authentication: "Optional (anonymous validation allowed with rate limits)",
    parameters: {
      code: "string (required) - The code to validate",
      filename: "string (optional) - The filename",
      options: "object (optional) - Additional validation options",
    },
  });
}
