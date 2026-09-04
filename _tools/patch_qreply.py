# -*- coding: utf-8 -*-
"""메일에 견적 확인·수락 버튼 넣기 + 응답 회수"""
import io, os

P = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fl_app.js')
s = io.open(P, encoding='utf-8').read()

BLOCK = r'''/* ══ 견적 확인·수락 링크 ═══════════════════════════════════
   메일 안에서는 자바스크립트가 안 돈다. 그래서 버튼을 링크로 만들고,
   그 링크가 여는 페이지(foodinglab.pages.dev/q.html)에서 클릭을 기록한다.
   열람 시각 / 수락·보류 / 남긴 말까지 남는다. */
function quoteSite(){
  return (leadCfg().url || "").replace(/\/api\/lead.*$/, "") || "https://foodinglab.pages.dev";
}
async function shareQuote(q){
  var c = leadCfg();
  if (!c.key) throw new Error("설정·팀 화면에서 관리키를 먼저 넣어주세요");
  var r = calcQuote(q);
  var res = await fetch(quoteSite() + "/api/quote", {
    method: "POST",
    headers: {"Content-Type": "application/json", "X-Admin-Key": c.key},
    body: JSON.stringify({
      quoteId: q.id, client: q.client, item: q.item,
      order: n(q.order), unit: n(q.unit),
      final: r.final, amount: r.amount, perUnit: r.perUnit,
      tiers: r.tiers.map(function(t){ return {qty:t.qty, price:t.price}; }),
      note: q.note, validUntil: q.validUntil || ""
    })
  });
  var j = await res.json();
  if (!j.ok) throw new Error(j.error || "링크 생성 실패");
  q.shareToken = j.token;
  save();
  return quoteSite() + "/q.html?t=" + j.token;
}

/* 메일 본문 맨 아래 붙는 버튼 (HTML 메일용) */
function replyButtons(link){
  return '<div style="margin:26px 0 8px;text-align:center">'
    + '<a href="' + link + '" style="display:inline-block;padding:14px 26px;border-radius:999px;'
    + 'background:#1A7452;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;'
    + 'font-family:Malgun Gothic,sans-serif">견적 확인하고 회신하기</a>'
    + '<div style="margin-top:10px;font-size:12px;color:#78847E;'
    + 'font-family:Malgun Gothic,sans-serif">버튼이 안 눌리면 아래 주소를 복사해 열어주세요<br>'
    + '<span style="color:#42504A">' + link + '</span></div></div>';
}

/* 응답 회수 — 견적 목록의 상태를 갱신 */
window.pullQuoteReplies = async function(){
  var c = leadCfg();
  if (!c.key) { toast("설정·팀 화면에서 관리키를 먼저 넣어주세요"); go("set"); return; }
  var btn = $("qr-btn");
  if (btn) { btn.disabled = true; btn.textContent = "확인 중…"; }
  try {
    var res = await fetch(quoteSite() + "/api/quote?list=1", {headers:{"X-Admin-Key": c.key}});
    var j = await res.json();
    if (!j.ok) throw new Error(j.error || "조회 실패");

    var byTok = {};
    j.quotes.forEach(function(x){ byTok[x.token] = x; });
    var n2 = 0;
    S.quotes.forEach(function(q){
      var x = q.shareToken && byTok[q.shareToken];
      if (!x) return;
      q.reply = {status:x.status, viewedAt:x.viewedAt, repliedAt:x.repliedAt,
                 name:x.replyName, memo:x.replyMemo};
      n2++;
    });
    save();
    toast(n2 ? n2 + "건 상태를 가져왔습니다" : "공유한 견적이 없습니다");
    go("quote");
  } catch(e){
    toast(e.message);
    if (btn) { btn.disabled = false; btn.textContent = "고객 회신 확인"; }
  }
};

function replyPill(q){
  var r = q.reply;
  if (!q.shareToken) return '<span class="pill pill-gray">미공유</span>';
  if (!r) return '<span class="pill pill-blue">발송</span>';
  if (r.status === "accepted") return '<span class="pill pill-green">수락 ✓</span>';
  if (r.status === "hold")     return '<span class="pill pill-gold">보류·문의</span>';
  if (r.status === "viewed")   return '<span class="pill pill-amber">열람</span>';
  return '<span class="pill pill-blue">발송</span>';
}

'''
anchor = "/* ══ 견적서 출력 ═══════════════════════════════════════════ */"
assert anchor in s, 'anchor'
s = s.replace(anchor, BLOCK + anchor, 1)

# 메일 열 때 확인 링크 자동 생성해서 본문·HTML에 넣기
a = """function openMail(q, att){"""
b = """async function openMail(q, att){"""
assert a in s, 'openMail sig'
s = s.replace(a, b)

