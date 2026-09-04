# -*- coding: utf-8 -*-
"""견적서 문서를 영업웹앱 .qd2 규격으로 맞춤 — CSS 원본 그대로, 색만 푸딩랩"""
import io, os, re

D = os.path.dirname(os.path.abspath(__file__))

# ── 1) fl_body.html : #qv 스타일 → .qd2 원본 CSS (색만 교체) ──
P = os.path.join(D, 'fl_body.html')
s = io.open(P, encoding='utf-8').read()

start = s.index('#qv{background:#fff;color:#13201B;font-size:11.5px}')
end   = s.index('@media print{')
QD2 = '''/* ══ 견적서 문서 — 영업웹앱 .qd2 CSS 그대로, --sg 만 푸딩랩 그린 ══ */
@font-face{font-family:"SUIT Variable";src:url("quote-assets/fonts/SUIT-Variable.ttf") format("truetype-variations");
  font-weight:100 900;font-display:swap}
#qv{--sg:#1A7452;--g900:#191919;--g700:#3D3F3E;--g500:#6E706F;--g300:#C9CBCA;--g100:#F4F5F4;
  width:210mm;background:#fff;padding:18mm 16mm;color:#191919;margin:0 auto;
  font-family:"SUIT Variable",sans-serif;font-size:13px;line-height:1.55;letter-spacing:-0.02em;
  -webkit-font-smoothing:antialiased}
#qv .num{font-variant-numeric:tabular-nums}
#qv .head{margin-bottom:32px;text-align:center}
#qv h1.title{margin:0;font-size:37px;font-weight:800;letter-spacing:.30em;text-indent:.30em;line-height:1.15}
#qv .title-rule{height:2px;background:var(--sg);width:64px;margin:10px auto 0}
#qv .top{display:grid;grid-template-columns:1fr 1.72fr;gap:24px;margin-bottom:26px}
#qv .recv .date{display:flex;align-items:baseline;gap:6px;font-size:13px;padding-bottom:7px;
  border-bottom:1px solid var(--g900)}
#qv .recv .date .v{min-width:42px;text-align:center;font-weight:500}
#qv .recv .date .u{color:var(--g700)}
#qv .recv .to{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-top:24px;
  padding-bottom:7px;border-bottom:1px solid var(--g900)}
#qv .recv .to .name{font-size:15px;font-weight:700}
#qv .recv .to .suffix{font-size:13px;color:var(--g700);flex:none}
#qv .recv .lead{margin:16px 0 0;font-size:13px;color:var(--g700)}
#qv .sup{width:100%;border-collapse:collapse;border:1px solid var(--g900);table-layout:fixed}
#qv .sup td{border:1px solid var(--g300);padding:5px 8px;font-size:11.5px;line-height:1.5;
  vertical-align:middle;word-break:keep-all}
#qv .sup .side{background:var(--g100);font-weight:700;text-align:center;letter-spacing:0;
  line-height:2.1;padding:4px 2px}
#qv .sup .h{background:var(--g100);font-weight:700;text-align:center;letter-spacing:-0.03em;white-space:nowrap}
#qv .sup .seal-cell{position:relative;padding-right:46px;white-space:nowrap}
#qv .seal{position:absolute;right:5px;top:50%;transform:translateY(-50%);width:38px;height:38px;
  opacity:.92;background-size:contain;background-repeat:no-repeat;background-position:center}
#qv .spec{width:100%;border-collapse:collapse;border:1px solid var(--g900);table-layout:fixed;margin-bottom:12px}
#qv .spec td{border:1px solid var(--g300);padding:6px 9px;font-size:12px;height:27px;vertical-align:middle}
#qv .spec .h{background:var(--g100);font-weight:700;text-align:center;white-space:nowrap;letter-spacing:-0.02em}
#qv .total-band{width:100%;border-collapse:collapse;border:1px solid var(--g900);margin-bottom:20px}
#qv .total-band td{border:1px solid var(--g300);padding:10px 12px;vertical-align:middle}
#qv .total-band .lbl{width:118px;background:var(--g100);text-align:center;font-weight:700;font-size:13px}
#qv .total-band .lbl small{display:block;font-size:10.5px;font-weight:400;color:var(--g500);letter-spacing:-0.02em}
#qv .total-band .val{font-size:15px;font-weight:700;text-align:center}
#qv .total-band .val .won{color:var(--sg);margin-left:6px}
#qv .blk{margin-bottom:18px}
#qv .cap{font-size:11.5px;font-weight:700;color:var(--g500);margin:0 0 5px 3px}
#qv .items{width:100%;border-collapse:collapse;border:1px solid var(--g900);table-layout:fixed}
#qv .items th{background:var(--g100);border:1px solid var(--g300);padding:7px 4px;font-size:11.5px;
  font-weight:700;text-align:center;letter-spacing:.02em;line-height:1.35;color:#191919}
#qv .items th small{display:block;font-size:10px;font-weight:400;color:var(--g500);letter-spacing:-0.02em}
#qv .items td{border:1px solid var(--g300);padding:6px 8px;font-size:12px;height:27px;word-break:keep-all}
#qv .items td.c{text-align:center}
#qv .items td.r{text-align:right;white-space:nowrap}
#qv .items tbody tr.blank td{color:transparent}
#qv .items tr.sum td{border-top:2px solid var(--sg);background:var(--g100);font-weight:700;
  font-size:12.5px;padding:8px}
#qv .items tr.sum .label{text-align:center;letter-spacing:.08em}
#qv .items tr.on td{background:#EAF3EE;font-weight:700}
#qv .items tr.cost td{background:#EAF3EE;font-weight:700}
#qv .items tr.grand td{background:var(--g900);color:#fff;font-weight:800}
#qv .foot2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
#qv .note{border:1px solid var(--g300);padding:9px 12px}
#qv .note .t{font-size:11.5px;font-weight:700;color:var(--g500);margin:0 0 3px 5px}
#qv .note .b{font-size:12px;color:var(--g700);line-height:1.75;white-space:pre-line}
#qv .docfoot{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:24px}
#qv .docno{font-size:12.5px;color:var(--g700);white-space:nowrap}
#qv .docno .val{font-size:13px;color:var(--g900);margin-left:6px}
#qv .wmk{font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:700;
  letter-spacing:.16em;color:var(--sg)}
#qv .items tbody tr{page-break-inside:avoid;break-inside:avoid}
#qv .items thead{display:table-header-group}
#qv .top,#qv .spec,#qv .total-band,#qv .note,#qv .docfoot,#qv .blk{break-inside:avoid;page-break-inside:avoid}
'''
s = s[:start] + QD2 + s[end:]
# 인쇄 시 화면용 폭·여백 제거 (영업웹앱 #qdoc-modal .qd2 규칙과 같은 처리)
s = s.replace('  #qv{zoom:var(--fit,1)}',
              '  #qv{width:auto!important;padding:0!important;margin:0!important;zoom:var(--fit,1)}')
