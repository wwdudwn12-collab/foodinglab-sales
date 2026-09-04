# -*- coding: utf-8 -*-
"""전 화면 디자인 마무리 — 표 정렬 규칙, 빈 상태, 카드 헤더, 사이드바 활성 표시"""
import io, os

D = os.path.dirname(os.path.abspath(__file__))

# ══ 1) JS ══════════════════════════════════════════════════
P = os.path.join(D, 'fl_app.js')
s = io.open(P, encoding='utf-8').read()

# tbl 헬퍼 — 헤더에 "|r" "|c" 붙이면 그 열 전체가 우측/가운데 정렬
old = """function tbl(heads, rows, emptyMsg){
  return '<div class="tblwrap"><table><thead><tr>'
    + heads.map(function(h){ return '<th class="l">' + h + '</th>'; }).join("")
    + '</tr></thead><tbody>'
    + (rows.length ? rows.map(function(r){
        return '<tr>' + r.map(function(c){ return '<td class="l">' + c + '</td>'; }).join("") + '</tr>';
      }).join("")
      : '<tr><td colspan="' + heads.length + '"><div class="empty">' + esc(emptyMsg || "내용 없음")
        + '</div></td></tr>')
    + '</tbody></table></div>';
}"""
new = """/* 헤더 라벨 뒤에 |r (우측) |c (가운데) 를 붙이면 그 열 전체가 같은 정렬로 그려진다 */
function tbl(heads, rows, emptyMsg, emptyBtn){
  var al = heads.map(function(h){
    var p = String(h).split("|");
    return p.length > 1 ? p[1] : "l";
  });
  var lab = heads.map(function(h){ return String(h).split("|")[0]; });

  return '<div class="tblwrap"><table><thead><tr>'
    + lab.map(function(h, i){ return '<th class="' + al[i] + '">' + h + '</th>'; }).join("")
    + '</tr></thead><tbody>'
    + (rows.length ? rows.map(function(r){
        return '<tr>' + r.map(function(c, i){
          return '<td class="' + (al[i] || "l") + '">' + c + '</td>';
        }).join("") + '</tr>';
      }).join("")
      : '<tr><td colspan="' + heads.length + '">' + empty(emptyMsg, emptyBtn) + '</td></tr>')
    + '</tbody></table></div>';
}"""
assert old in s, 'tbl'
s = s.replace(old, new)

# 빈 상태 — 아이콘 + 안내 + (선택) 버튼
old2 = "function tbl(heads, rows, emptyMsg, emptyBtn){"
new2 = """function empty(msg, btn){
  return '<div class="empty">'
    + '<div class="em">' + SVG('<circle cx="12" cy="12" r="8.5"/><path d="M12 8.5v7M8.5 12h7"/>') + '</div>'
    + '<b>' + esc(msg || "아직 없습니다") + '</b>'
    + '<span>' + (btn ? "" : "위 버튼으로 추가하세요") + '</span>'
    + (btn ? '<div style="margin-top:12px">' + btn + '</div>' : "")
    + '</div>';
}"""
assert old2 in s, 'empty anchor'
s = s.replace(old2, new2 + chr(10)*2 + old2)

# 카드 헤더에 아이콘
old3 = """function cardH(t, right){
  return '<div class="card-h">' + t + (right ? '<div class="spacer"></div>' + right : "") + '</div>';
}"""
new3 = """function cardH(t, right, ico){
  return '<div class="card-h">' + (ico ? SVG(IC[ico]) : "") + t
       + (right ? '<div class="spacer"></div>' + right : "") + '</div>';
}"""
assert old3 in s, 'cardH'
s = s.replace(old3, new3)

