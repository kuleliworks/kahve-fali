import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({
    BLOB_PUBLIC_BASE: process.env.BLOB_PUBLIC_BASE || null,
  });
}
