import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest) {
  return NextResponse.json({ success: true, message: 'edit endpoint stub' })
}
