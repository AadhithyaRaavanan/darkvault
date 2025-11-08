import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const update = await request.json();
  const chatId = update.message?.chat?.id;
  const text = update.message?.text;

  if (chatId && text) {
    if (text === "/start") {
      const telegramToken = process.env.TELEGRAM_BOT_TOKEN!;
      const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "Welcome to DarkVault! Please enter your email to begin registration.",
        }),
      });
    }
  }

  return NextResponse.json({ ok: true });
}
