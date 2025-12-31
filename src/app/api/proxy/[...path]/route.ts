import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://203.241.228.97:8888";

async function proxyRequest(request: NextRequest, path: string) {
  const url = `${BACKEND_URL}/api/${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Forward Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    // Add body for POST/PUT/PATCH requests
    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { success: false, error: { code: "PROXY_ERROR", message: "Backend server unavailable" } },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}
