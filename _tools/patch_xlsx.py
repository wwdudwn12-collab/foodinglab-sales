# -*- coding: utf-8 -*-
"""견적 배합·단가 엑셀 양식 다운로드 / 업로드"""
import io, os

P = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fl_app.js')
s = io.open(P, encoding='utf-8').read()

BLOCK = r'''/* ══ 배합·단가 엑셀 양식 ═══════════════════════════════════
   이미 확정된 배합비·단가를 화면에서 한 칸씩 치는 대신,
   엑셀로 내려받아 채워 오면 그대로 반영한다.
   시트 4장: 제품정보 / 배합 / 부자재 / 가공비
   ── 업로드는 시트명과 헤더 순서로 읽으므로 열 순서를 바꾸지 말 것 ── */
function loadXlsx(){
  return new Promise(function(resolve, reject){
    if (window.XLSX) { resolve(); return; }
    var sc = document.createElement("script");
    sc.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
    sc.onload  = function(){ resolve(); };
    sc.onerror = function(){ reject(new Error("엑셀 라이브러리 로드 실패")); };
    setTimeout(function(){ if (!window.XLSX) reject(new Error("엑셀 라이브러리 로드 시간초과")); }, 15000);
    document.head.appendChild(sc);
  });
}

var XL_HEAD = {
  info: ["항목", "값"],
  mats: ["원료명", "배합비(%)", "단가(원/Kg)", "표시량(mg)"],
  subs: ["재료명", "단가(원)", "수량", "비고"],
  procs:["항목명", "단위/규격", "수량", "단가(원)"]
};

window.quoteXlsxDown = async function(){
  var q = curQ(); if (!q) return;
  try { await loadXlsx(); } catch(e){ toast(e.message); return; }

  var wb = XLSX.utils.book_new();

  var info = [XL_HEAD.info,
    ["고객사명", q.client], ["제품명", q.item], ["제품분류", q.category], ["제품제형", q.form],
    ["포장형태", q.pack], ["내용량(mg)", q.content], ["포장단위(정/개)", q.unit],
    ["발주수량(set)", q.order], ["섭취량", q.dose], ["수율(%)", n(q.yield) * 100],
    [], ["※ 값만 고쳐 주세요. 항목 이름과 시트 이름은 바꾸면 업로드가 안 됩니다."]];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(info), "제품정보");

  var mats = [XL_HEAD.mats].concat((q.mats || []).map(function(m){
    return [m.name, n(m.ratio), n(m.price), n(m.label)];
  }));
  while (mats.length < 16) mats.push(["", "", "", ""]);     // 빈 줄 넉넉히
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(mats), "배합");

  var subs = [XL_HEAD.subs].concat((q.subs || []).map(function(x){
    return [x.name, n(x.price), n(x.qty), x.note || ""];
  }));
  while (subs.length < 10) subs.push(["", "", "", ""]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(subs), "부자재");

  var procs = [XL_HEAD.procs].concat((q.procs || []).map(function(p){
    return [p.name, p.spec || "", n(p.qty), n(p.price)];
  }));
  while (procs.length < 10) procs.push(["", "", "", ""]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(procs), "가공비");

  XLSX.writeFile(wb, "배합단가_" + (q.client || "견적") + "_" + q.id + ".xlsx");
  toast("⬇ 엑셀 양식 저장됨 — 채운 뒤 업로드하세요");
};

window.quoteXlsxPick = function(){
  var el = $("xl-file"); if (el) el.click();
};
window.quoteXlsxUp = async function(input){
  var file = input.files && input.files[0];
  input.value = "";
  if (!file) return;
  try { await loadXlsx(); } catch(e){ toast(e.message); return; }

  var q = curQ(); if (!q) return;
  var buf = await file.arrayBuffer();
  var wb  = XLSX.read(buf, {type:"array"});
  var rows = function(name){
    var sh = wb.Sheets[name];
    return sh ? XLSX.utils.sheet_to_json(sh, {header:1, blankrows:false}) : null;
  };
  var txt = function(v){ return String(v == null ? "" : v).trim(); };

  var got = [];

  /* 제품정보 — 항목명으로 찾아 넣는다 (행 순서가 바뀌어도 됨) */
  var inf = rows("제품정보");
  if (inf) {
    var map = {"고객사명":"client","제품명":"item","제품분류":"category","제품제형":"form",
               "포장형태":"pack","내용량(mg)":"content","포장단위(정/개)":"unit",
               "발주수량(set)":"order","섭취량":"dose"};
    inf.slice(1).forEach(function(r){
      var k = txt(r[0]), key = map[k];
      if (key) q[key] = ["content","unit","order"].indexOf(key) >= 0 ? n(r[1]) : txt(r[1]);
      if (k === "수율(%)" && r[1] !== "" && r[1] != null) q.yield = n(r[1]) / 100;
    });
    got.push("제품정보");
  }

  var m = rows("배합");
  if (m) {
    var list = m.slice(1)
      .filter(function(r){ return txt(r[0]) || n(r[1]); })
      .map(function(r){ return {name:txt(r[0]), ratio:n(r[1]), price:n(r[2]), label:n(r[3])}; });
    if (list.length) { q.mats = list; got.push("배합 " + list.length + "행"); }
  }

  var sb = rows("부자재");
  if (sb) {
    var l2 = sb.slice(1)
      .filter(function(r){ return txt(r[0]); })
      .map(function(r){ return {name:txt(r[0]), price:n(r[1]), qty:n(r[2]), note:txt(r[3])}; });
    if (l2.length) { q.subs = l2; got.push("부자재 " + l2.length + "행"); }
  }

  var pr = rows("가공비");
  if (pr) {
    var l3 = pr.slice(1)
      .filter(function(r){ return txt(r[0]); })
      .map(function(r){ return {name:txt(r[0]), spec:txt(r[1]), qty:n(r[2]), price:n(r[3])}; });
    if (l3.length) { q.procs = l3; got.push("가공비 " + l3.length + "행"); }
  }

  if (!got.length) { toast("읽을 시트가 없습니다 — 양식을 다시 받아 쓰세요"); return; }
  save(); redraw();
  toast("불러왔습니다 · " + got.join(" / "));
};

'''
anchor = "/* ══ 견적서 출력 ═══════════════════════════════════════════ */"
assert anchor in s, 'anchor'
s = s.replace(anchor, BLOCK + anchor, 1)

