# -*- coding: utf-8 -*-
"""견적서 미리보기 화면 배율 — 한 화면에 다 보이게. 인쇄·PDF는 영향 없음"""
import io, os

D = os.path.dirname(os.path.abspath(__file__))

# ── 1) CSS : 화면 배율용 --zoom (인쇄용 --fit 과 분리) ──
P = os.path.join(D, 'fl_body.html')
s = io.open(P, encoding='utf-8').read()
a = '''#qv{--sg:#1A7452;'''
b = '''/* 화면에서만 적용되는 배율. 인쇄는 아래 @media print 의 --fit 이 따로 씀 */
#qv{zoom:var(--zoom,1)}
#qvwrap{overflow:auto}
#qv{--sg:#1A7452;'''
assert a in s, 'css anchor'
s = s.replace(a, b, 1)
# 인쇄 때는 화면 배율 무시
s = s.replace('  #qv{width:auto!important;padding:0!important;margin:0!important;zoom:var(--fit,1)}',
              '  #qv{width:auto!important;padding:0!important;margin:0!important;zoom:var(--fit,1)!important}')
io.open(P, 'w', encoding='utf-8').write(s)
print('body: zoom 변수 추가')

# ── 2) JS : 배율 버튼 + 자동 화면맞춤, PDF/인쇄 전 배율 해제 ──
P2 = os.path.join(D, 'fl_app.js')
a2 = io.open(P2, encoding='utf-8').read()

old = """  QDOC = q;
  openModal('<div class="mhead noprint"><h3>견적서 미리보기</h3><div class="spacer"></div>'
    + '<button class="btn btn-ghost btn-sm" onclick="editQuote(\\'' + id + '\\')">수정</button> '
    + '<button class="btn btn-ghost btn-sm" id="qv-dl" onclick="quotePdf()">⬇ PDF 저장</button> '
    + '<button class="btn btn-brand btn-sm" id="qv-mail" onclick="quoteMail()">📎 PDF 첨부해 메일</button> '
    + '<button class="btn btn-ghost btn-sm" onclick="fitPrint()">인쇄</button> '
    + '<button class="btn btn-ghost btn-sm" onclick="closeModal()">닫기</button></div>'
    + '<div id="qv">' + quoteHTML(q) + '</div>', true);"""
new = """  QDOC = q;
  openModal('<div class="mhead noprint"><h3>견적서 미리보기</h3>'
    + '<div class="row" style="gap:4px;margin-left:10px">'
    + '<button class="btn btn-ghost btn-sm" onclick="qvZoom(-1)">−</button>'
    + '<span id="qv-pct" class="num" style="font-size:12.5px;color:var(--hint);min-width:42px;text-align:center"></span>'
    + '<button class="btn btn-ghost btn-sm" onclick="qvZoom(1)">+</button>'
    + '<button class="btn btn-soft btn-sm" onclick="qvFit()">화면맞춤</button>'
    + '<button class="btn btn-ghost btn-sm" onclick="qvZoom(0)">100%</button></div>'
    + '<div class="spacer"></div>'
    + '<button class="btn btn-ghost btn-sm" onclick="editQuote(\\'' + id + '\\')">수정</button> '
    + '<button class="btn btn-ghost btn-sm" id="qv-dl" onclick="quotePdf()">⬇ PDF 저장</button> '
    + '<button class="btn btn-brand btn-sm" id="qv-mail" onclick="quoteMail()">📎 PDF 첨부해 메일</button> '
    + '<button class="btn btn-ghost btn-sm" onclick="fitPrint()">인쇄</button> '
    + '<button class="btn btn-ghost btn-sm" onclick="closeModal()">닫기</button></div>'
    + '<div id="qvwrap"><div id="qv">' + quoteHTML(q) + '</div></div>', true);
  qvFit();"""
assert old in a2, 'preview markup'
a2 = a2.replace(old, new)

ZOOM = r'''
/* ══ 견적서 화면 배율 ═══════════════════════════════════════
   배합비·단가를 한 화면에서 비교하려고 넣음. 인쇄/PDF 에는 영향 없음
   (인쇄는 --fit, PDF 는 setZoom(1) 로 원본 크기에서 캡처) */
var QVZ = 1;
function setZoom(z){
  QVZ = Math.max(0.35, Math.min(1, z));
  var el = $("qv"); if (el) el.style.setProperty("--zoom", QVZ.toFixed(3));
  var p = $("qv-pct"); if (p) p.textContent = Math.round(QVZ * 100) + "%";
}
window.qvFit = function(){
  var el = $("qv"); if (!el) return;
  el.style.setProperty("--zoom", 1);                 // 원본 크기에서 실측
  var box = el.parentElement.getBoundingClientRect().width,
      docW = el.scrollWidth, docH = el.scrollHeight,
      availH = window.innerHeight - 150;             // 모달 헤더·여백 감안
  setZoom(Math.min(box / docW, availH / docH, 1));
};
window.qvZoom = function(dir){
  if (dir === 0) return setZoom(1);
  setZoom(QVZ + dir * 0.1);
};
'''
anchor = "function quoteHTML(q){"
assert anchor in a2, 'quoteHTML anchor'
a2 = a2.replace(anchor, ZOOM.lstrip("\n") + "\n" + anchor, 1)

# PDF / 인쇄 전에 화면 배율 해제 → 끝나면 복구
a2 = a2.replace("""window.quotePdf = async function(){
  var b = $("qv-dl"); if (b) { b.disabled = true; b.textContent = "PDF 만드는 중…"; }
  try {""",
"""window.quotePdf = async function(){
  var b = $("qv-dl"); if (b) { b.disabled = true; b.textContent = "PDF 만드는 중…"; }
  var keep = QVZ; setZoom(1);                 // 배율 걸린 채로 캡처하면 흐려짐
  try {""")
a2 = a2.replace("""  } catch(e){ toast("PDF 생성 실패 — 인쇄 버튼으로 저장하세요"); }
  if (b) { b.disabled = false; b.textContent = "⬇ PDF 저장"; }
};""",
"""  } catch(e){ toast("PDF 생성 실패 — 인쇄 버튼으로 저장하세요"); }
  setZoom(keep);
  if (b) { b.disabled = false; b.textContent = "⬇ PDF 저장"; }
};""")
a2 = a2.replace("""  var att = null;
  try { att = await elToPdf($("qv"), qFile(QDOC)); }
  catch(e){ toast("PDF 첨부 실패 — PDF 저장 후 직접 첨부하세요"); }""",
"""  var att = null, keep = QVZ; setZoom(1);
  try { att = await elToPdf($("qv"), qFile(QDOC)); }
  catch(e){ toast("PDF 첨부 실패 — PDF 저장 후 직접 첨부하세요"); }
  setZoom(keep);""")
a2 = a2.replace("""function fitPrint(){
  var el = $("qv");
  if (el) {""",
"""function fitPrint(){
  var el = $("qv");
  if (el) {
    setZoom(1);                               // 인쇄는 화면 배율과 무관""")

io.open(P2, 'w', encoding='utf-8').write(a2)
print('app: 배율 컨트롤 추가')
