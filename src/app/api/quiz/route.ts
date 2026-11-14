// This route is now superseded by /api/staff/quiz (POST for submit, GET for questions).
// Kept as a redirect shim for backwards compatibility with the prototype quiz page.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Use POST /api/staff/quiz for quiz submission." },
    { status: 410 }
  );
}
