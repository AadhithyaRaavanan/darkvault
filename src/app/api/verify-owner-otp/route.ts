import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyOTP } from "@/lib/otp";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  const { telegram_id, otp } = await request.json();

  if (!telegram_id || !otp) return NextResponse.json({ error: "telegram_id and otp required" }, { status: 400 });

  const { data, error } = await supabase
    .from("otps")
    .select("*")
    .eq("telegram_id", telegram_id)
    .single();

  if (error || !data) return NextResponse.json({ error: "OTP not found or expired" }, { status: 400 });

  const now = new Date();
  const expiresAt = new Date(data.expires_at);
  if (now > expiresAt) {
    await supabase.from("otps").delete().eq("telegram_id", telegram_id);
    return NextResponse.json({ error: "OTP expired" }, { status: 400 });
  }

  const isValid = await verifyOTP(otp, data.otp);
  if (!isValid) return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });

  // Valid OTP: delete OTP record
  await supabase.from("otps").delete().eq("telegram_id", telegram_id);

  // Proceed to next registration phase...

  return NextResponse.json({ message: "OTP verified. Proceed to email/password setup." });
}
