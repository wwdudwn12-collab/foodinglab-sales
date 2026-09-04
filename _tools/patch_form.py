# -*- coding: utf-8 -*-
"""견적 입력 폼 UI 정리 — 열 폭 고정, 숫자 오른쪽 정렬, 계산칸/입력칸 구분"""
import io, os, re

D = os.path.dirname(os.path.abspath(__file__))

# ── 1) CSS ──
P = os.path.join(D, 'fl_body.html')
s = io.open(P, encoding='utf-8').read()
a = '.field input,.field select,.field textarea,.tblwrap input,.tblwrap select{width:100%}'
b = '''.field input,.field select,.field textarea,.tblwrap input,.tblwrap select{width:100%}

/* ── 견적 입력 폼 ─────────────────────────────────────────── */
.qform table{table-layout:fixed;width:100%}
.qform th{font-size:11.5px;padding:7px 8px;white-space:nowrap}
.qform th.r{text-align:right!important}
.qform th.c{text-align:center!important}
.qform td{padding:5px 6px;vertical-align:middle}
.qform td input{padding:7px 9px;font-size:13px;border-radius:8px}
.qform td input.num{text-align:right;font-variant-numeric:tabular-nums}
/* 계산 결과 칸 — 입력칸과 구분되게 회색 바탕 */
.qform td.calc{background:#f4f6f5;color:var(--sub);text-align:right;font-size:13px;
  font-variant-numeric:tabular-nums;border-radius:8px}
.qform td.del{text-align:center;padding:4px 2px}
.qform td.del button{padding:5px 9px;color:var(--hint)}
.qform td.del button:hover{color:var(--red);border-color:var(--red)}
.qform tr.tot td{background:#eef1ef;font-weight:700;font-size:13px}
.qform tr.tot td.calc{background:#eef1ef;color:var(--ink);font-weight:700}
.qform .hint{font-size:12.5px;color:var(--hint)}
.qform .sec{display:flex;align-items:baseline;gap:8px;margin:20px 0 9px}
.qform .sec b{font-size:15px;font-weight:700;letter-spacing:-.02em}'''
assert a in s, 'css anchor'
s = s.replace(a, b, 1)
io.open(P, 'w', encoding='utf-8').write(s)
print('body: qform css')

# ── 2) quoteForm 재작성 ──
P2 = os.path.join(D, 'fl_app.js')
t = io.open(P2, encoding='utf-8').read()

