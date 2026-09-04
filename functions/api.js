// Cloudflare Pages Function — 메일 발송 프록시
// 이 앱의 데이터는 브라우저 localStorage에만 있고, 서버로 나가는 건 메일 발송(sendMail) 하나뿐이다.
// PIN 은 여기(엣지)에서 확인하고, Apps Script 통과용 비밀키는 브라우저에 내려주지 않고 여기서 붙인다.
// 환경변수: MAIL_PIN, MAIL_KEY (Pages → Settings → Environment variables)
const MAIL_UPSTREAM = 'https://script.google.com/macros/s/AKfycbz0NAI5dn4isLX-R6VtlFbHTa4reyYWdikv17WGEUXywhADfhyTE-ChmtZg_mM5jTLp/exec';

export async function onRequestPost({ request, env }) {
  let b = null;
  try { b = JSON.parse(await request.text()); } catch (e) {}
  if (!b || b.action !== 'sendMail') return json(JSON.stringify({ error: '지원하지 않는 요청' }));
  if (env.MAIL_PIN && String(b.pin || '') !== String(env.MAIL_PIN))
    return json(JSON.stringify({ error: 'PIN 불일치' }));
  if (!env.MAIL_KEY)
    return json(JSON.stringify({ error: 'MAIL_KEY 미설정 — Pages 환경변수 확인' }));
  b.key = env.MAIL_KEY;
  const rm = await fetch(MAIL_UPSTREAM, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(b)
  });
  return json(await rm.text());
}

function json(text) {
  return new Response(text, {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}
