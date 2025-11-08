import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const update = await request.json();

    // Extract chat id and text safely
    const chatId = update.message?.chat?.id;
    const text = update.message?.text;

    // Basic null checks
    if (!chatId || !text) {
      return NextResponse.json({ ok: false, error: "Invalid update payload" }, { status: 400 });
    }

    // Only handle /start command for now
    if (text === "/start") {
      const telegramToken = process.env.TELEGRAM_BOT_TOKEN!;
      const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

      // Send welcome message
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "Welcome to DarkVault! Please enter your email to begin registration."
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Telegram API error:", errorText);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in Telegram webhook POST:", error);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}
