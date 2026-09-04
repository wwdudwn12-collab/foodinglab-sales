# -*- coding: utf-8 -*-
"""견적서 문서를 2단으로 압축 — A4 한 장에 넣어도 글씨가 덜 작아지게"""
import io, os

D = os.path.dirname(os.path.abspath(__file__))

# 1) 부자재 / 가공비를 나란히, 구간표 / (비고+합계) 나란히
P = os.path.join(D, 'fl_app.js')
s = io.open(P, encoding='utf-8').read()

a = """    /* ── 부자재비 ── */
    + '<div class="blk"><p class="cap">* 부자재비</p>'"""
b = """    /* ── 부자재비 · 가공비 (2단) ── */
    + '<div class="cols2">'
    + '<div class="blk"><p class="cap">* 부자재비</p>'"""
assert a in s, 'sub start'
s = s.replace(a, b)

a2 = """    + '</tbody><tbody><tr class="sum"><td class="label" colspan="3">합 계</td>'
      + cell(fmt(r.subCost), "r num") + '<td></td></tr></tbody></table></div>'

    /* ── 가공비 ── */
    + '<div class="blk"><p class="cap">* 가공비 &nbsp;(전체 로트 기준 · 소계 ÷ 발주수량 = 1 set 가공비)</p>'"""
b2 = """    + '</tbody><tbody><tr class="sum"><td class="label" colspan="3">합 계</td>'
      + cell(fmt(r.subCost), "r num") + '<td></td></tr></tbody></table></div>'

    /* 가공비 */
    + '<div class="blk"><p class="cap">* 가공비 &nbsp;(로트 기준 · 소계 ÷ 발주수량)</p>'"""
assert a2 in s, 'proc start'
s = s.replace(a2, b2)

a3 = """    + '</tbody><tbody><tr class="sum"><td class="label" colspan="4">소 계</td>'
      + cell(fmt(r.proTotal), "r num") + '<td></td></tr></tbody></table></div>'

    /* ── 수량별 공급단가 ── */
    + '<div class="blk"><p class="cap">* 수량별 공급단가 (VAT 별도)</p>'"""
b3 = """    + '</tbody><tbody><tr class="sum"><td class="label" colspan="4">소 계</td>'
      + cell(fmt(r.proTotal), "r num") + '<td></td></tr></tbody></table></div>'
    + '</div>'

    /* ── 수량별 공급단가 ── */
    + '<div class="blk"><p class="cap">* 수량별 공급단가 (VAT 별도)</p>'"""
assert a3 in s, 'proc end'
s = s.replace(a3, b3)

# 원재료 빈 줄 6 → 3
s = s.replace("+ blank(7, Math.max(0, 6 - r.mats.length))",
              "+ blank(7, Math.max(0, 3 - r.mats.length))")

# 부자재 표에서 비고 열 제거해 폭 확보
s = s.replace("""    + '<table class="items"><colgroup><col><col style="width:92px"><col style="width:78px">'
      + '<col style="width:94px"><col style="width:88px"></colgroup>'
    + '<thead><tr><th>재 료 명</th><th>단 가<small>(원)</small></th><th>수 량</th>'
      + '<th>금 액<small>(원)</small></th><th>비 고</th></tr></thead><tbody>'""",
"""    + '<table class="items"><colgroup><col><col style="width:64px"><col style="width:52px">'
      + '<col style="width:68px"></colgroup>'
    + '<thead><tr><th>재 료 명</th><th>단 가<small>(원)</small></th><th>수 량</th>'
      + '<th>금 액<small>(원)</small></th></tr></thead><tbody>'""")
s = s.replace("""        return '<tr>' + cell(esc(s2.name)) + cell(fmt(s2.price), "r num")
          + cell(fmt(s2.qty, s2.qty % 1 ? 2 : 0), "r num") + cell(fmt(s2.amt, 1), "r num")
          + cell(esc(s2.note || ""), "c") + '</tr>';""",
"""        return '<tr>' + cell(esc(s2.name)) + cell(fmt(s2.price), "r num")
          + cell(fmt(s2.qty, s2.qty % 1 ? 2 : 0), "r num")
          + cell(fmt(s2.amt, 1), "r num") + '</tr>';""")
s = s.replace("""    + '</tbody><tbody><tr class="sum"><td class="label" colspan="3">합 계</td>'
      + cell(fmt(r.subCost), "r num") + '<td></td></tr></tbody></table></div>'""",
"""    + '</tbody><tbody><tr class="sum"><td class="label" colspan="3">합 계</td>'
      + cell(fmt(r.subCost), "r num") + '</tr></tbody></table></div>'""")

# 가공비 표에서도 비고 열 제거
s = s.replace("""    + '<table class="items"><colgroup><col><col style="width:76px"><col style="width:72px">'
      + '<col style="width:76px"><col style="width:92px"><col style="width:76px"></colgroup>'
    + '<thead><tr><th>항 목 명</th><th>단위/규격</th><th>수 량</th><th>단 가<small>(원)</small></th>'
      + '<th>금 액<small>(원)</small></th><th>비 고</th></tr></thead><tbody>'""",
"""    + '<table class="items"><colgroup><col><col style="width:54px"><col style="width:60px">'
      + '<col style="width:56px"><col style="width:78px"></colgroup>'
    + '<thead><tr><th>항 목 명</th><th>규격</th><th>수 량</th><th>단 가<small>(원)</small></th>'
      + '<th>금 액<small>(원)</small></th></tr></thead><tbody>'""")
s = s.replace("""        return '<tr>' + cell(esc(p.name)) + cell(esc(p.spec || ""), "c")
          + cell(fmt(p.qty, p.qty % 1 ? 1 : 0), "r num") + cell(fmt(p.price), "r num")
          + cell(fmt(p.amt), "r num") + cell(esc(p.note || ""), "c") + '</tr>';""",
"""        return '<tr>' + cell(esc(p.name)) + cell(esc(p.spec || ""), "c")
          + cell(fmt(p.qty, p.qty % 1 ? 1 : 0), "r num") + cell(fmt(p.price), "r num")
          + cell(fmt(p.amt), "r num") + '</tr>';""")
s = s.replace("""    + '</tbody><tbody><tr class="sum"><td class="label" colspan="4">소 계</td>'
      + cell(fmt(r.proTotal), "r num") + '<td></td></tr></tbody></table></div>'""",
"""    + '</tbody><tbody><tr class="sum"><td class="label" colspan="4">소 계</td>'
      + cell(fmt(r.proTotal), "r num") + '</tr></tbody></table></div>'""")

io.open(P, 'w', encoding='utf-8').write(s)
print('app: 견적서 2단 압축')

# 2) CSS — 2단 그리드 + 인쇄용 밀도
P2 = os.path.join(D, 'fl_body.html')
t = io.open(P2, encoding='utf-8').read()
a4 = '#qv .blk{margin-bottom:18px}'
b4 = '''#qv .blk{margin-bottom:14px}
#qv .cols2{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}
#qv .cols2 .items td{padding:5px 6px;height:23px;font-size:11px}
#qv .cols2 .items th{padding:6px 3px;font-size:10.5px}'''
assert a4 in t, 'blk css'
t = t.replace(a4, b4)
io.open(P2, 'w', encoding='utf-8').write(t)
print('body: 2단 css')
