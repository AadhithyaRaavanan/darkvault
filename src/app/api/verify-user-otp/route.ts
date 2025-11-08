import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyOTP } from "@/lib/otp";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  try {
    const { telegram_id, otp } = await request.json();

    if (!telegram_id || !otp) {
      return NextResponse.json(
        { error: "telegram_id and otp required" },
        { status: 400 }
      );
    }

    // Query OTP record filtering only by telegram_id (no email)
    const { data, error } = await supabase
      .from("otps")
      .select("*")
      .eq("telegram_id", telegram_id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "OTP not found or expired" }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    console.log("Current time (UTC):", now.toISOString());
    console.log("OTP expiry time (UTC):", expiresAt.toISOString());

    if (now > expiresAt) {
      await supabase.from("otps").delete().eq("telegram_id", telegram_id);
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    const isValid = await verifyOTP(otp, data.otp);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Delete OTP record after successful verification
    await supabase.from("otps").delete().eq("telegram_id", telegram_id);

    return NextResponse.json({
      message: "OTP verified. Proceed to email/password setup.",
    });
  } catch (err) {
    console.error("Error in verify-user-otp:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