start = t.index('function quoteForm(q){')
end   = t.index('/* ══ 견적서 화면 배율')
NEW = r'''function quoteForm(q){
  var r = calcQuote(q), ok = Math.abs(r.tRatio - 100) < 0.01;
  var inp = function(val, oninput, num, step){
    return '<input class="' + (num ? "num" : "") + '" type="' + (num ? "number" : "text") + '"'
      + (step ? ' step="' + step + '"' : "")
      + ' value="' + esc(val === 0 || val ? val : "") + '" oninput="' + oninput + '">';
  };
  var sec = function(title, note){
    return '<div class="sec"><b>' + title + '</b>'
         + (note ? '<span class="hint">' + note + '</span>' : "") + '</div>';
  };
  var del = function(fn){ return '<td class="del"><button class="btn btn-ghost btn-sm" onclick="' + fn + '">×</button></td>'; };

  return mhead('견적 작성 <span class="hint num">' + esc(q.id) + '</span>',
        '<button class="btn btn-soft btn-sm" onclick="viewQuote(\'' + q.id + '\')">견적서 보기</button> '
      + '<button class="btn btn-ghost btn-sm" onclick="delQuote(\'' + q.id + '\')">삭제</button> ')

    + '<div class="qform">'

    /* 제품 정보 */
    + '<div class="grid" style="grid-template-columns:repeat(4,1fr);gap:12px">'
    + fldQ("브랜드","client",q.client) + fldQ("품목","item",q.item)
    + fldQ("제품분류","category",q.category) + fldQ("제형","form",q.form)
    + fldQ("포장형태","pack",q.pack) + fldQ("내용량(mg)","content",q.content,"number")
    + fldQ("포장단위(정/개)","unit",q.unit,"number") + fldQ("발주수량(set)","order",q.order,"number")
    + '</div>'
    + '<div class="field"><label>섭취량</label>'
    + '<input value="' + esc(q.dose) + '" oninput="setQ(\'dose\',this.value)"></div>'

    /* 배합 */
    + sec("배합 (원재료)", "회색 칸은 자동 계산")
    + '<div class="tblwrap"><table>'
    + '<colgroup><col><col style="width:96px"><col style="width:96px"><col style="width:104px">'
      + '<col style="width:96px"><col style="width:104px"><col style="width:88px"><col style="width:46px"></colgroup>'
    + '<thead><tr><th class="l">원료명</th><th class="r">배합비(%)</th><th class="r">함량(mg)</th>'
      + '<th class="r">단가(원/Kg)</th><th class="r">금액(원)</th><th class="r">총사용량(g)</th>'
      + '<th class="r">표시량(mg)</th><th></th></tr></thead><tbody>'
    + q.mats.map(function(m, i){
        var c = r.mats[i];
        return '<tr>'
          + '<td><input value="' + esc(m.name) + '" oninput="setMat(' + i + ',\'name\',this.value)" list="matlist"></td>'
          + '<td>' + inp(m.ratio, "setMat(" + i + ",'ratio',this.value)", true, "0.001") + '</td>'
          + '<td class="calc">' + fmt(c.mg, 3) + '</td>'
          + '<td>' + inp(m.price, "setMat(" + i + ",'price',this.value)", true) + '</td>'
          + '<td class="calc">' + fmt(c.cost, 1) + '</td>'
          + '<td class="calc">' + fmt(c.use) + '</td>'
          + '<td>' + inp(m.label, "setMat(" + i + ",'label',this.value)", true) + '</td>'
          + del("delMatRow(" + i + ")") + '</tr>';
      }).join("")
    + '</tbody><tbody><tr class="tot"><td>합계</td>'
      + '<td class="calc" style="color:' + (ok ? "var(--brand)" : "var(--red)") + '">' + fmt(r.tRatio, 3) + ' %</td>'
      + '<td class="calc">' + fmt(r.tMg, 1) + '</td><td></td>'
      + '<td class="calc">' + fmt(r.matCost) + '</td><td class="calc">' + fmt(r.tUse) + '</td>'
      + '<td colspan="2"></td></tr></tbody></table></div>'
    + '<datalist id="matlist">' + S.materials.map(function(m){
        return '<option value="' + esc(m.name) + '">' + fmt(m.price) + '원/Kg</option>'; }).join("") + '</datalist>'
    + '<div class="row" style="margin-top:10px"><button class="btn btn-ghost btn-sm" onclick="addMatRow()">+ 원료 행</button>'
    + '<span style="font-size:12.5px;color:' + (ok ? "var(--brand)" : "var(--red)") + '">'
    + (ok ? "배합비 합계 100% ✓" : "배합비 합계 " + fmt(r.tRatio, 3) + "% — 100%로 맞춰야 함") + '</span></div>'

    /* 부자재 */
    + sec("부자재", "1 set 기준")
    + '<div class="tblwrap"><table>'
    + '<colgroup><col><col style="width:120px"><col style="width:100px"><col style="width:116px">'
      + '<col style="width:180px"><col style="width:46px"></colgroup>'
    + '<thead><tr><th class="l">재료명</th><th class="r">단가(원)</th><th class="r">수량</th>'
      + '<th class="r">금액(원)</th><th class="l">비고</th><th></th></tr></thead><tbody>'
    + q.subs.map(function(s2, i){
        return '<tr>'
          + '<td><input value="' + esc(s2.name) + '" oninput="setSub(' + i + ',\'name\',this.value)"></td>'
          + '<td>' + inp(s2.price, "setSub(" + i + ",'price',this.value)", true) + '</td>'
          + '<td>' + inp(s2.qty, "setSub(" + i + ",'qty',this.value)", true, "0.01") + '</td>'
          + '<td class="calc">' + fmt(r.subs[i].amt, 1) + '</td>'
          + '<td><input value="' + esc(s2.note || "") + '" oninput="setSub(' + i + ',\'note\',this.value)"></td>'
          + del("delSubRow(" + i + ")") + '</tr>';
      }).join("")
    + '</tbody><tbody><tr class="tot"><td colspan="3">합계</td>'
      + '<td class="calc">' + fmt(r.subCost) + '</td><td colspan="2"></td></tr></tbody></table></div>'
    + '<button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="addSubRow()">+ 부자재 행</button>'

    /* 가공비 */
    + sec("가공비", "전체 로트 기준 · 소계 ÷ 발주수량 = 1 set 가공비")
    + '<div class="tblwrap"><table>'
    + '<colgroup><col><col style="width:110px"><col style="width:110px"><col style="width:110px">'
      + '<col style="width:130px"><col style="width:46px"></colgroup>'
    + '<thead><tr><th class="l">항목명</th><th class="l">단위/규격</th><th class="r">수량</th>'
      + '<th class="r">단가(원)</th><th class="r">금액(원)</th><th></th></tr></thead><tbody>'
    + q.procs.map(function(p, i){
        return '<tr>'
          + '<td><input value="' + esc(p.name) + '" oninput="setPro(' + i + ',\'name\',this.value)"></td>'
          + '<td><input value="' + esc(p.spec || "") + '" oninput="setPro(' + i + ',\'spec\',this.value)"></td>'
          + '<td>' + inp(p.qty, "setPro(" + i + ",'qty',this.value)", true, "0.1") + '</td>'
          + '<td>' + inp(p.price, "setPro(" + i + ",'price',this.value)", true) + '</td>'
          + '<td class="calc">' + fmt(r.procs[i].amt) + '</td>'
          + del("delProRow(" + i + ")") + '</tr>';
      }).join("")
    + '</tbody><tbody>'
      + '<tr class="tot"><td colspan="4">소계 (전체 로트)</td>'
      + '<td class="calc">' + fmt(r.proTotal) + '</td><td></td></tr>'
      + '<tr class="tot"><td colspan="4">1 set 가공비 &nbsp;<span class="hint">소계 ÷ '
      + fmt(q.order) + ' set</span></td>'
      + '<td class="calc">' + fmt(r.proc, 1) + '</td><td></td></tr>'
      + '</tbody></table></div>'
    + '<button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="addProRow()">+ 공정 행</button>'

    /* 결과 */
    + '<div style="display:grid;grid-template-columns:1.25fr 1fr;gap:18px;margin-top:24px">'
    + '<div>' + sec("수량 구간별 공급단가").replace('margin:20px 0 9px', 'margin:0 0 9px')
    + '<div class="tblwrap"><table>'
    + '<colgroup><col style="width:110px"><col><col style="width:80px"><col style="width:110px"><col style="width:130px"></colgroup>'
    + '<thead><tr><th class="l">발주수량</th><th class="r">기준단가</th><th class="c">추가율</th>'
      + '<th class="r">공급단가</th><th class="r">총 금액</th></tr></thead><tbody>'
    + r.tiers.map(function(t2){
        var on = r.pick && t2.qty === r.pick.qty;
        return '<tr' + (on ? ' style="background:var(--brand-soft)"' : "") + '>'
          + '<td' + (on ? ' style="font-weight:700"' : "") + '><span class="num">' + fmt(t2.qty)
          + '</span> set' + (on ? ' <span style="color:var(--brand)">◀</span>' : "") + '</td>'
          + '<td class="calc">' + fmt(t2.base) + '</td>'
          + '<td class="calc" style="text-align:center">' + (t2.rate * 100).toFixed(0) + ' %</td>'
          + '<td class="calc"' + (on ? ' style="font-weight:700;color:var(--ink)"' : "") + '>'
          + fmt(t2.price) + '</td>'
          + '<td class="calc">' + fmt(t2.amount) + '</td></tr>';
      }).join("") + '</tbody></table></div></div>'

    + '<div>' + sec("견적 합계").replace('margin:20px 0 9px', 'margin:0 0 9px')
    + '<div class="tblwrap"><table><colgroup><col><col style="width:140px"></colgroup><tbody>'
    + sumRow("1. 원재료비", r.matCost) + sumRow("2. 부자재비", r.subCost) + sumRow("3. 가공비", r.proc)
    + sumRow("4. 제조원가", r.cost, "cost")
    + sumRow("5. 단가 추가금액" + (r.pick ? " (" + (r.pick.rate * 100).toFixed(0) + "%)" : ""), r.add)
    + sumRow("합계", r.total, "grand")
    + '</tbody></table></div>'
    + '<div class="metric" style="margin-top:12px">'
    + '<div class="l">최종 견적가 · 1 set · VAT 별도</div>'
    + '<div class="v num">' + fmt(r.final) + '<small> 원</small></div>'
    + '<div class="hint" style="margin-top:3px">총 ' + fmt(r.amount) + ' 원 · '
    + fmt(q.order) + ' set</div></div></div></div>'

    + '</div>';
}

'''
t = t[:start] + NEW + t[end:]
io.open(P2, 'w', encoding='utf-8').write(t)
print('app: quoteForm 재작성')
