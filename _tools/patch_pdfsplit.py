# -*- coding: utf-8 -*-
"""PDF — 블록 경계에서만 페이지 나눔. 표가 중간에서 잘리지 않게"""
import io, os

P = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fl_app.js')
s = io.open(P, encoding='utf-8').read()

a = """  var pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
  // A4 한 장에 통째로 — 폭·높이 중 더 빡빡한 쪽에 맞춰 축소 (잘림 방지)
  var m = 4,                                  // 가장자리 여백 mm
      sc = Math.min((pw - m * 2) / canvas.width, (ph - m * 2) / canvas.height),
      iw = canvas.width * sc, ih = canvas.height * sc;
  pdf.addImage(img, "JPEG", (pw - iw) / 2, m, iw, ih);"""
b = """  var pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
  var m = 6,                                   // 가장자리 여백 mm
      iw = pw - m * 2,                         // 폭 맞춤 (글씨 크기 유지)
      pxPerMM = canvas.width / iw,             // 캔버스 px ↔ mm
      pageH = (ph - m * 2) * pxPerMM,          // 한 페이지에 들어가는 캔버스 px
      total = canvas.height;

  if (total <= pageH * 1.06) {                 // 6% 이내면 살짝 줄여 한 장에
    var sc = Math.min(iw / canvas.width, (ph - m * 2) / canvas.height);
    pdf.addImage(img, "JPEG", (pw - canvas.width * sc) / 2, m,
                 canvas.width * sc, canvas.height * sc);
  } else {
    // 블록(#qv 직계 자식) 경계에서만 페이지를 끊는다 → 표가 중간에서 잘리지 않음
    var cuts = [];
    if (opt && opt.blocks) {
      opt.blocks.forEach(function(y){
        var p = y * (canvas.height / opt.docH);
        if (p > 0 && p < total) cuts.push(p);
      });
    }
    var start = 0, first = true;
    while (start < total - 1) {
      var limit = start + pageH,
          cut = null;
      for (var i = 0; i < cuts.length; i++) {
        if (cuts[i] > start + pageH * 0.35 && cuts[i] <= limit) cut = cuts[i];
      }
      var end = Math.min(cut || limit, total),
          hPx = end - start;

      var pc = document.createElement("canvas");
      pc.width = canvas.width; pc.height = hPx;
      pc.getContext("2d").drawImage(canvas, 0, start, canvas.width, hPx, 0, 0, canvas.width, hPx);

      if (!first) pdf.addPage();
      pdf.addImage(pc.toDataURL("image/jpeg", 0.92), "JPEG", m, m, iw, hPx / pxPerMM);
      first = false;
      start = end;
    }
  }"""
assert a in s, 'pdf block'
s = s.replace(a, b)

# elToPdf 에 블록 좌표 인자 추가
s = s.replace("async function elToPdf(el, fileName){",
              "async function elToPdf(el, fileName, opt){")
s = s.replace("""window.quotePdf = async function(){
  var b = $("qv-dl"); if (b) { b.disabled = true; b.textContent = "PDF 만드는 중…"; }
  var keep = QVZ; setZoom(1);                 // 배율 걸린 채로 캡처하면 흐려짐
  try {
    dlPdfBlob(await elToPdf($("qv"), qFile(QDOC)));""",
"""/* #qv 안에서 페이지를 끊어도 되는 y 좌표들 (블록 경계) */
function qvBlocks(){
  var el = $("qv"); if (!el) return null;
  var top = el.getBoundingClientRect().top, ys = [];
  [].forEach.call(el.children, function(c){
    ys.push(c.getBoundingClientRect().top - top);
  });
  return {blocks:ys, docH:el.scrollHeight};
}
window.quotePdf = async function(){
  var b = $("qv-dl"); if (b) { b.disabled = true; b.textContent = "PDF 만드는 중…"; }
  var keep = QVZ; setZoom(1);                 // 배율 걸린 채로 캡처하면 흐려짐
  try {
    dlPdfBlob(await elToPdf($("qv"), qFile(QDOC), qvBlocks()));""")
s = s.replace("""  try { att = await elToPdf($("qv"), qFile(QDOC)); }""",
              """  try { att = await elToPdf($("qv"), qFile(QDOC), qvBlocks()); }""")

io.open(P, 'w', encoding='utf-8').write(s)
print('PDF 블록 분할 적용')
