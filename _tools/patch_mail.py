# -*- coding: utf-8 -*-
"""푸딩랩 앱에 견적서 PDF · 하이웍스 메일 첨부 발송 붙이기 (영업웹앱과 같은 구조)"""
import io, os

P = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fl_app.js')
s = io.open(P, encoding='utf-8').read()

# ── 견적서 미리보기 버튼 3개로 교체 ──
a = """  openModal('<div class="mhead noprint"><h3>견적서 미리보기</h3><div class="spacer"></div>'
    + '<button class="btn btn-ghost btn-sm" onclick="editQuote(\\'' + id + '\\')">수정</button> '
    + '<button class="btn btn-brand btn-sm" onclick="fitPrint()">인쇄 · PDF</button> '
    + '<button class="btn btn-ghost btn-sm" onclick="closeModal()">닫기</button></div>'
    + '<div id="qv">' + quoteHTML(q) + '</div>', true);"""
b = """  QDOC = q;
  openModal('<div class="mhead noprint"><h3>견적서 미리보기</h3><div class="spacer"></div>'
    + '<button class="btn btn-ghost btn-sm" onclick="editQuote(\\'' + id + '\\')">수정</button> '
    + '<button class="btn btn-ghost btn-sm" id="qv-dl" onclick="quotePdf()">⬇ PDF 저장</button> '
    + '<button class="btn btn-brand btn-sm" id="qv-mail" onclick="quoteMail()">📎 PDF 첨부해 메일</button> '
    + '<button class="btn btn-ghost btn-sm" onclick="fitPrint()">인쇄</button> '
    + '<button class="btn btn-ghost btn-sm" onclick="closeModal()">닫기</button></div>'
    + '<div id="qv">' + quoteHTML(q) + '</div>', true);"""
assert a in s, 'preview buttons'
s = s.replace(a, b)

