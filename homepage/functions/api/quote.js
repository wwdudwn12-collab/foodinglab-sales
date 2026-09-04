/**
 * 견적 확인·수락 API — Cloudflare Pages Functions
 *
 *   POST /api/quote            견적 공유 등록 (관리앱 · ADMIN_KEY 필요) → token 발급
 *   GET  /api/quote?t=토큰      견적 내용 조회 (고객 확인 페이지에서 사용)
 *   PUT  /api/quote            고객 응답 기록 {t, action:'accept'|'hold', name, memo}
 *   GET  /api/quote?list=1     응답 현황 목록 (관리앱 · ADMIN_KEY 필요)
 *
 * 저장: KV FL_LEADS, 키 `quote:<token>`
 * 메일 안에서는 자바스크립트가 안 돌기 때문에, 버튼은 이 API 를 여는 링크로 만든다.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,X-Admin-Key",
};
const json = (d, s = 200) =>
  new Response(JSON.stringify(d), {
    status: s,
    headers: { "Content-Type": "application/json;charset=utf-8", ...CORS },
  });

export const onRequestOptions = () => new Response(null, { headers: CORS });

const isAdmin = (request, env) => {
  const url = new URL(request.url);
  const key = request.headers.get("X-Admin-Key") || url.searchParams.get("key") || "";
  return env.ADMIN_KEY && key === env.ADMIN_KEY;
};
const token = () =>
  (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "").slice(0, 24);

/* ── 등록 (관리앱) ────────────────────────────────────────── */
export async function onRequestPost({ request, env }) {
  if (!isAdmin(request, env)) return json({ ok: false, error: "권한 없음" }, 401);
  if (!env.FL_LEADS) return json({ ok: false, error: "KV 미연결" }, 500);

  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "JSON 아님" }, 400); }

  const t = b.token || token();
  const rec = {
    token: t,
    quoteId: String(b.quoteId || ""),
    client: String(b.client || ""),
    item: String(b.item || ""),
    order: Number(b.order) || 0,
    unit: Number(b.unit) || 0,
    final: Number(b.final) || 0,
    amount: Number(b.amount) || 0,
    perUnit: Number(b.perUnit) || 0,
    tiers: Array.isArray(b.tiers) ? b.tiers.slice(0, 8) : [],
    note: String(b.note || "").slice(0, 1500),
    validUntil: String(b.validUntil || ""),
    sentAt: new Date().toISOString(),
    status: "sent",          // sent → viewed → accepted | hold
    viewedAt: "", repliedAt: "", replyName: "", replyMemo: "",
  };
  await env.FL_LEADS.put("quote:" + t, JSON.stringify(rec));
  return json({ ok: true, token: t });
}

/* ── 조회 ─────────────────────────────────────────────────── */
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  if (!env.FL_LEADS) return json({ ok: false, error: "KV 미연결" }, 500);

  // 관리앱 — 응답 현황 목록
  if (url.searchParams.get("list")) {
    if (!isAdmin(request, env)) return json({ ok: false, error: "권한 없음" }, 401);
    const ls = await env.FL_LEADS.list({ prefix: "quote:", limit: 300 });
    const rows = await Promise.all(ls.keys.map(async (k) => {
      const v = await env.FL_LEADS.get(k.name);
      return v ? JSON.parse(v) : null;
    }));
    const quotes = rows.filter(Boolean)
      .sort((a, b) => String(b.sentAt).localeCompare(String(a.sentAt)));
    return json({ ok: true, count: quotes.length, quotes });
  }

  // 고객 확인 페이지 — 토큰으로 한 건
  const t = url.searchParams.get("t") || "";
  if (!t) return json({ ok: false, error: "토큰 없음" }, 400);

  const raw = await env.FL_LEADS.get("quote:" + t);
  if (!raw) return json({ ok: false, error: "만료되었거나 잘못된 링크입니다" }, 404);

  const rec = JSON.parse(raw);
  if (rec.status === "sent") {          // 처음 열람한 순간 기록
    rec.status = "viewed";
    rec.viewedAt = new Date().toISOString();
    await env.FL_LEADS.put("quote:" + t, JSON.stringify(rec));
  }
  return json({ ok: true, quote: rec });
}

/* ── 고객 응답 ────────────────────────────────────────────── */
export async function onRequestPut({ request, env }) {
  if (!env.FL_LEADS) return json({ ok: false, error: "KV 미연결" }, 500);

  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "JSON 아님" }, 400); }

  const t = String(b.t || "");
  const act = b.action === "accept" ? "accepted" : b.action === "hold" ? "hold" : "";
  if (!t || !act) return json({ ok: false, error: "요청이 올바르지 않습니다" }, 400);

  const raw = await env.FL_LEADS.get("quote:" + t);
  if (!raw) return json({ ok: false, error: "만료되었거나 잘못된 링크입니다" }, 404);

  const rec = JSON.parse(raw);
  rec.status = act;
  rec.repliedAt = new Date().toISOString();
  rec.replyName = String(b.name || "").slice(0, 40);
  rec.replyMemo = String(b.memo || "").slice(0, 1000);
  await env.FL_LEADS.put("quote:" + t, JSON.stringify(rec));

  return json({ ok: true, status: rec.status });
}
