import { readFile } from 'node:fs/promises';

const assessmentPath = new URL('../data/assessment.json', import.meta.url);
const assessment = JSON.parse(await readFile(assessmentPath, 'utf8'));
const sender = process.env.RESEND_FROM?.trim() || 'Russia-NATO Monitor <onboarding@resend.dev>';
let recipients = (process.env.NOTIFICATION_RECIPIENTS ?? '')
  .split(/[;,\s]+/)
  .map((value) => value.trim())
  .filter(Boolean);

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not configured.');
}
if (process.env.RECIPIENTS_ENDPOINT && process.env.NOTIFICATION_WEBHOOK_SECRET) {
  const response = await fetch(process.env.RECIPIENTS_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.NOTIFICATION_WEBHOOK_SECRET}` }
  });
  if (!response.ok) throw new Error(`Recipient lookup failed: ${response.status} ${await response.text()}`);
  const payload = await response.json();
  recipients = Array.isArray(payload.recipients) ? payload.recipients : [];
}

if (!recipients.length) {
  throw new Error('NOTIFICATION_RECIPIENTS is not configured.');
}

const subject = `Россия—НАТО: уровень ${assessment.level} из 7 (${assessment.score}/7)`;
const text = [
  `Дата оценки: ${assessment.asOf}`,
  `Статус: уровень ${assessment.level} из 7 — ${assessment.label}.`,
  `Оценка: ${assessment.score}/7, ${assessment.color}.`,
  `Последний подтверждённый факт: ${assessment.lastFact}.`,
  '',
  assessment.notificationSummary,
  '',
  'Откройте дашборд: https://russia-nato-escalation-monitor.ponomarev-ao.chatgpt.site/'
].join('\n');

const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    'Content-Type': 'application/json',
    'Idempotency-Key': `russia-nato-${assessment.notificationKey}`
  },
  body: JSON.stringify({
    from: sender,
    to: recipients,
    ...(process.env.RESEND_REPLY_TO ? { reply_to: process.env.RESEND_REPLY_TO } : {}),
    subject,
    text
  })
});

if (!response.ok) {
  throw new Error(`Resend rejected the message: ${response.status} ${await response.text()}`);
}

console.log(`Notification accepted for ${recipients.length} recipient(s).`);
