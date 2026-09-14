import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Server storage directory for shared rosters
const SHARED_DIR = path.join(process.cwd(), "src", "data", "shared_rosters");

function ensureDirectoryExists() {
  if (!fs.existsSync(SHARED_DIR)) {
    fs.mkdirSync(SHARED_DIR, { recursive: true });
  }
}

function generateCleanCode(prefix: string = "BCR"): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

export async function POST(req: NextRequest) {
  try {
    ensureDirectoryExists();
    const body = await req.json();
    const { item, type = "roster" } = body;

    if (!item || !item.name) {
      return NextResponse.json(
        { success: false, error: "Invalid roster or preset data" },
        { status: 400 }
      );
    }

    const prefix = type === "preset" ? "BCP" : "BCR";
    let code = generateCleanCode(prefix);
    let filePath = path.join(SHARED_DIR, `${code}.json`);

    // Ensure code is unique on disk
    let attempts = 0;
    while (fs.existsSync(filePath) && attempts < 5) {
      code = generateCleanCode(prefix);
      filePath = path.join(SHARED_DIR, `${code}.json`);
      attempts++;
    }

    const payloadToSave = {
      code,
      type,
      name: item.name,
      createdAt: new Date().toISOString(),
      item,
    };

    fs.writeFileSync(filePath, JSON.stringify(payloadToSave, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      code,
      type,
      name: item.name,
      savedAt: payloadToSave.createdAt,
    });
  } catch (error: any) {
    console.error("Error saving shared item:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save to server" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    ensureDirectoryExists();
    const { searchParams } = new URL(req.url);
    const rawCode = searchParams.get("code");

    if (!rawCode) {
      return NextResponse.json(
        { success: false, error: "Share code is required" },
        { status: 400 }
      );
    }

    // Normalize code: uppercase, trim
    let cleanCode = rawCode.trim().toUpperCase();
    let filePath = path.join(SHARED_DIR, `${cleanCode}.json`);

    // If not found and user didn't type prefix, try with prefix
    if (!fs.existsSync(filePath)) {
      if (!cleanCode.startsWith("BCR-") && !cleanCode.startsWith("BCP-")) {
        const tryRoster = path.join(SHARED_DIR, `BCR-${cleanCode}.json`);
        const tryPreset = path.join(SHARED_DIR, `BCP-${cleanCode}.json`);
        if (fs.existsSync(tryRoster)) {
          filePath = tryRoster;
          cleanCode = `BCR-${cleanCode}`;
        } else if (fs.existsSync(tryPreset)) {
          filePath = tryPreset;
          cleanCode = `BCP-${cleanCode}`;
        }
      }
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: `Share code "${rawCode}" not found on server.` },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(fileContent);

    return NextResponse.json({
      success: true,
      code: parsed.code || cleanCode,
      type: parsed.type || "roster",
      name: parsed.name,
      createdAt: parsed.createdAt,
      item: parsed.item || parsed.data,
    });
  } catch (error: any) {
    console.error("Error fetching shared item:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch from server" },
      { status: 500 }
    );
  }
}