io.open(P, 'w', encoding='utf-8').write(s)
print('body: qd2 css 적용')

# ── 2) fl_app.js : quoteHTML 을 .qd2 마크업으로 재작성 ──
P2 = os.path.join(D, 'fl_app.js')
a = io.open(P2, encoding='utf-8').read()

start = a.index('function quoteHTML(q){')
end   = a.index('function qRow(k, v2, kind){')
NEW = r'''function quoteHTML(q){
  var r = calcQuote(q), d = q.date ? new Date(q.date) : new Date();
  var blank = function(cols, cnt){
    var out = "";
    for (var i = 0; i < cnt; i++) {
      out += '<tr class="blank">';
      for (var j = 0; j < cols; j++) out += "<td>&nbsp;</td>";
      out += "</tr>";
    }
    return out;
  };
  var cell = function(v, cls){ return '<td class="' + (cls || "") + '">' + v + '</td>'; };

  return ''
    /* ── 머리 ── */
    + '<div class="head"><h1 class="title">제조 견적서</h1><div class="title-rule"></div></div>'

    /* ── 상단 2단: 수신처 / 공급자 ── */
    + '<div class="top">'
      + '<div class="recv">'
        + '<div class="date"><span class="v num">' + d.getFullYear() + '</span><span class="u">년</span>'
        + '<span class="v num">' + pad(d.getMonth() + 1) + '</span><span class="u">월</span>'
        + '<span class="v num">' + pad(d.getDate()) + '</span><span class="u">일</span></div>'
        + '<div class="to"><span class="name">' + esc(q.client || "―") + '</span>'
        + '<span class="suffix">귀하</span></div>'
        + '<p class="lead">아래와 같이 견적 합니다.</p></div>'
      + '<table class="sup"><colgroup><col style="width:24px"><col style="width:86px"><col style="width:154px">'
        + '<col style="width:76px"><col style="width:92px"></colgroup>'
        + '<tr><td class="side" rowspan="6">공<br>급<br>자</td>'
          + '<td class="h">등록번호</td><td class="num" colspan="3">848-88-02640</td></tr>'
        + '<tr><td class="h">상호명</td><td>주식회사 서래바이오</td>'
          + '<td class="h">대표자명</td>'
          + '<td class="seal-cell">지종환<span class="seal" style="background-image:url(quote-assets/seal.png)"></span></td></tr>'
        + '<tr><td class="h">사업장주소</td><td colspan="3">경기도 화성시 정남면 신백길 102-14</td></tr>'
        + '<tr><td class="h">업 태</td><td colspan="3">제조업, 도매 및 소매업, 정보통신업, 전문·과학 및 기술 서비스업</td></tr>'
        + '<tr><td class="h">종 목</td><td colspan="3">건강보조용 액화식품, 전자상거래 소매업</td></tr>'
        + '<tr><td class="h">담당자</td><td colspan="3">박영주 팀장 / <span class="num">010-6850-3819</span></td></tr>'
      + '</table></div>'

    /* ── 제품 사양 ── */
    + '<table class="spec"><colgroup><col style="width:78px"><col><col style="width:78px"><col></colgroup>'
    + '<tr><td class="h">제 품 명</td><td>' + esc(q.item || "―") + '</td>'
      + '<td class="h">포장형태</td><td>' + esc(q.pack || "―") + '</td></tr>'
    + '<tr><td class="h">제품분류</td><td>' + esc(q.category || "―") + '</td>'
      + '<td class="h">내 용 량</td><td class="num">' + (q.content ? fmt(q.content) + " mg" : "―") + '</td></tr>'
    + '<tr><td class="h">제품제형</td><td>' + esc(q.form || "―") + '</td>'
      + '<td class="h">포장단위</td><td class="num">' + (q.unit ? fmt(q.unit) : "―") + '</td></tr>'
    + '<tr><td class="h">발주수량</td><td class="num">' + (q.order ? fmt(q.order) + " set" : "―") + '</td>'
      + '<td class="h">섭 취 량</td><td>' + esc(q.dose || "―") + '</td></tr></table>'

    /* ── 합계금액 띠 ── */
    + '<table class="total-band"><tr>'
      + '<td class="lbl">최종 견적가<small>1 set / VAT 별도</small></td>'
      + '<td class="val"><span class="kr">' + krNum(r.final) + '</span> 원정'
      + '<span class="won num">(₩ ' + fmt(r.final) + ')</span></td></tr></table>'

    /* ── 원재료비 ── */
    + '<div class="blk"><p class="cap">* 원재료비</p>'
    + '<table class="items"><colgroup><col><col style="width:62px"><col style="width:74px">'
      + '<col style="width:74px"><col style="width:70px"><col style="width:74px"><col style="width:58px"></colgroup>'
    + '<thead><tr><th>원 료 명</th><th>배합비<small>(%)</small></th><th>함 량<small>(mg/단위)</small></th>'
      + '<th>단 가<small>(원/Kg)</small></th><th>금 액<small>(원)</small></th>'
      + '<th>총 사용량<small>(g)</small></th><th>표시량<small>(mg)</small></th></tr></thead><tbody>'
    + r.mats.map(function(m){
        return '<tr>' + cell(esc(m.name)) + cell(fmt(m.ratio, 3), "r num") + cell(fmt(m.mg, 3), "r num")
          + cell(fmt(m.price), "r num") + cell(fmt(m.cost, 1), "r num") + cell(fmt(m.use), "r num")
          + cell(m.label ? fmt(m.label) : "", "r num") + '</tr>';
      }).join("")
    + blank(7, Math.max(0, 6 - r.mats.length))
    + '</tbody><tbody><tr class="sum"><td class="label">합 계</td>'
      + cell(fmt(r.tRatio, 3), "r num") + cell(fmt(r.tMg, 1), "r num") + '<td></td>'
      + cell(fmt(r.matCost), "r num") + cell(fmt(r.tUse), "r num") + '<td></td></tr></tbody></table></div>'

    /* ── 부자재비 ── */
    + '<div class="blk"><p class="cap">* 부자재비</p>'
    + '<table class="items"><colgroup><col><col style="width:92px"><col style="width:78px">'
      + '<col style="width:94px"><col style="width:88px"></colgroup>'
    + '<thead><tr><th>재 료 명</th><th>단 가<small>(원)</small></th><th>수 량</th>'
      + '<th>금 액<small>(원)</small></th><th>비 고</th></tr></thead><tbody>'
    + r.subs.map(function(s2){
        return '<tr>' + cell(esc(s2.name)) + cell(fmt(s2.price), "r num")
          + cell(fmt(s2.qty, s2.qty % 1 ? 2 : 0), "r num") + cell(fmt(s2.amt, 1), "r num")
          + cell(esc(s2.note || ""), "c") + '</tr>';
      }).join("")
    + '</tbody><tbody><tr class="sum"><td class="label" colspan="3">합 계</td>'
      + cell(fmt(r.subCost), "r num") + '<td></td></tr></tbody></table></div>'

    /* ── 가공비 ── */
    + '<div class="blk"><p class="cap">* 가공비 &nbsp;(전체 로트 기준 · 소계 ÷ 발주수량 = 1 set 가공비)</p>'
    + '<table class="items"><colgroup><col><col style="width:76px"><col style="width:72px">'
      + '<col style="width:76px"><col style="width:92px"><col style="width:76px"></colgroup>'
    + '<thead><tr><th>항 목 명</th><th>단위/규격</th><th>수 량</th><th>단 가<small>(원)</small></th>'
      + '<th>금 액<small>(원)</small></th><th>비 고</th></tr></thead><tbody>'
    + r.procs.map(function(p){
        return '<tr>' + cell(esc(p.name)) + cell(esc(p.spec || ""), "c")
          + cell(fmt(p.qty, p.qty % 1 ? 1 : 0), "r num") + cell(fmt(p.price), "r num")
          + cell(fmt(p.amt), "r num") + cell(esc(p.note || ""), "c") + '</tr>';
      }).join("")
    + '</tbody><tbody><tr class="sum"><td class="label" colspan="4">소 계</td>'
      + cell(fmt(r.proTotal), "r num") + '<td></td></tr></tbody></table></div>'

    /* ── 수량별 공급단가 ── */
    + '<div class="blk"><p class="cap">* 수량별 공급단가 (VAT 별도)</p>'
    + '<table class="items"><colgroup><col style="width:104px"><col><col style="width:66px">'
      + '<col style="width:108px"><col style="width:122px"></colgroup>'
    + '<thead><tr><th>발주수량</th><th>기준단가<small>(원/set)</small></th><th>추가율</th>'
      + '<th>공급단가<small>(원/set)</small></th><th>총 금액<small>(원)</small></th></tr></thead><tbody>'
    + r.tiers.map(function(t){
        var on = r.pick && t.qty === r.pick.qty;
        return '<tr' + (on ? ' class="on"' : "") + '>'
          + '<td class="c"><b>' + fmt(t.qty) + ' set</b>'
          + (on ? ' <span style="color:var(--sg)">◀</span>' : "") + '</td>'
          + cell(fmt(t.base), "r num") + cell((t.rate * 100).toFixed(0) + " %", "c num")
          + '<td class="r num"><b>' + fmt(t.price) + '</b></td>'
          + cell(fmt(t.amount), "r num") + '</tr>';
      }).join("") + '</tbody></table></div>'

    /* ── 비고 · 견적 합계 ── */
    + '<div class="foot2">'
    + '<div class="note"><div class="t">비 고</div><div class="b">' + esc(q.note) + '</div></div>'
    + '<div><p class="cap">* 견적 합계</p><table class="items">'
      + '<colgroup><col><col style="width:116px"><col style="width:64px"></colgroup>'
      + '<thead><tr><th>구 분</th><th>금액<small>(원)</small></th><th>비 고</th></tr></thead><tbody>'
      + qRow("1. 원재료비", r.matCost) + qRow("2. 부자재비", r.subCost) + qRow("3. 가공비", r.proc)
      + qRow("4. 제조원가", r.cost, "cost")
      + qRow("5. 단가 추가금액" + (r.pick ? " (" + (r.pick.rate * 100).toFixed(0) + "%)" : ""), r.add)
      + qRow("합 계" + (r.pick ? " · " + fmt(r.pick.qty) + "set 기준" : ""), r.total, "grand")
      + '</tbody></table></div></div>'

    /* ── 꼬리 ── */
    + '<div class="docfoot"><span class="docno">No.<span class="val num">' + esc(q.id) + '</span></span>'
    + '<span class="wmk">FOODING LAB.</span></div>';
}

'''
a = a[:start] + NEW + a[end:]

# qRow 를 .items 규격에 맞게
old_qrow_start = a.index('function qRow(k, v2, kind){')
old_qrow_end   = a.index('\n', a.index('}', a.index("fmt(v2)", old_qrow_start)))
NEWROW = '''function qRow(k, v2, kind){
  return '<tr' + (kind ? ' class="' + kind + '"' : "") + '><td>' + k + '</td>'
       + '<td class="r num">' + fmt(v2) + '</td><td class="c"></td></tr>';
}'''
a = a[:old_qrow_start] + NEWROW + a[old_qrow_end:]

io.open(P2, 'w', encoding='utf-8').write(a)
print('app: quoteHTML 을 qd2 마크업으로 교체')
