import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), ".next", "progress-store.json");

export async function POST() {
  try {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify({}, null, 2), "utf-8");
    return NextResponse.json({ success: true, message: "Progress store reset to empty." });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

