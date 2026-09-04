// Cloudflare Pages Function — Apps Script 캐시 프록시
// 문제: Apps Script 웹앱은 왕복이 2~3초. 조회가 대부분인데 매번 그 비용을 냄.
// 해결: 조회(GET) 결과를 엣지에 짧게 캐시 → 두 번째부터 0.1초. 저장(POST)은 그대로 통과.
// 캐시키에 세션(st)이 포함되므로 사용자끼리 데이터가 섞이지 않는다.
const UPSTREAM = 'https://script.google.com/macros/s/AKfycbzuFDStTRAwd56fEcHoTHisPtSNTk979aMRjFDEvZf4La08k7bMBqL7738KaG_Ak2lk/exec';
// 메일 전용 백엔드(독립 Apps Script). 영업 백엔드는 구글 로그인이 있어야 통과해서 여기선 못 쓴다.
const MAIL_UPSTREAM = 'https://script.google.com/macros/s/AKfycbz0NAI5dn4isLX-R6VtlFbHTa4reyYWdikv17WGEUXywhADfhyTE-ChmtZg_mM5jTLp/exec';
const TTL = 8;                      // 초. 타인이 바꾼 값은 최대 이만큼 늦게 보임
const NO_CACHE = ['me'];            // 인증확인은 캐시하지 않음

export async function onRequest({ request, env }) {
  const src = new URL(request.url);
  const target = UPSTREAM + '?' + src.searchParams.toString();

  // 저장·삭제 등 쓰기는 캐시하지 않고 그대로 전달
  if (request.method !== 'GET') {
    const body = await request.text();
    // 메일 발송만 예외: 이 앱은 구글 로그인이 없어서 Apps Script 인증을 통과하지 못한다.
    // PIN 은 여기(엣지)에서 확인하고, 백엔드 통과용 비밀키는 브라우저에 내려주지 않고 여기서 붙인다.
    let b = null;
    try { b = JSON.parse(body); } catch (e) {}
    if (b && b.action === 'sendMail') {
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
    const r = await fetch(UPSTREAM, { method: 'POST', body });
    return json(await r.text());
  }

  const action = src.searchParams.get('action') || '';
  if (NO_CACHE.includes(action)) return json(await (await fetch(target)).text());

  const cache = caches.default;
  const key = new Request('https://cache.local/' + src.searchParams.toString(), { method: 'GET' });

  const hit = await cache.match(key);
  if (hit) {
    // 엣지 TTL이 정확히 안 듣는 경우가 있어 나이를 직접 확인한다
    const age = Number(hit.headers.get('age') || 0);
    if (age <= TTL) {
      const h = new Response(hit.body, hit);
      h.headers.set('x-proxy-cache', 'HIT');
      return h;
    }
  }

  const text = await (await fetch(target)).text();
  const res = json(text, TTL);
  res.headers.set('x-proxy-cache', 'MISS');
  await cache.put(key, res.clone());
  return res;
}

function json(text, ttl) {
  return new Response(text, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': ttl ? ('public, max-age=' + ttl) : 'no-store'
    }
  });
}
