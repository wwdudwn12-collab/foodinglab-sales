# -*- coding: utf-8 -*-
"""관리앱 ↔ 홈페이지 상담폼 연동 — /api/lead 에서 리드 가져오기"""
import io, os

P = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fl_app.js')
s = io.open(P, encoding='utf-8').read()

# 1) 설정값 — 홈페이지 API 주소 / 관리키 (설정·팀 화면에서 입력)
a = 'var API_URL = "";        // 백엔드 주소 (Apps Script / 워커). 비어 있으면 발송 대신 안내만'
b = '''var API_URL = "";        // 메일 발송 백엔드 (Apps Script / 워커). 비어 있으면 발송 안 함
/* 홈페이지 상담폼(foodinglab.pages.dev)에서 리드를 받아오는 설정 — 설정·팀 화면에서 입력 */
function leadCfg(){
  return {
    url: (S.leadApi && S.leadApi.url) || "https://foodinglab.pages.dev/api/lead",
    key: (S.leadApi && S.leadApi.key) || ""
  };
}'''
assert a in s, 'api url'
s = s.replace(a, b)

# 2) 리드 가져오기
anchor = "/* ══ 견적서 출력 ═══════════════════════════════════════════ */"
BLOCK = r'''/* ══ 홈페이지 상담폼 → 리드 가져오기 ═══════════════════════
   폼 접수분은 Cloudflare KV 에 쌓이고, 여기서 당겨와 상담 리드에 합친다.
   at(접수시각)을 원본 키로 써서 여러 번 눌러도 중복이 안 생긴다. */
window.pullLeads = async function(){
  var c = leadCfg();
  if (!c.key) { toast("설정·팀 화면에서 관리키를 먼저 넣어주세요"); go("set"); return; }

  var btn = $("pull-btn");
  if (btn) { btn.disabled = true; btn.textContent = "가져오는 중…"; }
  try {
    var r = await fetch(c.url + "?limit=200", { headers: {"X-Admin-Key": c.key} });
    var j = await r.json();
    if (!j.ok) throw new Error(j.error || "조회 실패");

    var have = {};
    S.leads.forEach(function(l){ if (l.srcId) have[l.srcId] = 1; });

    var added = 0;
    j.leads.forEach(function(x){
      if (have[x.id]) return;                       // 이미 가져온 건 건너뜀
      S.leads.unshift({
        id: uid("L"), srcId: x.id,
        date: String(x.at || "").slice(0, 10),
        company: x.company || "(미입력)", name: x.name || "", phone: x.phone || "",
        email: x.email || "", channel: x.source || "홈페이지 폼",
        item: x.item || "", moq: n(x.moq), stage: "상담접수",
        memo: [x.stage, x.form, x.memo].filter(Boolean).join(" · ")
      });
      added++;
    });
    save();
    toast(added ? added + "건 가져왔습니다" : "새로 들어온 상담이 없습니다");
    go("lead");
  } catch (e) {
    toast("가져오기 실패: " + e.message);
    if (btn) { btn.disabled = false; btn.textContent = "홈페이지 상담 가져오기"; }
  }
};

''' + anchor
assert anchor in s, 'anchor'
s = s.replace(anchor, BLOCK, 1)

# 3) 리드 화면에 버튼
a3 = """    + cardH("상담 리드", '<button class="btn btn-brand btn-sm" onclick="editLead()">+ 리드 추가</button>')"""
b3 = """    + cardH("상담 리드",
        '<button class="btn btn-ghost btn-sm" id="pull-btn" onclick="pullLeads()">홈페이지 상담 가져오기</button> '
      + '<button class="btn btn-brand btn-sm" onclick="editLead()">+ 리드 추가</button>')"""
assert a3 in s, 'lead card'
s = s.replace(a3, b3)

# 4) 설정 화면에 연동 입력칸
a4 = """    + '<div class="card">' + cardH("연동 예정")"""
b4 = """    + '<div class="card">' + cardH("홈페이지 상담폼 연동")
    + '<div style="font-size:13px;color:var(--hint);margin:-8px 0 14px">'
    + 'foodinglab.pages.dev 상담폼으로 들어온 문의를 상담 리드로 가져옵니다</div>'
    + '<div class="qform" style="max-width:560px">'
    + '<div class="field"><label>API 주소</label><input value="' + esc(leadCfg().url)
    + '" onchange="S.leadApi=Object.assign({},S.leadApi,{url:this.value});save()"></div>'
    + '<div class="field"><label>관리키 (ADMIN_KEY)</label><input type="password" value="'
    + esc(leadCfg().key) + '" placeholder="Cloudflare Pages 환경변수에 넣은 값"'
    + ' onchange="S.leadApi=Object.assign({},S.leadApi,{key:this.value});save()"></div></div>'
    + '<button class="btn btn-brand btn-sm" onclick="pullLeads()">지금 가져오기</button>'
    + '<div style="margin-top:10px;font-size:12.5px;color:var(--amber)">'
    + '⚠ 관리키는 이 브라우저에만 저장됩니다. 공용 PC에서는 넣지 마세요.</div></div>'

    + '<div class="card">' + cardH("연동 예정")"""
assert a4 in s, 'settings'
s = s.replace(a4, b4)

# 5) 시드에 빈 설정
a5 = '  formulaMemo: ""'
b5 = '  formulaMemo: "",\n  leadApi: {url:"https://foodinglab.pages.dev/api/lead", key:""}'
assert a5 in s, 'seed'
s = s.replace(a5, b5)

io.open(P, 'w', encoding='utf-8').write(s)
print('앱: 상담폼 연동 추가')
