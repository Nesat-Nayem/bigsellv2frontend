import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL ="http://localhost:8080/v1/api";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const body = await request.json();

    const resp = await fetch(`${API_BASE_URL}/orders/quote/delhivery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return NextResponse.json(
        { message: data?.message || "Failed to fetch Delhivery quote" },
        { status: resp.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Quote proxy error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
