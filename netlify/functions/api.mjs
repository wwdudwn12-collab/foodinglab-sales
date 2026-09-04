// Netlify Functions(v2) 버전 — functions/api.js(Cloudflare)와 동일 역할.
// 프론트는 "/api"에 sendMail 하나만 POST 하므로 호스팅만 바꾸면 그대로 동작한다.
// 환경변수: MAIL_PIN, MAIL_KEY (Netlify → Site configuration → Environment variables)
const MAIL_UPSTREAM = 'https://script.google.com/macros/s/AKfycbz0NAI5dn4isLX-R6VtlFbHTa4reyYWdikv17WGEUXywhADfhyTE-ChmtZg_mM5jTLp/exec';

export const config = { path: '/api' };

export default async (req) => {
  if (req.method !== 'POST') return json(JSON.stringify({ error: '지원하지 않는 요청' }));
  let b = null;
  try { b = JSON.parse(await req.text()); } catch (e) {}
  if (!b || b.action !== 'sendMail') return json(JSON.stringify({ error: '지원하지 않는 요청' }));
  const PIN = process.env.MAIL_PIN, KEY = process.env.MAIL_KEY;
  if (PIN && String(b.pin || '') !== String(PIN)) return json(JSON.stringify({ error: 'PIN 불일치' }));
  if (!KEY) return json(JSON.stringify({ error: 'MAIL_KEY 미설정 — 환경변수 확인' }));
  b.key = KEY;
  const rm = await fetch(MAIL_UPSTREAM, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(b) });
  return json(await rm.text());
};

function json(text) {
  return new Response(text, { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
