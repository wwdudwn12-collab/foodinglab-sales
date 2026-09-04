/**
 * 푸딩랩 상담 리드 API — Cloudflare Pages Functions
 *
 *   POST /api/lead   홈페이지 상담폼 → KV 저장 (공개)
 *   GET  /api/lead   리드 목록 조회 (관리앱용 · ADMIN_KEY 필요)
 *
 * KV 바인딩: FL_LEADS   키: lead:<ISO시각>:<랜덤>
 * 환경변수 : ADMIN_KEY  (Pages 대시보드 → Settings → Environment variables)
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,X-Admin-Key",
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json;charset=utf-8", ...CORS },
  });

export const onRequestOptions = () => new Response(null, { headers: CORS });

/* ── 접수 ────────────────────────────────────────────────── */
export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "본문이 JSON이 아닙니다" }, 400);
  }

  // 봇 차단 — 사람 눈에 안 보이는 필드가 채워져 있으면 조용히 성공 처리
  if (body.website) return json({ ok: true });

  const trim = (v, max) => String(v == null ? "" : v).trim().slice(0, max);
  const lead = {
    company: trim(body.company, 80),
    name: trim(body.name, 40),
    phone: trim(body.phone, 30),
    email: trim(body.email, 120),
    item: trim(body.item, 120),
    form: trim(body.form, 40),      // 제형
    moq: Math.max(0, Math.min(1000000, Number(body.moq) || 0)),
    stage: trim(body.stage, 40) || "브랜드 준비중",
    memo: trim(body.memo, 1000),
    agree: body.agree === true,
    source: trim(body.source, 40) || "홈페이지 폼",
    at: new Date().toISOString(),
    ua: trim(request.headers.get("user-agent"), 200),
    ip: request.headers.get("cf-connecting-ip") || "",
  };

  if (!lead.name || !lead.phone) {
    return json({ ok: false, error: "이름과 연락처는 필수입니다" }, 400);
  }
  if (!lead.agree) {
    return json({ ok: false, error: "개인정보 수집·이용 동의가 필요합니다" }, 400);
  }

  if (!env.FL_LEADS) return json({ ok: false, error: "KV 미연결" }, 500);

  const key = `lead:${lead.at}:${crypto.randomUUID().slice(0, 8)}`;
  await env.FL_LEADS.put(key, JSON.stringify(lead));

  return json({ ok: true, id: key });
}

/* ── 조회 (관리앱) ───────────────────────────────────────── */
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const key =
    request.headers.get("X-Admin-Key") || url.searchParams.get("key") || "";

  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
    return json({ ok: false, error: "권한 없음" }, 401);
  }
  if (!env.FL_LEADS) return json({ ok: false, error: "KV 미연결" }, 500);

  const limit = Math.min(500, Number(url.searchParams.get("limit")) || 100);
  const list = await env.FL_LEADS.list({ prefix: "lead:", limit });

  const leads = await Promise.all(
    list.keys.map(async (k) => {
      const v = await env.FL_LEADS.get(k.name);
      const o = v ? JSON.parse(v) : {};
      delete o.ip;                        // 관리앱에는 IP 안 내려줌
      delete o.ua;
      return { id: k.name, ...o };
    })
  );

  // 최신순
  leads.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  return json({ ok: true, count: leads.length, leads });
}
