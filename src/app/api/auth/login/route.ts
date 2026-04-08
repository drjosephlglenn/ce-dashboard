import { NextRequest, NextResponse } from "next/server";
import { createToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const dashboardPassword = process.env.DASHBOARD_PASSWORD;

    if (!dashboardPassword) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (password !== dashboardPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    const token = await createToken();
    const isProduction = process.env.NODE_ENV === "production";

    const response = NextResponse.json({ success: true });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