a2 = """  MAIL_ATTACH = att ? [att] : [];

  var r = calcQuote(q);"""
b2 = """  MAIL_ATTACH = att ? [att] : [];

  /* 확인·수락 링크 — 실패해도 메일은 보낼 수 있게 한다 */
  MAIL_LINK = "";
  try { MAIL_LINK = await shareQuote(q); }
  catch(e){ toast("확인 링크 없이 진행합니다 — " + e.message); }

  var r = calcQuote(q);"""
assert a2 in s, 'openMail body'
s = s.replace(a2, b2)

a3 = """    + (r.tiers.length
        ? "· 수량 구간: " + r.tiers.map(function(t){
            return fmt(t.qty) + "set " + fmt(t.price) + "원"; }).join(" / ") + "\\n"
        : "");"""
b3 = """    + (r.tiers.length
        ? "· 수량 구간: " + r.tiers.map(function(t){
            return fmt(t.qty) + "set " + fmt(t.price) + "원"; }).join(" / ") + "\\n"
        : "")
    + (MAIL_LINK ? "\\n[견적 확인·회신]\\n" + MAIL_LINK + "\\n" : "");"""
assert a3 in s, 'detail'
s = s.replace(a3, b3)

# 메일 모달 안내에 링크 표시
a4 = """    + '<div class="field"><label>첨부</label><div id="mail-att"></div>'"""
b4 = """    + (MAIL_LINK
        ? '<div class="notice" style="margin:4px 0 14px"><b>확인·수락 버튼이 함께 나갑니다.</b><br>'
          + '<span class="sub2">고객이 링크를 열면 <b>열람</b>, 버튼을 누르면 <b>수락</b> 또는 '
          + '<b>보류</b>로 기록됩니다 · <span class="num" style="font-size:11.5px">'
          + esc(MAIL_LINK) + '</span></span></div>'
        : "")
    + '<div class="field"><label>첨부</label><div id="mail-att"></div>'"""
assert a4 in s, 'notice'
s = s.replace(a4, b4)

# 발송 시 HTML 본문에 버튼 삽입
a5 = """  var html = '<div style="font-family:Malgun Gothic,sans-serif;font-size:14px;line-height:1.7;'
           + 'color:#222;white-space:pre-wrap;">' + esc(body) + '</div>';"""
b5 = """  var html = '<div style="font-family:Malgun Gothic,sans-serif;font-size:14px;line-height:1.7;'
           + 'color:#222;white-space:pre-wrap;">' + esc(body) + '</div>'
           + (MAIL_LINK ? replyButtons(MAIL_LINK) : "");"""
assert a5 in s, 'html body'
s = s.replace(a5, b5)

s = s.replace("var MAIL_ATTACH = [];", "var MAIL_ATTACH = [];\nvar MAIL_LINK = \"\";   // 이번 메일에 넣을 확인·수락 링크")

# quoteMail 이 openMail 을 await 하도록
s = s.replace("  openMail(QDOC, att);\n  if (att) toast",
              "  await openMail(QDOC, att);\n  if (att) toast")

# 견적 목록에 회신 상태 열 + 확인 버튼
a6 = """    + cardH("발행 견적", '<button class="btn btn-brand btn-sm" onclick="editQuote()">+ 새 견적</button>')
    + tbl(["번호|c","일자|c","브랜드","품목","발주수량|r","제조원가|r","공급단가|r","총 금액|r","|r"],"""
b6 = """    + cardH("발행 견적",
        '<button class="btn btn-ghost btn-sm" id="qr-btn" onclick="pullQuoteReplies()">고객 회신 확인</button> '
      + '<button class="btn btn-brand btn-sm" onclick="editQuote()">+ 새 견적</button>')
    + tbl(["번호|c","일자|c","브랜드","품목","발주수량|r","공급단가|r","총 금액|r","회신|c","|r"],"""
assert a6 in s, 'quote head'
s = s.replace(a6, b6)

a7 = """            '<span class="num">' + fmt(q.order) + '</span>',
            '<span class="num">' + fmt(r.cost) + '</span>',
            '<b class="num">' + fmt(r.final) + '</b>',
            '<span class="num">' + fmt(r.amount) + '</span>',"""
b7 = """            '<span class="num">' + fmt(q.order) + '</span>',
            '<b class="num">' + fmt(r.final) + '</b>',
            '<span class="num">' + fmt(r.amount) + '</span>',
            replyPill(q)
            + (q.reply && q.reply.name
                ? '<br><span style="font-size:11.5px;color:var(--hint)">' + esc(q.reply.name) + '</span>'
                : ""),"""
assert a7 in s, 'quote row'
s = s.replace(a7, b7)

io.open(P, 'w', encoding='utf-8').write(s)
print('앱: 견적 확인·수락 링크 연동')
