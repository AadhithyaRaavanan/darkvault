import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateOTP, hashOTP } from "@/lib/otp";
import { sendEmailOTP } from "@/lib/email";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export async function POST(request: Request) {
  try {
    const { telegram_id, email } = await request.json();

    if (!telegram_id || !email) {
      return NextResponse.json({ error: "telegram_id and email required" }, { status: 400 });
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 45 * 1000).toISOString();

    console.log("Generating OTP:", otp);
    console.log("Expires at (UTC):", expiresAt);

    // Remove any existing OTP for this telegram_id before inserting new one
    const { error: deleteError } = await supabase.from("otps").delete().eq("telegram_id", telegram_id);
    if (deleteError) {
      console.error("Error deleting existing OTP:", deleteError);
      // Not failing here, just logging
    }

    // Insert the new OTP record with .select() to get inserted data
    const { data: insertData, error: insertError } = await supabase
      .from("otps")
      .insert({
        telegram_id,
        otp: otpHash,
        expires_at: expiresAt,
      })
      .select();

    if (insertError) {
      console.error("Error inserting OTP:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log("OTP record inserted:", insertData);

    // Send OTP to user's email
    try {
      await sendEmailOTP(email, otp);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 });
    }

    return NextResponse.json({ message: "Email OTP sent. Please enter OTP." });
  } catch (err) {
    console.error("Unexpected error in request-email-otp:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
