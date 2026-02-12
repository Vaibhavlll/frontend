import { NextResponse } from "next/server";
import { getSessionToken } from "@/components/utils/clerkSession";

const allowedOrigins = [
  "https://heidelai.com",
  "https://www.heidelai.com",
  "https://development.heidelai.com",
  "https://testing.heidelai.com",
  "https://testing2.heidelai.com",
  
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  if (origin && allowedOrigins.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };
  }
  return {};
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const { sessionId } = await request.json();

  if (!sessionId) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401, headers: getCorsHeaders(origin) }
    );
  }

  try {
    const token = await getSessionToken(sessionId);
    return NextResponse.json({ token }, { headers: getCorsHeaders(origin) });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get session token" },
      { status: 500, headers: getCorsHeaders(origin) }
    );
  }
}
