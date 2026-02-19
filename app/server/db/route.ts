import { conn } from "@/lib/orario/db/connection";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await conn.query("SELECT 1")
  return NextResponse.json({ result });
}