# ── 화면별 정렬 지정 ──
reps = [
 # 대시보드
 ('tbl(["일자","브랜드","품목","단계"],', 'tbl(["일자|c","브랜드","품목","단계|c"],'),
 ('tbl(["D-day","브랜드","품목","수량"],', 'tbl(["D-day|c","브랜드","품목","수량|r"],'),
 # 리드
 ('tbl(["일자","브랜드 / 담당자","유입","희망 품목","희망 수량","단계","연락처",""],',
  'tbl(["일자|c","브랜드 / 담당자","유입|c","희망 품목","희망 수량|r","단계|c","연락처|c","|r"],'),
 # 브랜드사
 ('tbl(["브랜드","대표","담당","등급","연락처","이메일","메모",""],',
  'tbl(["브랜드","대표|c","담당|c","등급|c","연락처|c","이메일","메모","|r"],'),
 # 캘린더 목록
 ('tbl(["일자","일정","구분"],', 'tbl(["일자|c","일정","구분|c"],'),
 # 원료 DB
 ('tbl(["원료명","단가(원/Kg)","비고",""],', 'tbl(["원료명","단가(원/Kg)|r","비고","|r"],'),
 # 견적 목록
 ('tbl(["번호","일자","브랜드","품목","발주수량","제조원가","공급단가","총 금액",""],',
  'tbl(["번호|c","일자|c","브랜드","품목","발주수량|r","제조원가|r","공급단가|r","총 금액|r","|r"],'),
 # 생산
 ('tbl(["브랜드","품목","제형","수량","납기","단계"],',
  'tbl(["브랜드","품목","제형|c","수량|r","납기|c","단계|c"],'),
 # 정산
 ('tbl(["브랜드","품목","금액","방식","진행","다음 결제일",""],',
  'tbl(["브랜드","품목","금액|r","방식|c","진행|c","다음 결제일|c","|r"],'),
 # 결재
 ('tbl(["일자","제목","구분","금액","기안자","상태",""],',
  'tbl(["일자|c","제목","구분|c","금액|r","기안자|c","상태|c","|r"],'),
 # 팀
 ('tbl(["이름","역할","이메일"],', 'tbl(["이름","역할|c","이메일"],'),
]
for a, b in reps:
    assert a in s, a[:40]
    s = s.replace(a, b)

# 카드 헤더 아이콘 몇 개
for a, b in [
 ('cardH("상담 리드", ', 'cardH("상담 리드", '),
 ("cardH(\"단계별 진행\")", "cardH(\"단계별 진행\", null, 'pipe')"),
 ("cardH(\"최근 상담\")", "cardH(\"최근 상담\", null, 'lead')"),
 ("cardH(\"납기 임박\")", "cardH(\"납기 임박\", null, 'cal')"),
 ("cardH(\"생산 중 · 출고\")", "cardH(\"생산 중 · 출고\", null, 'prod')"),
 ("cardH(\"3PL 물류\")", "cardH(\"3PL 물류\", null, 'docs')"),
 ("cardH(\"담당자\")", "cardH(\"담당자\", null, 'client')"),
]:
    if a in s and a != b:
        s = s.replace(a, b)

io.open(P, 'w', encoding='utf-8').write(s)
print('app: 표 정렬 · 빈 상태 · 카드 헤더')

# ══ 2) CSS ═════════════════════════════════════════════════
P2 = os.path.join(D, 'fl_body.html')
t = io.open(P2, encoding='utf-8').read()
a = '.content table th.l,.content table td.l{text-align:left!important}'
b = """.content table th.l,.content table td.l{text-align:left!important}
.content table th.c,.content table td.c{text-align:center!important}
.content table th.r,.content table td.r{text-align:right!important}
/* 표 맨 오른쪽 액션 열 — 버튼 사이 간격 */
.content table td.r .btn+.btn{margin-left:5px}
/* 빈 상태 */
.empty .em{display:flex;justify-content:center;margin-bottom:10px;color:var(--line2)}
.empty .em svg{width:30px;height:30px}
.empty b{display:block;font-size:14px;color:var(--sub);margin-bottom:3px}
.empty span{font-size:12.5px;color:var(--hint)}
/* 사이드바 활성 — 왼쪽 그린 바로 위치를 분명히 */
.nav a.active{position:relative}
.nav a.active::before{content:"";position:absolute;left:-14px;top:7px;bottom:7px;width:3px;
  background:var(--brand);border-radius:0 3px 3px 0}
/* 카드 헤더 아이콘 */
.card-h .ic{display:inline-flex;color:var(--brand)}
.card-h .ic svg{width:17px;height:17px}"""
assert a in t, 'css anchor'
t = t.replace(a, b)
io.open(P2, 'w', encoding='utf-8').write(t)
print('body: 정렬/빈상태/사이드바 css')
