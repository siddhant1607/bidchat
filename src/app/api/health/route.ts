import { NextResponse } from 'next/server';

export async function GET() {
  // This endpoint deliberately does NOT query the database.
  // It only exists to keep the Node.js / Socket.io server awake on Render
  // without waking up the Neon PostgreSQL database.
  return NextResponse.json({ status: 'alive', time: new Date().toISOString() });
}