# 견적 편집 헤더에 버튼 + 숨은 파일 입력
a = """  return mhead('견적 작성 <span class="hint num">' + esc(q.id) + '</span>',
        '<button class="btn btn-soft btn-sm" onclick="viewQuote(\\'' + q.id + '\\')">견적서 보기</button> '
      + '<button class="btn btn-ghost btn-sm" onclick="delQuote(\\'' + q.id + '\\')">삭제</button> ')"""
b = """  return mhead('견적 작성 <span class="hint num">' + esc(q.id) + '</span>',
        '<button class="btn btn-ghost btn-sm" onclick="quoteXlsxDown()">⬇ 엑셀 양식</button> '
      + '<button class="btn btn-ghost btn-sm" onclick="quoteXlsxPick()">⬆ 엑셀 업로드</button> '
      + '<input type="file" id="xl-file" accept=".xlsx,.xls" style="display:none" onchange="quoteXlsxUp(this)"> '
      + '<button class="btn btn-soft btn-sm" onclick="viewQuote(\\'' + q.id + '\\')">견적서 보기</button> '
      + '<button class="btn btn-ghost btn-sm" onclick="delQuote(\\'' + q.id + '\\')">삭제</button> ')"""
assert a in s, 'mhead'
s = s.replace(a, b)

io.open(P, 'w', encoding='utf-8').write(s)
print('앱: 엑셀 양식 다운/업로드 추가')
