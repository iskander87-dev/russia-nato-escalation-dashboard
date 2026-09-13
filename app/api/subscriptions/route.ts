import { env } from 'cloudflare:workers';

type RuntimeEnv = { DB: D1Database };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!emailPattern.test(email) || email.length > 254) return json({ error: 'Введите корректный электронный адрес.' }, 400);

  const token = crypto.randomUUID();
  const db = (env as RuntimeEnv).DB;
  await db.prepare('INSERT INTO subscriptions (email, manage_token) VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET manage_token = excluded.manage_token')
    .bind(email, token).run();
  return json({ token });
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null) as { token?: unknown } | null;
  const token = typeof body?.token === 'string' ? body.token : '';
  if (!token) return json({ error: 'Требуется токен управления подпиской.' }, 400);
  const db = (env as RuntimeEnv).DB;
  await db.prepare('DELETE FROM subscriptions WHERE manage_token = ?').bind(token).run();
  return new Response(null, { status: 204 });
}
