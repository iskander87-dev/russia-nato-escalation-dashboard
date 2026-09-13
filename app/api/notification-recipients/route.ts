import { env } from 'cloudflare:workers';

type RuntimeEnv = { DB: D1Database; NOTIFICATION_WEBHOOK_SECRET?: string };

export async function POST(request: Request) {
  const runtime = env as RuntimeEnv;
  const expected = runtime.NOTIFICATION_WEBHOOK_SECRET;
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!expected || !supplied || supplied !== expected) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const result = await runtime.DB.prepare('SELECT email FROM subscriptions ORDER BY created_at ASC').all<{ email: string }>();
  return Response.json({ recipients: result.results.map(row => row.email) }, { headers: { 'Cache-Control': 'no-store' } });
}