BLOCK = r'''/* ══ 토스트 ═══════════════════════════════════════════════ */
var TT = null;
function toast(msg){
  var el = $("toast"); if (!el) return;
  el.textContent = msg; el.style.opacity = "1";
  clearTimeout(TT); TT = setTimeout(function(){ el.style.opacity = "0"; }, 2600);
}

/* ══ PDF 생성 (html2canvas + jsPDF 지연로드) ═══════════════
   영업웹앱 elToPdf / dlPdfBlob 과 같은 방식 · 첨부 규격도 동일
   결과 = {fileName, mimeType, base64} */
function loadPdfLibs(){
  return new Promise(function(resolve, reject){
    if (window.html2canvas && window.jspdf) { resolve(); return; }
    var need = [];
    if (!window.html2canvas) need.push("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js");
    if (!window.jspdf)      need.push("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js");
    var left = need.length, failed = false;
    need.forEach(function(src){
      var sc = document.createElement("script"); sc.src = src;
      sc.onload  = function(){ if (--left === 0 && !failed) resolve(); };
      sc.onerror = function(){ failed = true; reject(new Error("PDF 라이브러리 로드 실패")); };
      document.head.appendChild(sc);
    });
  });
}
async function elToPdf(el, fileName){
  if (!el) throw new Error("대상 없음");
  await loadPdfLibs();
  try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch(e){}
  var canvas = await html2canvas(el, {scale:2, backgroundColor:"#ffffff", useCORS:true, logging:false});
  var img = canvas.toDataURL("image/jpeg", 0.92);
  var pdf = new window.jspdf.jsPDF({unit:"mm", format:"a4", orientation:"portrait"});
  var pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
  var iw = pw, ih = canvas.height * pw / canvas.width, y = 0;
  if (ih <= ph) pdf.addImage(img, "JPEG", 0, 0, iw, ih);
  else {                                    // 길면 여러 장으로 자름
    var rest = ih;
    while (rest > 0) {
      pdf.addImage(img, "JPEG", 0, y, iw, ih);
      rest -= ph;
      if (rest > 0) { pdf.addPage(); y -= ph; }
    }
  }
  return {fileName:fileName || "문서.pdf", mimeType:"application/pdf",
          base64:pdf.output("datauristring").split(",")[1]};
}
function dlPdfBlob(att){
  var bin = atob(att.base64), arr = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  var url = URL.createObjectURL(new Blob([arr], {type:"application/pdf"})),
      a = document.createElement("a");
  a.href = url; a.download = att.fileName;
  document.body.appendChild(a); a.click();
  setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

var QDOC = null;
function qFile(q){ return "견적서_" + (q.client || "") + "_" + q.id + ".pdf"; }

window.quotePdf = async function(){
  var b = $("qv-dl"); if (b) { b.disabled = true; b.textContent = "PDF 만드는 중…"; }
  try {
    dlPdfBlob(await elToPdf($("qv"), qFile(QDOC)));
    toast("⬇ 견적서 PDF 저장됨");
  } catch(e){ toast("PDF 생성 실패 — 인쇄 버튼으로 저장하세요"); }
  if (b) { b.disabled = false; b.textContent = "⬇ PDF 저장"; }
};

/* ══ 메일 — 영업웹앱과 같은 구조 (하이웍스 발송 + 첨부) ════
   ⚠ 발송은 이 화면의 [하이웍스로 보내기] 버튼을 눌러야만 실행됨 */
var API_URL = "";        // 백엔드 주소 (Apps Script / 워커). 비어 있으면 발송 대신 안내만
var MAIL_ATTACH = [];

function apiPost(action, payload){
  if (!API_URL) return Promise.resolve({ok:false, error:"백엔드 미연결 (API_URL 미설정)"});
  return fetch(API_URL, {
    method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"},
    body: JSON.stringify(Object.assign({action:action}, payload))
  }).then(function(r){ return r.json(); });
}
function attRender(){
  var el = $("mail-att"); if (!el) return;
  if (!MAIL_ATTACH.length) {
    el.innerHTML = '<span style="font-size:12.5px;color:var(--hint)">첨부파일 없음</span>';
    return;
  }
  el.innerHTML = MAIL_ATTACH.map(function(f, i){
    return '<div class="att"><span>📎</span><span class="nm">' + esc(f.fileName) + '</span>'
      + '<span class="sz num">' + fmt(Math.round(f.base64.length * 0.75 / 1024)) + ' KB</span>'
      + '<button class="btn btn-ghost btn-sm" onclick="attDel(' + i + ')">×</button></div>';
  }).join("");
}
window.attDel = function(i){ MAIL_ATTACH.splice(i, 1); attRender(); };
window.attPick = function(input){
  var files = input.files, left = files.length;
  if (!left) return;
  Array.prototype.forEach.call(files, function(file){
    var rd = new FileReader();
    rd.onload = function(e){
      MAIL_ATTACH.push({fileName:file.name, mimeType:file.type || "application/octet-stream",
                        base64:String(e.target.result).split(",")[1]});
      if (--left === 0) attRender();
    };
    rd.readAsDataURL(file);
  });
  input.value = "";
};

function fillTpl(t, q){
  var ceo = (S.clients.filter(function(c){ return c.name === q.client; })[0] || {}).ceo || "담당자";
  return String(t || "")
    .replace(/\{브랜드\}/g, q.client || "")
    .replace(/\{품목\}/g, q.item || "")
    .replace(/\{담당자\}/g, ceo);
}
function openMail(q, att){
  var c = S.clients.filter(function(x){ return x.name === q.client; })[0] || {};
  var tpl = S.emails.filter(function(e){ return /견적/.test(e.name); })[0]
            || S.emails[0] || {subject:"", body:""};
  MAIL_ATTACH = att ? [att] : [];

  var r = calcQuote(q);
  var detail = "\n[견적 요약]\n"
    + "· 품목: " + (q.item || "-") + "\n"
    + "· 발주수량: " + fmt(q.order) + " set\n"
    + "· 공급단가: " + fmt(r.final) + " 원 (1 set, VAT 별도)\n"
    + "· 총 금액: " + fmt(r.amount) + " 원\n"
    + (r.tiers.length
        ? "· 수량 구간: " + r.tiers.map(function(t){
            return fmt(t.qty) + "set " + fmt(t.price) + "원"; }).join(" / ") + "\n"
        : "");

  $("modal2").innerHTML =
    '<div class="modal" onclick="if(event.target===this)mailClose()"><div class="box">'
    + '<div class="mhead"><h3>메일 보내기</h3><div class="spacer"></div>'
    + '<button class="btn btn-ghost btn-sm" onclick="mailClose()">닫기</button></div>'
    + '<div style="font-size:12.5px;color:var(--hint);margin-bottom:14px">'
    + esc(q.client || "-") + ' · 견적서 메일'
    + (c.email ? "" : "  (등록된 이메일 없음 — 직접 입력하거나 브랜드사 CRM 에 추가)") + '</div>'
    + '<div class="field"><label>받는사람</label>'
    + '<input id="mail-to" value="' + esc(c.email || "") + '" placeholder="name@example.com"></div>'
    + '<div class="field"><label>문안 템플릿</label><div class="row">'
    + S.emails.map(function(e, i){
        return '<button class="btn btn-ghost btn-sm" onclick="mailPick(' + i + ')">'
             + esc(e.name) + '</button>';
      }).join("") + '</div></div>'
    + '<div class="field"><label>제목</label>'
    + '<input id="mail-subj" value="' + esc(fillTpl(tpl.subject, q)) + '"></div>'
    + '<div class="field"><label>본문</label><textarea id="mail-body" rows="9">'
    + esc(fillTpl(tpl.body, q) + "\n" + detail) + '</textarea></div>'
    + '<div class="field"><label>첨부</label><div id="mail-att"></div>'
    + '<input type="file" multiple style="margin-top:8px" onchange="attPick(this)"></div>'
    + '<div class="row" style="justify-content:flex-end;margin-top:6px">'
    + '<button class="btn btn-ghost btn-sm" onclick="mailCopy()">본문 복사</button>'
    + '<button class="btn btn-ghost btn-sm" onclick="mailDraft()">메일앱으로 열기</button>'
    + '<button class="btn btn-brand" onclick="mailSend()">하이웍스로 보내기</button></div>'
    + '</div></div>';
  attRender();
}
window.mailPick = function(i){
  var e = S.emails[i], q = QDOC;
  if (!e || !q) return;
  $("mail-subj").value = fillTpl(e.subject, q);
  $("mail-body").value = fillTpl(e.body, q);
};
window.mailClose = function(){ $("modal2").innerHTML = ""; };
window.mailCopy  = function(){
  try { navigator.clipboard.writeText($("mail-body").value); toast("본문 복사됨"); } catch(e){}
};
window.mailDraft = function(){
  // mailto 는 파일 첨부가 안 됨 (프로토콜 한계)
  if (MAIL_ATTACH.length) toast("메일앱 초안은 첨부가 안 됩니다 — 첨부하려면 하이웍스로 보내기");
  location.href = "mailto:" + encodeURIComponent($("mail-to").value)
    + "?subject=" + encodeURIComponent($("mail-subj").value)
    + "&body=" + encodeURIComponent($("mail-body").value);
};
window.mailSend = function(){
  var to = ($("mail-to").value || "").trim();
  if (!to) { toast("받는사람 이메일을 입력하세요"); return; }
  var subj = $("mail-subj").value || "", body = $("mail-body").value || "";
  // 이 확인창을 통과해야만 실제 발송 — 자동 발송 없음
  if (!confirm(to + " 로 메일을 보낼까요?"
      + (MAIL_ATTACH.length ? "\n첨부 " + MAIL_ATTACH.length + "개" : "")
      + "\n\n제목: " + subj)) return;
  if (!API_URL) {
    toast("백엔드 미연결 — API_URL 설정 후 발송됩니다. 지금은 PDF 저장 후 직접 첨부하세요");
    return;
  }
  var btn = document.querySelector("#modal2 .btn-brand");
  if (btn) { btn.disabled = true; btn.textContent = "보내는 중…"; }
  var html = '<div style="font-family:Malgun Gothic,sans-serif;font-size:14px;line-height:1.7;'
           + 'color:#222;white-space:pre-wrap;">' + esc(body) + '</div>';
  apiPost("sendMail", {mail:{to:to, subject:subj, html:html, text:body, attachments:MAIL_ATTACH}})
    .then(function(r){
      if (r && r.ok) {
        toast(to + " 발송 완료" + (r.attached ? " · 첨부 " + r.attached + "개" : ""));
        mailClose();
      } else toast("발송 실패: " + ((r && r.error) || "권한/연결 확인"));
      if (btn) { btn.disabled = false; btn.textContent = "하이웍스로 보내기"; }
    })
    .catch(function(){
      toast("발송 오류(연결)");
      if (btn) { btn.disabled = false; btn.textContent = "하이웍스로 보내기"; }
    });
};

window.quoteMail = async function(){
  var b = $("qv-mail"); if (b) { b.disabled = true; b.textContent = "PDF 만드는 중…"; }
  var att = null;
  try { att = await elToPdf($("qv"), qFile(QDOC)); }
  catch(e){ toast("PDF 첨부 실패 — PDF 저장 후 직접 첨부하세요"); }
  if (b) { b.disabled = false; b.textContent = "📎 PDF 첨부해 메일"; }
  openMail(QDOC, att);
  if (att) toast("견적서 PDF 첨부됨 — 받는사람 확인 후 발송");
};

/* ══ 자체 점검 — 콘솔에서 selfTest() ═══════════════════════ */'''

anchor = "/* ══ 자체 점검 — 콘솔에서 selfTest() ═══════════════════════ */"
assert anchor in s, 'anchor'
s = s.replace(anchor, BLOCK)

io.open(P, 'w', encoding='utf-8').write(s)
print('app patched')
