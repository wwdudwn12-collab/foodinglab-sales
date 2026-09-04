// Netlify Functions(v2) 버전 — functions/api.js(Cloudflare)와 동일 역할.
// 프론트는 "/api"만 호출하므로 호스팅만 바꾸면 그대로 동작한다.
// 환경변수: MAIL_PIN, MAIL_KEY (Netlify → Site configuration → Environment variables)
// ponytail: 엣지 캐시는 생략. 조회가 2~3초로 느껴지면 Netlify Blobs 캐시 추가.
const UPSTREAM = 'https://script.google.com/macros/s/AKfycbzuFDStTRAwd56fEcHoTHisPtSNTk979aMRjFDEvZf4La08k7bMBqL7738KaG_Ak2lk/exec';
const MAIL_UPSTREAM = 'https://script.google.com/macros/s/AKfycbz0NAI5dn4isLX-R6VtlFbHTa4reyYWdikv17WGEUXywhADfhyTE-ChmtZg_mM5jTLp/exec';

export const config = { path: '/api' };

export default async (req) => {
  const src = new URL(req.url);
  if (req.method === 'GET') {
    const r = await fetch(UPSTREAM + '?' + src.searchParams.toString());
    return json(await r.text());
  }
  const body = await req.text();
  let b = null;
  try { b = JSON.parse(body); } catch (e) {}
  if (b && b.action === 'sendMail') {
    const PIN = process.env.MAIL_PIN, KEY = process.env.MAIL_KEY;
    if (PIN && String(b.pin || '') !== String(PIN)) return json(JSON.stringify({ error: 'PIN 불일치' }));
    if (!KEY) return json(JSON.stringify({ error: 'MAIL_KEY 미설정 — 환경변수 확인' }));
    b.key = KEY;
    const rm = await fetch(MAIL_UPSTREAM, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(b) });
    return json(await rm.text());
  }
  const r = await fetch(UPSTREAM, { method: 'POST', body });
  return json(await r.text());
};

function json(text) {
  return new Response(text, { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
