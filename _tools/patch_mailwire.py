# -*- coding: utf-8 -*-
"""메일 발송을 영업웹앱과 같은 백엔드(Apps Script sendMail)로 연결"""
import io, os

P = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fl_app.js')
s = io.open(P, encoding='utf-8').read()

# 1) API 경로 + PIN
a = 'var API_URL = "";        // 메일 발송 백엔드 (Apps Script / 워커). 비어 있으면 발송 안 함'
b = '''/* 메일 발송 — 영업웹앱과 같은 백엔드를 그대로 쓴다.
   /api → Cloudflare Pages Function(functions/api.js) → Apps Script sendSalesMail
   발신자는 백엔드에 고정: youngjoo@seoraebio.com (서래바이오 박영주)
   PIN 은 설정·팀 화면에서 넣고 이 브라우저에만 저장된다. */
var API_URL = "/api";
function mailPin(){ return (S.mail && S.mail.pin) || ""; }'''
assert a in s, 'api url'
s = s.replace(a, b)

# 2) apiPost 에 pin 실어 보내기
a2 = """function apiPost(action, payload){
  if (!API_URL) return Promise.resolve({ok:false, error:"백엔드 미연결 (API_URL 미설정)"});
  return fetch(API_URL, {
    method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"},
    body: JSON.stringify(Object.assign({action:action}, payload))
  }).then(function(r){ return r.json(); });
}"""
b2 = """function apiPost(action, payload){
  if (!API_URL) return Promise.resolve({ok:false, error:"백엔드 미연결"});
  return fetch(API_URL, {
    method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"},
    body: JSON.stringify(Object.assign({action:action, pin:mailPin()}, payload))
  }).then(function(r){ return r.json(); });
}"""
assert a2 in s, 'apiPost'
s = s.replace(a2, b2)

# 3) 발송 — PIN 없으면 막고, 백엔드 응답 형식(ok/error) 그대로 처리
a3 = """  if (!API_URL) {
    toast("백엔드 미연결 — API_URL 설정 후 발송됩니다. 지금은 PDF 저장 후 직접 첨부하세요");
    return;
  }"""
b3 = """  if (!mailPin()) {
    toast("설정·팀 화면에서 발송 PIN을 먼저 넣어주세요");
    mailClose(); go("set");
    return;
  }"""
assert a3 in s, 'send guard'
s = s.replace(a3, b3)

s = s.replace('<button class="btn btn-brand" onclick="mailSend()">하이웍스로 보내기</button>',
              '<button class="btn btn-brand" onclick="mailSend()">메일 보내기</button>')
s = s.replace('if (btn) { btn.disabled = false; btn.textContent = "하이웍스로 보내기"; }',
              'if (btn) { btn.disabled = false; btn.textContent = "메일 보내기"; }')
s = s.replace('if (MAIL_ATTACH.length) toast("메일앱 초안은 첨부가 안 됩니다 — 첨부하려면 하이웍스로 보내기");',
              'if (MAIL_ATTACH.length) toast("메일앱 초안은 첨부가 안 됩니다 — 첨부하려면 [메일 보내기]");')

# 4) 보내는사람 표시 + 설정 화면 PIN 입력
a4 = """    + '<div class="field"><label>받는사람</label>'
    + '<input id="mail-to" value="' + esc(c.email || "") + '" placeholder="name@example.com"></div>'"""
b4 = """    + '<div class="field"><label>보내는사람</label>'
    + '<input value="서래바이오 박영주 &lt;youngjoo@seoraebio.com&gt;" disabled '
    + 'style="background:var(--bg2);color:var(--hint)"></div>'
    + '<div class="field"><label>받는사람</label>'
    + '<input id="mail-to" value="' + esc(c.email || "") + '" placeholder="name@example.com"></div>'"""
assert a4 in s, 'mail to'
s = s.replace(a4, b4)

a5 = """    + '<div class="card">' + cardH("홈페이지 상담폼 연동")"""
b5 = """    + '<div class="card">' + cardH("메일 발송")
    + '<div style="font-size:13px;color:var(--hint);margin:-8px 0 14px">'
    + '영업웹앱과 <b>같은 백엔드·같은 발신 계정</b>을 씁니다 — '
    + '보내는사람 <span class="num">youngjoo@seoraebio.com</span> (서래바이오 박영주)</div>'
    + '<div class="qform" style="max-width:420px"><div class="field"><label>발송 PIN</label>'
    + '<input type="password" value="' + esc(mailPin()) + '" placeholder="영업웹앱과 같은 PIN"'
    + ' onchange="S.mail=Object.assign({},S.mail,{pin:this.value});save()"></div></div>'
    + '<div style="font-size:12.5px;color:var(--amber)">'
    + '⚠ PIN은 이 브라우저에만 저장됩니다. 공용 PC에서는 넣지 마세요.</div></div>'

    + '<div class="card">' + cardH("홈페이지 상담폼 연동")"""
assert a5 in s, 'settings'
s = s.replace(a5, b5)

# 5) 시드
a6 = '  leadApi: {url:"https://foodinglab.pages.dev/api/lead", key:""}'
b6 = '  leadApi: {url:"https://foodinglab.pages.dev/api/lead", key:""},\n  mail: {pin:""}'
assert a6 in s, 'seed'
s = s.replace(a6, b6)

# 6) 연동 예정 문구 갱신
s = s.replace("'견적서 PDF 첨부 메일 — 기존 이메일 자동화에 연결'",
              "'견적서 PDF 첨부 메일 — <b>연결 완료</b> (영업웹앱과 같은 백엔드)'")

io.open(P, 'w', encoding='utf-8').write(s)
print('앱: 메일 백엔드 연결')
