# -*- coding: utf-8 -*-
"""patch_form 범위가 겹쳐서 지워진 viewQuote / fitPrint 복구"""
import io, os

P = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fl_app.js')
s = io.open(P, encoding='utf-8').read()
assert 'function viewQuote' not in s, '이미 있음'

BLOCK = r'''/* ══ 견적서 출력 ═══════════════════════════════════════════ */
function viewQuote(id){
  var q = S.quotes.filter(function(x){ return x.id === id; })[0];
  if (!q) return;
  QDOC = q;
  openModal('<div class="mhead noprint"><h3>견적서 미리보기</h3>'
    + '<div class="row" style="gap:4px;margin-left:10px">'
    + '<button class="btn btn-ghost btn-sm" onclick="qvZoom(-1)">−</button>'
    + '<span id="qv-pct" class="num" style="font-size:12.5px;color:var(--hint);min-width:42px;text-align:center"></span>'
    + '<button class="btn btn-ghost btn-sm" onclick="qvZoom(1)">+</button>'
    + '<button class="btn btn-soft btn-sm" onclick="qvFit()">화면맞춤</button>'
    + '<button class="btn btn-ghost btn-sm" onclick="qvZoom(0)">100%</button></div>'
    + '<div class="spacer"></div>'
    + '<button class="btn btn-ghost btn-sm" onclick="editQuote(\'' + id + '\')">수정</button> '
    + '<button class="btn btn-ghost btn-sm" id="qv-dl" onclick="quotePdf()">⬇ PDF 저장</button> '
    + '<button class="btn btn-brand btn-sm" id="qv-mail" onclick="quoteMail()">📎 PDF 첨부해 메일</button> '
    + '<button class="btn btn-ghost btn-sm" onclick="fitPrint()">인쇄</button> '
    + '<button class="btn btn-ghost btn-sm" onclick="closeModal()">닫기</button></div>'
    + '<div id="qvwrap"><div id="qv">' + quoteHTML(q) + '</div></div>', true);
  qvFit();
}
function fitPrint(){
  var el = $("qv");
  if (el) {
    setZoom(1);                               // 인쇄는 화면 배율과 무관
    var PX = 96 / 25.4, avail = (297 - 20) * PX;
    // 무조건 A4 한 장에 담는다 (하한 0.45)
    document.documentElement.style.setProperty("--fit",
      Math.max(0.45, Math.min(1, avail / el.scrollHeight)).toFixed(3));
  }
  window.print();
}

'''
anchor = "/* ══ 견적서 화면 배율"
assert anchor in s, 'anchor'
s = s.replace(anchor, BLOCK + anchor, 1)
io.open(P, 'w', encoding='utf-8').write(s)
print('viewQuote / fitPrint 복구')
