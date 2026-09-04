# -*- coding: utf-8 -*-
"""엑셀 업로드 — 마스터 양식(제조견적서 시트)도 읽게"""
import io, os

P = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fl_app.js')
s = io.open(P, encoding='utf-8').read()

MASTER = r'''
/* 마스터 양식(제조견적서 시트) 읽기 — 시트 이름·셀 좌표 고정
   B/C/D… 열 구성은 build_v3.ps1 로 만든 양식 기준.
   수식 칸은 엑셀이 저장해 둔 계산값(캐시)을 읽는다. */
function parseMaster(wb, q){
  var sh = wb.Sheets["제조견적서"];
  if (!sh) return null;

  var cell = function(ref){
    var c = sh[ref];
    return c ? (c.v == null ? "" : c.v) : "";
  };
  var txt = function(ref){ return String(cell(ref)).trim(); };
  var num = function(ref){ return n(cell(ref)); };

  q.client   = txt("C6")  || q.client;
  q.item     = txt("C11") || q.item;
  q.category = txt("C12") || q.category;
  q.form     = txt("C13") || q.form;
  q.order    = num("C14") || q.order;
  q.pack     = txt("F11") || q.pack;
  q.content  = num("F12") || q.content;
  q.unit     = num("F13") || q.unit;
  q.dose     = txt("F14") || q.dose;
  if (cell("R3") !== "") q.yield = n(cell("R3"));

  /* 원재료 20~33행 : B 원료명 · D 배합비 · F 단가(원/Kg) · I 표시량 */
  var mats = [];
  for (var r = 20; r <= 33; r++) {
    var nm = txt("B" + r);
    if (!nm) continue;
    mats.push({name:nm, ratio:num("D" + r), price:num("F" + r), label:num("I" + r)});
  }
  if (mats.length) q.mats = mats;

  /* 부자재 38~42행 : B 재료명 · D 단가 · F 수량(총) · H 비고
     앱은 1 set 기준 수량을 쓰므로 총수량 ÷ 발주수량 으로 되돌린다 */
  var subs = [], ord = n(q.order);
  for (var r2 = 38; r2 <= 42; r2++) {
    var nm2 = txt("B" + r2);
    if (!nm2) continue;
    var tot = num("F" + r2);
    subs.push({name:nm2, price:num("D" + r2),
               qty: ord ? tot / ord : tot, note:txt("H" + r2)});
  }
  if (subs.length) q.subs = subs;

  /* 가공비 38~42행 : J 항목명 · K 단위/규격 · L 수량 · M 단가 (로트 총액 기준) */
  var procs = [];
  for (var r3 = 38; r3 <= 42; r3++) {
    var nm3 = txt("J" + r3);
    if (!nm3) continue;
    procs.push({name:nm3, spec:txt("K" + r3), qty:num("L" + r3), price:num("M" + r3)});
  }
  if (procs.length) q.procs = procs;

  return {mats:mats.length, subs:subs.length, procs:procs.length};
}
'''

anchor = "window.quoteXlsxPick = function(){"
assert anchor in s, 'anchor'
s = s.replace(anchor, MASTER.strip() + "\n\n" + anchor, 1)

# 업로드 분기 — 마스터 양식 먼저 시도
a = """  var got = [];

  /* 제품정보 — 항목명으로 찾아 넣는다 (행 순서가 바뀌어도 됨) */"""
b = """  var got = [];

  /* 1) 마스터 양식이면 좌표 기반으로 읽는다 */
  if (wb.SheetNames.indexOf("제조견적서") >= 0) {
    var m0 = parseMaster(wb, q);
    if (m0) {
      save(); redraw();
      toast("마스터 양식에서 불러왔습니다 · 원료 " + m0.mats
            + " / 부자재 " + m0.subs + " / 가공비 " + m0.procs + "행");
      return;
    }
  }

  /* 2) 단순 양식(제품정보·배합·부자재·가공비 4시트) */
  /* 제품정보 — 항목명으로 찾아 넣는다 (행 순서가 바뀌어도 됨) */"""
assert a in s, 'branch'
s = s.replace(a, b)

# 안 읽혔을 때 안내를 더 구체적으로
a2 = '  if (!got.length) { toast("읽을 시트가 없습니다 — 양식을 다시 받아 쓰세요"); return; }'
b2 = ('  if (!got.length) {\n'
      '    toast("읽을 수 있는 시트가 없습니다 — 시트 이름이 \'제조견적서\' 또는 '
      '\'제품정보/배합/부자재/가공비\' 여야 합니다 (현재: " + wb.SheetNames.join(", ") + ")");\n'
      '    return;\n  }')
assert a2 in s, 'msg'
s = s.replace(a2, b2)

io.open(P, 'w', encoding='utf-8').write(s)
print('앱: 마스터 양식 파서 추가')
