# -*- coding: utf-8 -*-
"""대시보드 클릭 연동 — KPI·단계 카드·표 행에서 바로 해당 건으로"""
import io, os

P = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fl_app.js')
s = io.open(P, encoding='utf-8').read()

# 1) tbl — 행 클릭 지원
a = """function tbl(heads, rows, emptyMsg, emptyBtn){"""
b = """function tbl(heads, rows, emptyMsg, emptyBtn, clicks){"""
assert a in s, 'tbl sig'
s = s.replace(a, b)

a2 = """    + (rows.length ? rows.map(function(r){
        return '<tr>' + r.map(function(c, i){
          return '<td class="' + (al[i] || "l") + '">' + c + '</td>';
        }).join("") + '</tr>';
      }).join("")"""
b2 = """    + (rows.length ? rows.map(function(r, ri){
        var on = clicks && clicks[ri];
        return '<tr' + (on ? ' class="clickrow" onclick="' + on + '"' : "") + '>'
          + r.map(function(c, i){
              return '<td class="' + (al[i] || "l") + '">' + c + '</td>';
            }).join("") + '</tr>';
      }).join("")"""
assert a2 in s, 'tbl rows'
s = s.replace(a2, b2)

# 2) metric — 클릭 가능
a3 = """function metric(label, val, sub, chipBg, chipIco){
  return '<div class="metric">'"""
b3 = """function metric(label, val, sub, chipBg, chipIco, onclick){
  return '<div class="metric' + (onclick ? ' clickable" onclick="' + onclick : "") + '">'"""
assert a3 in s, 'metric'
s = s.replace(a3, b3)

# 3) 대시보드 — KPI·단계·표 전부 연결
a4 = """  return '<div class="grid statgrid" style="margin-bottom:18px">'
    + metric("신규 상담", fmt(S.leads.length) + '<small> 건</small>', "인바운드 누적",
             "var(--brand-soft)", SVG(IC.lead))
    + metric("진행 프로젝트", fmt(S.projects.length) + '<small> 건</small>', "출고 전 전체",
             "var(--brand-soft)", SVG(IC.project))
    + metric("정산 대기", fmt(pending) + '<small> 원</small>', S.settles.length + "건",
             "var(--gold-soft)", SVG(IC.settle))
    + metric("결재 대기", fmt(wait) + '<small> 건</small>', wait ? "확인 필요" : "없음",
             "var(--gold-soft)", SVG(IC.appr))
    + '</div>'"""
b4 = """  return '<div class="grid statgrid" style="margin-bottom:18px">'
    + metric("신규 상담", fmt(S.leads.length) + '<small> 건</small>', "인바운드 누적",
             "var(--brand-soft)", SVG(IC.lead), "go('lead')")
    + metric("진행 프로젝트", fmt(S.projects.length) + '<small> 건</small>', "출고 전 전체",
             "var(--brand-soft)", SVG(IC.project), "go('project')")
    + metric("정산 대기", fmt(pending) + '<small> 원</small>', S.settles.length + "건",
             "var(--gold-soft)", SVG(IC.settle), "go('settle')")
    + metric("결재 대기", fmt(wait) + '<small> 건</small>', wait ? "확인 필요" : "없음",
             "var(--gold-soft)", SVG(IC.appr), "go('appr')")
    + '</div>'"""
assert a4 in s, 'kpi'
s = s.replace(a4, b4)

# 단계 카드 클릭 → 그 단계만 보기
a5 = """    + STAGES.map(function(s){
        var on = byStage[s] > 0;
        return '<div style="background:' + (on ? "var(--brand-soft)" : "#f2f4f3")
          + ';border-radius:12px;padding:13px 6px;text-align:center">'
          + '<div style="font-size:11.5px;font-weight:600;color:var(--sub)">' + s + '</div>'
          + '<div style="font-size:21px;font-weight:700;margin-top:2px;letter-spacing:-.03em;color:'
          + (on ? "var(--brand-d)" : "var(--hint)") + '">' + byStage[s] + '</div></div>';
      }).join("") + '</div></div>'"""
b5 = """    + STAGES.map(function(s){
        var on = byStage[s] > 0;
        return '<div class="stagebox' + (on ? " has" : "") + '"'
          + ' onclick="goStage(\\'' + s + '\\')" title="' + s + ' 단계 프로젝트 보기">'
          + '<div class="k">' + s + '</div>'
          + '<div class="v">' + byStage[s] + '</div></div>';
      }).join("") + '</div>'
    + '<div class="hint" style="margin-top:10px;font-size:12.5px;color:var(--hint)">'
    + '숫자를 누르면 그 단계의 프로젝트만 보여줍니다</div></div>'"""
assert a5 in s, 'stage'
s = s.replace(a5, b5)

