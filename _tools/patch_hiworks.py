# -*- coding: utf-8 -*-
"""하이웍스 확장 연동 — 영업웹앱과 같은 확장·같은 메시지 규격"""
import io, os, json, re

# ── 1) 확장 manifest 에 푸딩랩 도메인 허용 ────────────────────
MF = os.path.join(os.path.expanduser("~"), "Desktop", "영업사이트 라이브",
                  "하이웍스_확장프로그램", "manifest.json")
m = io.open(MF, encoding='utf-8').read()
if "foodinglab-sales.pages.dev" not in m:
    a = '"https://seoraebio-sales.pages.dev/*"'
    b = '"https://seoraebio-sales.pages.dev/*",\n      "https://foodinglab-sales.pages.dev/*"'
    assert a in m, 'externally_connectable'
    m = m.replace(a, b)
    m = re.sub(r'"version":\s*"4\.7"', '"version": "4.8"', m)
    io.open(MF, 'w', encoding='utf-8').write(m)
    print('manifest: 푸딩랩 도메인 허용 + v4.8')
else:
    print('manifest: 이미 허용됨')

# ── 2) 앱에 확장 연동 ────────────────────────────────────────
P = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fl_app.js')
s = io.open(P, encoding='utf-8').read()

BLOCK = r'''/* ══ 하이웍스 확장 연동 ═════════════════════════════════════
   영업웹앱과 같은 확장(ID 동일)·같은 메시지 규격을 쓴다.
   확장이 깔린 크롬에서만 동작하며, 확장 manifest 의
   externally_connectable 에 이 도메인이 들어 있어야 한다. */
var HIWORKS_EXT_ID = "eomihaddeldafmfmgbkhbkcehhhennof";

function extAvailable(){
  return !!(window.chrome && chrome.runtime && chrome.runtime.sendMessage);
}
function extSend(msg){
  return new Promise(function(resolve, reject){
    if (!extAvailable()) { reject(new Error("하이웍스 확장이 설치된 크롬에서 실행하세요")); return; }
    try {
      chrome.runtime.sendMessage(HIWORKS_EXT_ID, msg, function(r){
        if (chrome.runtime.lastError) { reject(new Error("확장 연결 실패 — 설치·권한 확인")); return; }
        if (!r || r.ok === false) { reject(new Error((r && r.error) || "확장이 처리하지 못했습니다")); return; }
        resolve(r);
      });
    } catch(e){ reject(new Error("확장 호출 오류: " + e.message)); }
  });
}

/* 연결 확인 */
window.extPing = async function(){
  var el = $("ext-state");
  if (el) el.innerHTML = '<span class="pill pill-gray">확인 중…</span>';
  try {
    await extSend({type:"PING"});
    if (el) el.innerHTML = '<span class="pill pill-green">연결됨</span>';
    toast("하이웍스 확장 연결 정상");
  } catch(e){
    if (el) el.innerHTML = '<span class="pill pill-red">' + esc(e.message) + '</span>';
    toast(e.message);
  }
};

/* 프로젝트 일정 → 하이웍스 캘린더 등록 */
window.extSchedule = async function(pid){
  var p = S.projects.filter(function(x){ return x.id === pid; })[0];
  if (!p) return;
  if (!p.due) { toast("납기가 없어 일정으로 보낼 수 없습니다"); return; }
  try {
    var projs = await extSend({type:"GET_HIWORKS_PROJECTS"});
    var list = projs.projects || [];
    if (!list.length) { toast("하이웍스 프로젝트를 찾지 못했습니다"); return; }
    await extSend({type:"CREATE_HIWORKS_SCHEDULE", payload:{
      project_id: list[0].id || list[0].project_id,
      title: "[푸딩랩] " + p.client + " " + p.item + " 납기",
      content: p.form + " · " + fmt(p.order) + " set · 담당 " + p.owner,
      start_date: p.due + " 09:00", end_date: p.due + " 18:00",
      is_all_day: true
    }});
    toast("하이웍스 캘린더에 등록했습니다");
  } catch(e){ toast(e.message); }
};

/* 지출결의 → 하이웍스 기안 화면 열기 */
window.extDraft = async function(aid){
  var a = S.approvals.filter(function(x){ return x.id === aid; })[0];
  if (!a) return;
  try {
    await extSend({type:"OPEN_DRAFT", payload:{
      kind: a.kind, title: a.title, amount: n(a.amount),
      date: a.date, writer: a.writer, memo: "푸딩랩 · " + a.title
    }});
    toast("하이웍스 기안 화면을 열었습니다");
  } catch(e){ toast(e.message); }
};

/* 하이웍스 결재 문서 가져오기 */
window.extDocs = async function(){
  var btn = $("ext-docs-btn");
  if (btn) { btn.disabled = true; btn.textContent = "불러오는 중…"; }
  try {
    var r = await extSend({type:"GET_HIWORKS_DOCS", maxPages:6});
    var docs = r.docs || r.list || [];
    var added = 0, have = {};
    S.approvals.forEach(function(x){ if (x.hwNo) have[x.hwNo] = 1; });
    docs.forEach(function(d){
      var no = d.docNo || d.doc_no || d.no;
      if (!no || have[no]) return;
      S.approvals.unshift({
        id: uid("A"), hwNo: no,
        date: String(d.date || d.regDate || "").slice(0, 10) || today(),
        title: d.title || d.subject || "(제목 없음)",
        kind: d.formName || d.kind || "하이웍스",
        amount: n(d.amount), writer: d.writer || "", status: d.status || "승인"
      });
      added++;
    });
    save();
    toast(added ? added + "건 가져왔습니다" : "새 문서가 없습니다");
    go("appr");
  } catch(e){
    toast(e.message);
    if (btn) { btn.disabled = false; btn.textContent = "하이웍스 문서 가져오기"; }
  }
};

'''
anchor = "/* ══ 견적서 출력 ═══════════════════════════════════════════ */"
assert anchor in s, 'anchor'
s = s.replace(anchor, BLOCK + anchor, 1)

