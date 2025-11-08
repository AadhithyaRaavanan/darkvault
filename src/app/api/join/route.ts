import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateOTP, hashOTP } from "@/lib/otp";
import { sendOwnerOTPEmail } from "@/lib/email";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  const { telegram_id } = await request.json();

  if (!telegram_id) return NextResponse.json({ error: "telegram_id required" }, { status: 400 });

  // Generate OTP
  const otp = generateOTP();
  const otpHash = await hashOTP(otp);

  // Store OTP with 45 seconds expiry
  const expiresAt = new Date(Date.now() + 45 * 1000).toISOString();

  // Upsert OTP for telegram_id (delete existing first)
  await supabase.from("otps").delete().eq("telegram_id", telegram_id);

  const { error } = await supabase.from("otps").insert({
    telegram_id,
    otp: otpHash,
    expires_at: expiresAt,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send OTP email to owner
  try {
    await sendOwnerOTPEmail(otp, telegram_id);
  } catch (emailError) {
    return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 });
  }

  return NextResponse.json({ message: "Owner OTP sent. Please enter OTP." });
}
