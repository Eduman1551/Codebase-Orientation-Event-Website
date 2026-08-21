import { NextResponse } from "next/server";
import supabase from "@/lib/supabase.js";

export async function GET() {
  const { data, error } = await supabase.from("clues").select("*").limit(3);
  return NextResponse.json({ data, error, columns: data && data[0] ? Object.keys(data[0]) : [] });
}