# 최근 상담 / 납기 임박 행 클릭
a6 = """    + tbl(["일자|c","브랜드","품목","단계|c"],
        S.leads.slice(0, 5).map(function(l){
          return ['<span class="num">' + esc(l.date) + '</span>', '<b>' + esc(l.company) + '</b>',
                  esc(l.item), stagePill(l.stage)];
        }), "상담 없음") + '</div>'"""
b6 = """    + tbl(["일자|c","브랜드","품목","단계|c"],
        S.leads.slice(0, 5).map(function(l){
          return ['<span class="num">' + esc(l.date) + '</span>', '<b>' + esc(l.company) + '</b>',
                  esc(l.item), stagePill(l.stage)];
        }), "상담 없음", null,
        S.leads.slice(0, 5).map(function(l){ return "editLead('" + l.id + "')"; })) + '</div>'"""
assert a6 in s, 'recent'
s = s.replace(a6, b6)

a7 = """        }), "납기 없음") + '</div></div>';"""
b7 = """        }), "납기 없음", null,
        soon.slice(0, 5).map(function(p){ return "editProject('" + p.id + "')"; })) + '</div></div>';"""
assert a7 in s, 'due'
s = s.replace(a7, b7)

# 4) 단계 필터
a8 = """function setStage(id, s){"""
b8 = """var PSTAGE = null;                       // 대시보드에서 넘어온 단계 필터
window.goStage = function(st){ PSTAGE = st; go("project"); };
function setStage(id, s){"""
assert a8 in s, 'setStage'
s = s.replace(a8, b8)

# 프로젝트 화면 — 필터 적용 + 해제 칩
a9 = """VIEW.project = function(){
  return '<div class="card">'
    + cardH("제조 프로젝트", '<button class="btn btn-brand btn-sm" onclick="editProject()">+ 프로젝트 추가</button>')
    + '<div style="font-size:13px;color:var(--hint);margin-top:-8px">단계를 눌러 진행 상황을 바꿉니다</div></div>'
    + (S.projects.length ? S.projects.map(function(p){"""
b9 = """VIEW.project = function(){
  var list = PSTAGE ? S.projects.filter(function(p){ return p.stage === PSTAGE; }) : S.projects;
  return '<div class="card">'
    + cardH("제조 프로젝트", '<button class="btn btn-brand btn-sm" onclick="editProject()">+ 프로젝트 추가</button>')
    + '<div style="font-size:13px;color:var(--hint);margin-top:-8px">단계를 눌러 진행 상황을 바꿉니다</div>'
    + (PSTAGE
        ? '<div class="row" style="margin-top:12px"><span class="pill pill-blue">'
          + esc(PSTAGE) + ' 단계만 보는 중 · ' + list.length + '건</span>'
          + '<button class="btn btn-ghost btn-sm" onclick="PSTAGE=null;go(\\'project\\')">전체 보기</button></div>'
        : "")
    + '</div>'
    + (list.length ? list.map(function(p){"""
assert a9 in s, 'project view'
s = s.replace(a9, b9)

s = s.replace("""      }).join("") : '<div class="card"><div class="empty">프로젝트 없음</div></div>');""",
              """      }).join("")
      : '<div class="card">' + empty(PSTAGE ? PSTAGE + " 단계 프로젝트가 없습니다" : "프로젝트 없음",
          PSTAGE ? '<button class="btn btn-ghost btn-sm" onclick="PSTAGE=null;go(\\'project\\')">전체 보기</button>' : null)
        + '</div>');""")

io.open(P, 'w', encoding='utf-8').write(s)
print('앱: 대시보드 클릭 연동')

# ── CSS ──
C = os.path.join(os.path.expanduser("~"), "Desktop", "푸딩랩_웹앱", "app.css")
t = io.open(C, encoding='utf-8').read()
t += """

/* ── 대시보드 클릭 연동 ───────────────────────────────────── */
.metric.clickable{cursor:pointer}
.metric.clickable:hover{border-color:var(--brand)}
.stagebox{background:var(--bg3);border:1px solid transparent;border-radius:12px;
  padding:13px 6px;text-align:center;cursor:pointer;transition:.15s}
.stagebox .k{font-size:11.5px;font-weight:600;color:var(--sub)}
.stagebox .v{font-size:21px;font-weight:700;margin-top:2px;letter-spacing:-.03em;color:var(--hint)}
.stagebox.has{background:var(--brand-soft)}
.stagebox.has .v{color:var(--brand-d)}
.stagebox:hover{border-color:var(--brand);transform:translateY(-1px)}
.content table tr.clickrow{cursor:pointer}
.content table tr.clickrow:hover{background:var(--brand-soft)}
"""
io.open(C, 'w', encoding='utf-8').write(t)
print('app.css: 클릭 스타일')
