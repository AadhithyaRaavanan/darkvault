import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

function validatePassword(password: string): boolean {
  // Example: at least 8 chars, one uppercase, one number, one special char
  const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return re.test(password);
}

export async function POST(request: Request) {
  const { telegram_id, email, password } = await request.json();

  if (!telegram_id || !email || !password) {
    return NextResponse.json({ error: "telegram_id, email and password required" }, { status: 400 });
  }

  if (!validatePassword(password)) {
    return NextResponse.json({
      error: "Password must be at least 8 characters, include uppercase letter, number, and special character.",
    }, { status: 400 });
  }

  // Check if user already exists with same email or telegram_id
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .or(`email.eq.${email},telegram_id.eq.${telegram_id}`)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") { // PGRST116 = no rows found (okay)
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (existingUser) {
    return NextResponse.json({ error: "User already registered with this email or Telegram ID." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { error: insertError } = await supabase.from("users").insert({
    telegram_id,
    email,
    password: hashedPassword,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "User registered successfully." });
}