# 결재 화면 — 하이웍스 버튼
a = """    + cardH("지출·결재", '<button class="btn btn-brand btn-sm" onclick="editAppr()">+ 기안</button>')"""
b = """    + cardH("지출·결재",
        '<button class="btn btn-ghost btn-sm" id="ext-docs-btn" onclick="extDocs()">하이웍스 문서 가져오기</button> '
      + '<button class="btn btn-brand btn-sm" onclick="editAppr()">+ 기안</button>')"""
assert a in s, 'appr card'
s = s.replace(a, b)

a2 = """            a.status === "결재대기"
              ? '<button class="btn btn-brand btn-sm" onclick="setAppr(\\'' + a.id + '\\',\\'승인\\')">승인</button> '
                + '<button class="btn btn-ghost btn-sm" onclick="setAppr(\\'' + a.id + '\\',\\'반려\\')">반려</button>'
              : '<button class="btn btn-ghost btn-sm" onclick="setAppr(\\'' + a.id + '\\',\\'결재대기\\')">되돌리기</button>'];"""
b2 = """            (a.status === "결재대기"
              ? '<button class="btn btn-brand btn-sm" onclick="setAppr(\\'' + a.id + '\\',\\'승인\\')">승인</button> '
                + '<button class="btn btn-ghost btn-sm" onclick="setAppr(\\'' + a.id + '\\',\\'반려\\')">반려</button>'
              : '<button class="btn btn-ghost btn-sm" onclick="setAppr(\\'' + a.id + '\\',\\'결재대기\\')">되돌리기</button>')
            + ' <button class="btn btn-soft btn-sm" onclick="extDraft(\\'' + a.id + '\\')">하이웍스 기안</button>'];"""
assert a2 in s, 'appr row'
s = s.replace(a2, b2)

# 프로젝트 카드 — 캘린더 보내기
a3 = """          + '<button class="btn btn-brand btn-sm" onclick="quoteFromProject(\\'' + p.id + '\\')">견적 만들기</button></div>'"""
b3 = """          + '<button class="btn btn-ghost btn-sm" onclick="extSchedule(\\'' + p.id + '\\')">하이웍스 일정</button>'
          + '<button class="btn btn-brand btn-sm" onclick="quoteFromProject(\\'' + p.id + '\\')">견적 만들기</button></div>'"""
assert a3 in s, 'project card'
s = s.replace(a3, b3)

# 설정 화면 — 확장 상태
a4 = """    + '<div class="card">' + cardH("메일 발송")"""
b4 = """    + '<div class="card">' + cardH("하이웍스 확장 연동")
    + '<div style="font-size:13px;color:var(--hint);margin:-8px 0 12px">'
    + '영업웹앱과 <b>같은 확장</b>을 씁니다. 확장이 깔린 크롬에서만 동작하며, '
    + '확장을 최신(v4.8)으로 새로고침해야 이 주소가 허용됩니다.</div>'
    + '<div class="row"><span id="ext-state"><span class="pill pill-gray">미확인</span></span>'
    + '<button class="btn btn-ghost btn-sm" onclick="extPing()">연결 확인</button></div>'
    + '<div style="margin-top:12px;font-size:12.5px;color:var(--sub);line-height:1.9">'
    + '· 지출·결재 → <b>하이웍스 기안</b> / <b>문서 가져오기</b><br>'
    + '· 제조 프로젝트 → <b>하이웍스 일정</b> (납기를 캘린더로)</div></div>'

    + '<div class="card">' + cardH("메일 발송")"""
assert a4 in s, 'settings'
s = s.replace(a4, b4)

io.open(P, 'w', encoding='utf-8').write(s)
print('앱: 하이웍스 확장 연동 추가')
