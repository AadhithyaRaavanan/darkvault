import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Your code to handle POST request
  return NextResponse.json({ message: 'ok' });
}

export async function GET(req: NextRequest) {
  // Optional: handle GET requests
  return NextResponse.json({ message: 'ok' });
}
