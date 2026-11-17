import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, purpose, kitType, city, notes } = body;

    if (!name || !email || !kitType) {
      return NextResponse.json(
        { error: "Name, email, and preferred kit are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Generate unique reservation reference code
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const referenceCode = `HIM-${timestamp}-${suffix}`;

    console.log(`[SLAB INQUIRY RESERVED] ${referenceCode} - ${name} (${email}) - ${kitType} - ${purpose} - ${city || "N/A"}`);

    return NextResponse.json({
      success: true,
      referenceCode,
      name,
      email,
      kitType,
      purpose,
      city: city || null,
      notes: notes || null,
      message: "Your Himalayan salt slab allocation has been registered successfully.",
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[INQUIRY_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Unable to process reservation inquiry. Please try again." },
      { status: 500 }
    );
  }
}
