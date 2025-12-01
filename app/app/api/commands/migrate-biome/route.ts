import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: "Not implemented",
      message: "Biome migration is not yet available via the SaaS API. Use the CLI directly: npx neurolint migrate-biome",
      alternative: "npx neurolint migrate-biome /path/to/project",
    },
    { status: 501 }
  );
}

export async function GET() {
  return NextResponse.json({
    command: "migrate-biome",
    description: "Migrate from ESLint/Prettier to Biome (CLI only - not available via SaaS)",
    method: "POST",
    status: "not_implemented",
    alternative: "Use CLI: npx neurolint migrate-biome /path/to/project",
  });
}
