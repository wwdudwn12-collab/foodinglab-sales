/* ══ 유틸 ══════════════════════════════════════════════════ */
var $ = function(id){ return document.getElementById(id); };
function n(v){ v = Number(v); return isFinite(v) ? v : 0; }
function fmt(v, d){ d = d || 0;
  return n(v).toLocaleString("ko-KR", {minimumFractionDigits:d, maximumFractionDigits:d}); }
function esc(s){ return String(s == null ? "" : s)
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function pad(v){ return String(v).length < 2 ? "0" + v : String(v); }
function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate()); }
function today(){ return ymd(new Date()); }
function uid(p){ return p + "-" + Math.random().toString(36).slice(2, 7); }
function dday(s){
  if (!s) return null;
  return Math.round((new Date(s) - new Date(today())) / 86400000);
}
function krNum(v){
  v = Math.floor(n(v));
  if (!v) return "영";
  var D = "영일이삼사오육칠팔구", S = ["","십","백","천"], B = ["","만","억","조"];
  var s = String(v), out = "", grp = [];
  for (var i = s.length; i > 0; i -= 4) grp.push(s.slice(Math.max(0, i-4), i));
  for (var g = grp.length - 1; g >= 0; g--) {
    var part = grp[g], t = "";
    for (var j = 0; j < part.length; j++) {
      var dig = +part[j], pos = part.length - 1 - j;
      if (dig) t += D[dig] + S[pos];
    }
    if (t) out += t + B[g];
  }
  return out;
}

/* ══ 상태 ══════════════════════════════════════════════════ */
var KEY = "fl.v3";
var STAGES = ["상담접수","배합설계","견적발송","서류·인증","디자인","생산","출고완료"];

var SEED = {
  leads: [
    {id:uid("L"), date:"2026-08-28", name:"김도현", company:"온리브랜드", channel:"홈페이지 폼",
     item:"이너뷰티 젤리스틱", moq:1000, stage:"상담접수", phone:"010-2211-8843",
     memo:"공구 셀러 2년차. MOQ 부담 커서 100개 스타트 문의"},
    {id:uid("L"), date:"2026-08-27", name:"박서연", company:"헬로우핏", channel:"카카오 채널",
     item:"단백질 분말 스틱", moq:3000, stage:"배합설계", phone:"010-8890-1102",
     memo:"프로틴 20g 목표. 대체당 요청"},
    {id:uid("L"), date:"2026-08-25", name:"이정우", company:"루틴랩", channel:"인스타 DM",
     item:"멀티비타민 정제", moq:2000, stage:"견적발송", phone:"010-3344-7781",
     memo:"경쟁사 견적 대비 확인 중"},
    {id:uid("L"), date:"2026-08-21", name:"최민아", company:"데이앤나잇", channel:"지인 소개",
     item:"수면 유도 구미", moq:1000, stage:"서류·인증", phone:"010-5567-2290",
     memo:"기능성 표시 가능 여부 확인 필요"},
    {id:uid("L"), date:"2026-08-14", name:"정하늘", company:"그린어스", channel:"박람회",
     item:"식이섬유 스틱", moq:2000, stage:"디자인", phone:"010-7788-4410",
     memo:"단상자 디자인 시안 2차 검토"}
  ],
  clients: [
    {id:uid("C"), name:"온리브랜드", ceo:"김도현", manager:"박영주", grade:"신규",
     phone:"010-2211-8843", email:"onlybrand@example.com", memo:"1차 상담 완료 · MOQ 100 안내"},
    {id:uid("C"), name:"헬로우핏", ceo:"박서연", manager:"박영주", grade:"진행",
     phone:"010-8890-1102", email:"hellofit@example.com", memo:"배합 2안 검토 중"},
    {id:uid("C"), name:"루틴랩", ceo:"이정우", manager:"박영주", grade:"진행",
     phone:"010-3344-7781", email:"routinelab@example.com", memo:"견적 발송 · 회신 대기"},
    {id:uid("C"), name:"그린어스", ceo:"정하늘", manager:"박영주", grade:"진행",
     phone:"010-7788-4410", email:"greenearth@example.com", memo:"디자인 단계"}
  ],
  projects: [
    {id:uid("P"), client:"헬로우핏", item:"단백질 분말 스틱", form:"분말스틱", stage:"배합설계",
     order:3000, due:"2026-10-15", owner:"박영주", memo:"프로틴 20g / 대체당"},
    {id:uid("P"), client:"루틴랩", item:"멀티비타민 정제", form:"정제", stage:"견적발송",
     order:2000, due:"2026-10-02", owner:"박영주", memo:"60정 병캡"},
    {id:uid("P"), client:"데이앤나잇", item:"수면 유도 구미", form:"구미", stage:"서류·인증",
     order:1000, due:"2026-11-05", owner:"박영주", memo:"기능성 표시 검토"},
    {id:uid("P"), client:"그린어스", item:"식이섬유 스틱", form:"분말스틱", stage:"디자인",
     order:2000, due:"2026-09-28", owner:"박영주", memo:"단상자 시안 2차"}
  ],
  schedule: [
    {id:uid("S"), date:"2026-09-02", title:"헬로우핏 배합 미팅", type:"미팅"},
    {id:uid("S"), date:"2026-09-05", title:"루틴랩 견적 회신 예정", type:"팔로우업"},
    {id:uid("S"), date:"2026-09-10", title:"그린어스 디자인 확정", type:"마감"}
  ],
  materials: [
    {name:"분리유청단백(WPI)", price:38000, note:"단백 90%"},
    {name:"알파시클로덱스트린", price:30000, note:""},
    {name:"결정셀룰로스", price:4700, note:"부형제"},
    {name:"스테아린산마그네슘", price:5400, note:"활택제"},
    {name:"HPC", price:65000, note:"결합제"},
    {name:"이산화규소", price:5800, note:"고결방지"},
    {name:"바나바잎추출물", price:32500, note:""},
    {name:"녹차추출물", price:67000, note:""},
    {name:"L-테아닌", price:96000, note:"수면"},
    {name:"비타민미네랄믹스", price:19000, note:""},
    {name:"흑후추추출분말", price:780000, note:"소량"},
    {name:"12종유기농과일야채분말", price:100000, note:""}
  ],
  subs: [
    {name:"병캡", price:350, qty:1, note:""},
    {name:"라벨", price:120, qty:1, note:""},
    {name:"단상자", price:350, qty:1, note:""},
    {name:"실리카겔, 완충비닐, 봉함스티커", price:9, qty:3, note:""},
    {name:"운송용카톤", price:1800, qty:0.02, note:"50입/카톤"}
  ],
  procs: [
    {name:"분말(에어밀, 초미립분쇄)", spec:"kg", price:10000},
    {name:"혼합/충진/제환", spec:"3.75g", price:10000},
    {name:"대환포장", spec:"환", price:20},
    {name:"단케이스 포장", spec:"EA", price:0}
  ],
  tiers: [{qty:100, rate:0.35},{qty:1000, rate:0.15},{qty:2000, rate:0.13},{qty:3000, rate:0.10}],
  yield: 0.03,
  quotes: [],
  settles: [
    {id:uid("T"), client:"그린어스", item:"식이섬유 스틱", amount:9460000, plan:"12개월 무이자",
     paid:2, due:"2026-09-05"},
    {id:uid("T"), client:"루틴랩", item:"멀티비타민 정제", amount:14640000, plan:"일시불",
     paid:0, due:"2026-09-20"}
  ],
  approvals: [
    {id:uid("A"), date:"2026-08-29", title:"원료 선입금 (WPI 200kg)", kind:"지출결의",
     amount:7600000, writer:"박영주", status:"결재대기"},
    {id:uid("A"), date:"2026-08-26", title:"단상자 동판 제작비", kind:"지출결의",
     amount:450000, writer:"박영주", status:"승인"}
  ],
  emails: [
    {id:uid("E"), name:"상담 접수 회신", subject:"[FOODING LAB] {브랜드} 제조 상담 접수되었습니다",
     body:"{담당자}님 안녕하세요, 푸딩랩 박영주입니다.\n\n남겨주신 {품목} 제조 문의 잘 받았습니다.\n푸딩랩은 자체 설비로 MOQ 100개부터 생산이 가능합니다.\n\n편하신 시간 알려주시면 그때 맞춰 연락드리겠습니다."},
    {id:uid("E"), name:"견적 발송", subject:"[FOODING LAB] {브랜드} {품목} 제조 견적서",
     body:"{담당자}님, 요청 주신 {품목} 견적서 첨부드립니다.\n\n수량 구간별 공급단가를 함께 정리했습니다.\n배합·수량 조정하시면 단가가 달라지니 편히 말씀 주세요."},
    {id:uid("E"), name:"서류 안내", subject:"[FOODING LAB] {브랜드} 품목제조보고 진행 안내",
     body:"{담당자}님, 품목제조보고와 시험성적서 진행 상황 공유드립니다."}
  ],
  team: [
    {name:"박영주", role:"영업 총괄", email:"wwdudwn12@gmail.com"},
    {name:"지종환", role:"대표", email:""}
  ],
  formulaMemo: "",
  leadApi: {url:"https://foodinglab.pages.dev/api/lead", key:""},
  mail: {pin:""}
};

var S = load();
function load(){
  try { var raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch(e){}
  return JSON.parse(JSON.stringify(SEED));
}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }
function resetSeed(){
  if (!confirm("샘플 데이터로 되돌립니다. 지금 입력한 내용은 사라집니다.")) return;
  S = JSON.parse(JSON.stringify(SEED)); save(); go(CUR);
}

/* ══ 견적 계산 엔진 ═══════════════════════════════════════
   제조견적서 템플릿(엑셀/HTML)과 동일한 식. 고치면 셋 다 같이 고칠 것.
     함량(mg/단위) = 배합비% × 내용량 ÷ 100
     금액(원)      = 함량 × 단가(원/Kg) × 포장단위 ÷ 1,000,000 × (1+수율)
     총사용량(g)   = 함량 × 포장단위 × 발주수량 ÷ 1,000 × (1+수율)
     가공비(1 set) = 공정 소계(전체 로트) ÷ 발주수량
     제조원가      = 원재료비 + 부자재비 + 가공비          (1 set 기준)
     공급단가      = 제조원가 × (1 + 구간 추가율) → 10원 절사
   ══════════════════════════════════════════════════════ */
function calcQuote(q){
  var y = 1 + n(q.yield), mats = [], tMat = 0, tRatio = 0, tMg = 0, tUse = 0;
  (q.mats || []).forEach(function(m){
    var ratio = n(m.ratio),
        mg    = ratio * n(q.content) / 100,
        cost  = mg * n(m.price) * n(q.unit) / 1000000 * y,
        use   = mg * n(q.unit) * n(q.order) / 1000 * y;
    tRatio += ratio; tMg += mg; tMat += cost; tUse += use;
    mats.push({name:m.name, ratio:ratio, mg:mg, price:n(m.price), cost:cost, use:use, label:m.label});
  });

  var subs = [], tSub = 0;
  (q.subs || []).forEach(function(s){
    var amt = n(s.price) * n(s.qty);
    tSub += amt;
    subs.push({name:s.name, price:n(s.price), qty:n(s.qty), amt:amt, note:s.note});
  });

  var procs = [], tPro = 0;
  (q.procs || []).forEach(function(p){
    var amt = n(p.qty) * n(p.price);
    tPro += amt;
    procs.push({name:p.name, spec:p.spec, qty:n(p.qty), price:n(p.price), amt:amt, note:p.note});
  });

  var proc = n(q.order) ? tPro / n(q.order) : 0,
      cost = tMat + tSub + proc;

  // 가공비가 로트 단위라 구간마다 1 set 원가가 다름 → 구간별로 다시 계산
  var tiers = (q.tiers || []).map(function(t){
    var qty  = n(t.qty),
        pr   = qty ? tPro / qty : 0,
        base = tMat + tSub + pr,
        price = Math.floor(base * (1 + n(t.rate)) / 10) * 10;
    return {qty:qty, rate:n(t.rate), base:base, price:price, amount:price * qty};
  });

  var pick = tiers.filter(function(t){ return t.qty === n(q.order); })[0]
          || tiers.filter(function(t){ return t.qty <= n(q.order); }).pop()
          || tiers[0] || null;

  var add   = pick ? Math.floor(cost * (1 + pick.rate) / 10) * 10 - cost : 0,
      total = cost + add,
      final = Math.floor(total / 10) * 10;

  return {mats:mats, subs:subs, procs:procs, tRatio:tRatio, tMg:tMg, tUse:tUse,
          matCost:tMat, subCost:tSub, proTotal:tPro, proc:proc,
          cost:cost, add:add, total:total, final:final,
          perUnit: n(q.unit) ? final / n(q.unit) : 0,   // 개당(정당) 단가
          tiers:tiers, pick:pick, amount:pick ? final * n(q.order) : 0};
}

function newQuote(over){
  var q = {
    id: uid("Q"), date: today(), client:"", item:"", category:"", form:"", pack:"",
    content: 0, unit: 0, order: 0, dose:"", yield: S.yield,
    mats: [{name:"", ratio:0, price:0}, {name:"", ratio:0, price:0}, {name:"", ratio:0, price:0}],
    subs: JSON.parse(JSON.stringify(S.subs)),
    procs: S.procs.map(function(p){ return {name:p.name, spec:p.spec, qty:0, price:p.price}; }),
    tiers: JSON.parse(JSON.stringify(S.tiers)),
    note: "· 초도비용(동판, 기준규격, 영양성분 등) 별도\n"
        + "· 현 배합비는 가배합비로 제품 진행 시 변경될 수 있음\n"
        + "· 부자재는 가견적으로 디자인 변경에 따라 단가 변동 가능성 有\n"
        + "· 본 견적은 발행일로부터 30일간 유효"
  };
  return Object.assign(q, over || {});
}

/* ══ 내비게이션 ═══════════════════════════════════════════ */
var SVG = function(d){
  return '<span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
       + 'stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px">' + d + '</svg></span>';
};
var IC = {
  dash:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  lead:'<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  pipe:'<path d="M3 5h18M6 12h12M10 19h4"/>',
  client:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M17 11a3 3 0 1 0-2-5.2M15.5 20a5.5 5.5 0 0 0-1.6-4"/>',
  cal:'<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 3v3M16 3v3"/>',
  project:'<path d="M4 6h6l1.5 2H20v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M8 13h8M8 17h5"/>',
  formula:'<path d="M9 3v6.5L4.5 18A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.8-3L15 9.5V3"/><path d="M8 3h8M7.5 14h9"/>',
  quote:'<path d="M6 3h9l3 3v15H6z"/><path d="M9 9h7M9 13h7M9 17h4"/>',
  prod:'<path d="M3.5 8 12 3l8.5 5v8L12 21l-8.5-5z"/><path d="M3.5 8 12 13l8.5-5M12 13v8"/>',
  settle:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18"/>',
  appr:'<path d="M6 3h9l3 3v15H6z"/><path d="M9 12l2 2 4-4"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  docs:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2.5h7a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  base:'<path d="M4 4h9l7 7-9 9-7-7z"/><circle cx="8.5" cy="8.5" r="1.4"/>',
  set:'<circle cx="12" cy="12" r="3.2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>'
};
var MENU = [
  ["dash","대시보드"], ["lead","상담 리드"], ["pipe","파이프라인"], ["client","브랜드사 CRM"], ["cal","캘린더"],
  ["sep"],
  ["project","제조 프로젝트"], ["formula","배합·원료"], ["quote","견적서"], ["prod","생산·납품"],
  ["sep"],
  ["settle","정산·할부"], ["appr","지출·결재"], ["mail","이메일"], ["docs","자료실"],
  ["sep"],
  ["base","기준정보"], ["set","설정·팀"]
];
var TITLES = {
  dash:["대시보드","상담부터 출고까지"], lead:["상담 리드","인바운드 문의 관리"],
  pipe:["파이프라인","단계별 보드"], client:["브랜드사 CRM","고객사 정보"],
  cal:["캘린더","미팅 · 마감 · 납기"], project:["제조 프로젝트","7단계 진행관리"],
  formula:["배합·원료","원료 단가 DB"], quote:["견적서","원가계산 · 구간단가"],
  prod:["생산·납품","로트 진행과 출고"], settle:["정산·할부","입금과 무이자 12개월"],
  appr:["지출·결재","원료 선입금 · 초도비용"], mail:["이메일","단계별 문안"],
  docs:["자료실","구글 드라이브"], base:["기준정보","단가와 수량구간"], set:["설정·팀","담당자 · 연동"]
};

function buildNav(){
  $("nav").innerHTML = MENU.map(function(m){
    if (m[0] === "sep")
      return '<div style="height:1px;background:var(--line);margin:9px 12px"></div>';
    return '<a data-p="' + m[0] + '" onclick="go(\'' + m[0] + '\')">' + SVG(IC[m[0]]) + ' ' + m[1]
      + '<span style="margin-left:auto;font-size:12px;color:var(--hint)" id="tg-' + m[0] + '"></span></a>';
  }).join("");
}
var CUR = "dash";
function go(p){
  CUR = p;
  document.querySelectorAll("#nav a").forEach(function(a){
    a.classList.toggle("active", a.dataset.p === p);
  });
  $("ttl").textContent   = TITLES[p][0];
  $("tdesc").textContent = TITLES[p][1];
  $("page").innerHTML = VIEW[p]();
  var sb = $("sidebar"); if (sb) sb.classList.remove("open");
  badges();
  window.scrollTo(0, 0);
}
function badges(){
  var set = function(id, v){ var e = $(id); if (e) e.textContent = v || ""; };
  set("tg-lead", S.leads.length);
  set("tg-project", S.projects.length);
  set("tg-quote", S.quotes.length);
  set("tg-appr", S.approvals.filter(function(a){ return a.status === "결재대기"; }).length || "");
}

/* ══ 공통 조각 ════════════════════════════════════════════ */
function metric(label, val, sub, chipBg, chipIco, onclick){
  return '<div class="metric' + (onclick ? ' clickable" onclick="' + onclick : "") + '">'
    + (chipIco ? '<div class="chip" style="background:' + chipBg + '">' + chipIco + '</div>' : "")
    + '<div class="l">' + label + '</div>'
    + '<div class="v num">' + val + '</div>'
    + (sub ? '<div style="font-size:12px;color:var(--hint);margin-top:3px">' + sub + '</div>' : "")
    + '</div>';
}
function cardH(t, right, ico){
  return '<div class="card-h">' + (ico ? SVG(IC[ico]) : "") + t
       + (right ? '<div class="spacer"></div>' + right : "") + '</div>';
}
/* 헤더 라벨 뒤에 |r (우측) |c (가운데) 를 붙이면 그 열 전체가 같은 정렬로 그려진다 */
function empty(msg, btn){
  return '<div class="empty">'
    + '<div class="em">' + SVG('<circle cx="12" cy="12" r="8.5"/><path d="M12 8.5v7M8.5 12h7"/>') + '</div>'
    + '<b>' + esc(msg || "아직 없습니다") + '</b>'
    + '<span>' + (btn ? "" : "위 버튼으로 추가하세요") + '</span>'
    + (btn ? '<div style="margin-top:12px">' + btn + '</div>' : "")
    + '</div>';
}

function tbl(heads, rows, emptyMsg, emptyBtn, clicks){
  var al = heads.map(function(h){
    var p = String(h).split("|");
    return p.length > 1 ? p[1] : "l";
  });
  var lab = heads.map(function(h){ return String(h).split("|")[0]; });

  return '<div class="tblwrap"><table><thead><tr>'
    + lab.map(function(h, i){ return '<th class="' + al[i] + '">' + h + '</th>'; }).join("")
    + '</tr></thead><tbody>'
    + (rows.length ? rows.map(function(r, ri){
        var on = clicks && clicks[ri];
        return '<tr' + (on ? ' class="clickrow" onclick="' + on + '"' : "") + '>'
          + r.map(function(c, i){
              return '<td class="' + (al[i] || "l") + '">' + c + '</td>';
            }).join("") + '</tr>';
      }).join("")
      : '<tr><td colspan="' + heads.length + '">' + empty(emptyMsg, emptyBtn) + '</td></tr>')
    + '</tbody></table></div>';
}
function stagePill(s){
  var i = STAGES.indexOf(s);
  return '<span class="pill ' + (i >= 5 ? "pill-green" : i >= 2 ? "pill-amber" : "pill-gray") + '">'
       + esc(s) + '</span>';
}

/* ══ 화면 ═════════════════════════════════════════════════ */
var VIEW = {};

VIEW.dash = function(){
  var byStage = {};
  STAGES.forEach(function(s){ byStage[s] = 0; });
  S.projects.forEach(function(p){ byStage[p.stage] = (byStage[p.stage] || 0) + 1; });
  var quoted  = S.quotes.reduce(function(a, q){ return a + calcQuote(q).amount; }, 0);
  var pending = S.settles.reduce(function(a, t){ return a + n(t.amount); }, 0);
  var wait    = S.approvals.filter(function(a){ return a.status === "결재대기"; }).length;
  var soon    = S.projects.slice().filter(function(p){ return p.due; })
                  .sort(function(a,b){ return a.due.localeCompare(b.due); });

  return '<div class="grid statgrid" style="margin-bottom:18px">'
    + metric("신규 상담", fmt(S.leads.length) + '<small> 건</small>', "인바운드 누적",
             "var(--brand-soft)", SVG(IC.lead), "go('lead')")
    + metric("진행 프로젝트", fmt(S.projects.length) + '<small> 건</small>', "출고 전 전체",
             "var(--brand-soft)", SVG(IC.project), "go('project')")
    + metric("정산 대기", fmt(pending) + '<small> 원</small>', S.settles.length + "건",
             "var(--gold-soft)", SVG(IC.settle), "go('settle')")
    + metric("결재 대기", fmt(wait) + '<small> 건</small>', wait ? "확인 필요" : "없음",
             "var(--gold-soft)", SVG(IC.appr), "go('appr')")
    + '</div>'

    + '<div class="card">' + cardH("단계별 진행", null, 'pipe')
    + '<div class="grid" style="grid-template-columns:repeat(7,1fr);gap:8px">'
    + STAGES.map(function(s){
        var on = byStage[s] > 0;
        return '<div class="stagebox' + (on ? " has" : "") + '"'
          + ' onclick="goStage(\'' + s + '\')" title="' + s + ' 단계 프로젝트 보기">'
          + '<div class="k">' + s + '</div>'
          + '<div class="v">' + byStage[s] + '</div></div>';
      }).join("") + '</div>'
    + '<div class="hint" style="margin-top:10px;font-size:12.5px;color:var(--hint)">'
    + '숫자를 누르면 그 단계의 프로젝트만 보여줍니다</div></div>'

    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px" class="dash2">'
    + '<div class="card">' + cardH("최근 상담", null, 'lead')
    + tbl(["일자|c","브랜드","품목","단계|c"],
        S.leads.slice(0, 5).map(function(l){
          return ['<span class="num">' + esc(l.date) + '</span>', '<b>' + esc(l.company) + '</b>',
                  esc(l.item), stagePill(l.stage)];
        }), "상담 없음", null,
        S.leads.slice(0, 5).map(function(l){ return "editLead('" + l.id + "')"; })) + '</div>'
    + '<div class="card">' + cardH("납기 임박", null, 'cal')
    + tbl(["D-day|c","브랜드","품목","수량|r"],
        soon.slice(0, 5).map(function(p){
          var d = dday(p.due);
          return ['<span class="pill ' + (d <= 14 ? "pill-red" : d <= 30 ? "pill-amber" : "pill-gray")
                  + '">D' + (d >= 0 ? "-" + d : "+" + (-d)) + '</span>',
                  '<b>' + esc(p.client) + '</b>', esc(p.item),
                  '<span class="num">' + fmt(p.order) + '</span>'];
        }), "납기 없음", null,
        soon.slice(0, 5).map(function(p){ return "editProject('" + p.id + "')"; })) + '</div></div>';
};

VIEW.lead = function(){
  return '<div class="card">'
    + cardH("상담 리드",
        '<button class="btn btn-ghost btn-sm" id="pull-btn" onclick="pullLeads()">홈페이지 상담 가져오기</button> '
      + '<button class="btn btn-brand btn-sm" onclick="editLead()">+ 리드 추가</button>')
    + tbl(["일자|c","브랜드 / 담당자","유입|c","희망 품목","희망 수량|r","단계|c","연락처|c","|r"],
        S.leads.map(function(l){
          return ['<span class="num">' + esc(l.date) + '</span>',
            '<b>' + esc(l.company) + '</b><br><span style="color:var(--hint);font-size:12px">' + esc(l.name) + '</span>',
            '<span class="pill pill-gray">' + esc(l.channel) + '</span>', esc(l.item),
            '<span class="num">' + fmt(l.moq) + '</span>', stagePill(l.stage),
            '<span class="num">' + esc(l.phone) + '</span>',
            '<button class="btn btn-ghost btn-sm" onclick="editLead(\'' + l.id + '\')">수정</button> '
            + '<button class="btn btn-soft btn-sm" onclick="leadToProject(\'' + l.id + '\')">프로젝트</button>'];
        }), "리드 없음") + '</div>';
};

VIEW.pipe = function(){
  return '<div class="card">' + cardH("단계별 보드")
    + '<div style="font-size:13px;color:var(--hint);margin:-8px 0 14px">카드를 누르면 다음 단계로 넘어갑니다</div>'
    + '<div class="kan">' + STAGES.map(function(s){
        var items = S.leads.filter(function(l){ return l.stage === s; });
        return '<div class="col"><h4>' + s + '<em>' + items.length + '</em></h4>'
          + items.map(function(l){
              return '<div class="it" onclick="nextStage(\'' + l.id + '\')">'
                + '<b>' + esc(l.company) + '</b><span>' + esc(l.item) + '</span><br>'
                + '<span class="num">' + fmt(l.moq) + ' set</span></div>';
            }).join("") + '</div>';
      }).join("") + '</div></div>';
};
function nextStage(id){
  var l = S.leads.filter(function(x){ return x.id === id; })[0];
  if (!l) return;
  l.stage = STAGES[Math.min(STAGES.indexOf(l.stage) + 1, STAGES.length - 1)];
  save(); go("pipe");
}

VIEW.client = function(){
  return '<div class="card">'
    + cardH("브랜드사", '<button class="btn btn-brand btn-sm" onclick="editClient()">+ 브랜드사 추가</button>')
    + tbl(["브랜드","대표|c","담당|c","등급|c","연락처|c","이메일","메모","|r"],
        S.clients.map(function(c){
          return ['<b>' + esc(c.name) + '</b>', esc(c.ceo), esc(c.manager),
            '<span class="pill ' + (c.grade === "진행" ? "pill-green" : c.grade === "신규" ? "pill-gold" : "pill-gray")
            + '">' + esc(c.grade) + '</span>',
            '<span class="num">' + esc(c.phone) + '</span>', esc(c.email),
            '<span style="color:var(--sub)">' + esc(c.memo) + '</span>',
            '<button class="btn btn-ghost btn-sm" onclick="editClient(\'' + c.id + '\')">수정</button>'];
        }), "브랜드사 없음") + '</div>';
};

var CALM = null;
VIEW.cal = function(){
  var base = CALM ? new Date(CALM) : new Date();
  var y = base.getFullYear(), m = base.getMonth();
  var first = new Date(y, m, 1), start = new Date(y, m, 1 - first.getDay());
  var evs = S.schedule.slice();
  S.projects.forEach(function(p){ if (p.due) evs.push({date:p.due, title:p.client + " 납기", type:"납기"}); });

  var cells = "";
  for (var i = 0; i < 42; i++) {
    var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    var key = ymd(d), out = d.getMonth() !== m;
    cells += '<div class="d' + (out ? " out" : "") + (key === today() ? " today" : "") + '">'
      + '<div class="n num">' + d.getDate() + '</div>'
      + evs.filter(function(e){ return e.date === key; }).map(function(e){
          return '<div class="ev' + (e.type === "납기" || e.type === "마감" ? " gold" : "") + '">'
               + esc(e.title) + '</div>';
        }).join("") + '</div>';
  }

  return '<div class="card">'
    + cardH('<span class="num">' + y + ". " + pad(m + 1) + '</span>',
        '<button class="btn btn-ghost btn-sm" onclick="calMove(-1)">◀</button> '
      + '<button class="btn btn-ghost btn-sm" onclick="calMove(0)">오늘</button> '
      + '<button class="btn btn-ghost btn-sm" onclick="calMove(1)">▶</button> '
      + '<button class="btn btn-brand btn-sm" onclick="editEvent()">+ 일정</button>')
    + '<div class="cal">'
    + ["일","월","화","수","목","금","토"].map(function(d){ return '<div class="dh">' + d + '</div>'; }).join("")
    + cells + '</div></div>'
    + '<div class="card">' + cardH("다가오는 일정")
    + tbl(["일자|c","일정","구분|c"],
        evs.filter(function(e){ return e.date >= today(); })
           .sort(function(a,b){ return a.date.localeCompare(b.date); }).slice(0, 8)
           .map(function(e){
             return ['<span class="num">' + esc(e.date) + '</span>', esc(e.title),
                     '<span class="pill ' + (e.type === "납기" ? "pill-gold" : "pill-gray") + '">'
                     + esc(e.type) + '</span>'];
           }), "일정 없음") + '</div>';
};
function calMove(dir){
  var b = CALM ? new Date(CALM) : new Date();
  CALM = dir === 0 ? null : ymd(new Date(b.getFullYear(), b.getMonth() + dir, 1));
  go("cal");
}

VIEW.project = function(){
  var list = PSTAGE ? S.projects.filter(function(p){ return p.stage === PSTAGE; }) : S.projects;
  return '<div class="card">'
    + cardH("제조 프로젝트", '<button class="btn btn-brand btn-sm" onclick="editProject()">+ 프로젝트 추가</button>')
    + '<div style="font-size:13px;color:var(--hint);margin-top:-8px">단계를 눌러 진행 상황을 바꿉니다</div>'
    + (PSTAGE
        ? '<div class="row" style="margin-top:12px"><span class="pill pill-blue">'
          + esc(PSTAGE) + ' 단계만 보는 중 · ' + list.length + '건</span>'
          + '<button class="btn btn-ghost btn-sm" onclick="PSTAGE=null;go(\'project\')">전체 보기</button></div>'
        : "")
    + '</div>'
    + (list.length ? list.map(function(p){
        var idx = STAGES.indexOf(p.stage), d = dday(p.due);
        return '<div class="card">'
          + '<div class="row" style="margin-bottom:14px">'
          + '<div><b style="font-size:16px;letter-spacing:-.02em">' + esc(p.client) + '</b>'
          + ' <span style="color:var(--sub)">· ' + esc(p.item) + '</span>'
          + '<div style="color:var(--hint);font-size:12.5px;margin-top:2px">'
          + esc(p.form) + ' · ' + fmt(p.order) + ' set · 담당 ' + esc(p.owner)
          + (p.due ? ' · 납기 <span class="num">' + esc(p.due) + '</span>' : "") + '</div></div>'
          + '<div class="spacer"></div>'
          + (p.due ? '<span class="pill ' + (d <= 14 ? "pill-red" : d <= 30 ? "pill-amber" : "pill-gray")
                     + '">D' + (d >= 0 ? "-" + d : "+" + (-d)) + '</span>' : "")
          + '<button class="btn btn-ghost btn-sm" onclick="editProject(\'' + p.id + '\')">수정</button>'
          + '<button class="btn btn-ghost btn-sm" onclick="extSchedule(\'' + p.id + '\')">하이웍스 일정</button>'
          + '<button class="btn btn-brand btn-sm" onclick="quoteFromProject(\'' + p.id + '\')">견적 만들기</button></div>'
          + '<div class="steps">' + STAGES.map(function(s, i){
              return '<div class="st ' + (i === idx ? "on" : i < idx ? "done" : "")
                   + '" onclick="setStage(\'' + p.id + '\',\'' + s + '\')">' + s + '</div>';
            }).join("") + '</div>'
          + '<div class="bar" style="margin-top:11px"><i style="width:'
          + Math.round((idx + 1) / STAGES.length * 100) + '%"></i></div>'
          + (p.memo ? '<div style="margin-top:11px;color:var(--sub);font-size:13px">' + esc(p.memo) + '</div>' : "")
          + '</div>';
      }).join("")
      : '<div class="card">' + empty(PSTAGE ? PSTAGE + " 단계 프로젝트가 없습니다" : "프로젝트 없음",
          PSTAGE ? '<button class="btn btn-ghost btn-sm" onclick="PSTAGE=null;go(\'project\')">전체 보기</button>' : null)
        + '</div>');
};
var PSTAGE = null;                       // 대시보드에서 넘어온 단계 필터
window.goStage = function(st){ PSTAGE = st; go("project"); };
function setStage(id, s){
  var p = S.projects.filter(function(x){ return x.id === id; })[0];
  if (p) { p.stage = s; save(); go("project"); }
}

VIEW.formula = function(){
  return '<div class="card">'
    + cardH("원료 단가 DB", '<button class="btn btn-brand btn-sm" onclick="addMat()">+ 원료 추가</button>')
    + '<div style="font-size:13px;color:var(--hint);margin:-8px 0 14px">'
    + '견적 배합표에서 자동완성으로 끌어씀 · 단가는 원/Kg</div>'
    + tbl(["원료명","단가(원/Kg)|r","비고","|r"],
        S.materials.map(function(m, i){
          return [esc(m.name), '<span class="num">' + fmt(m.price) + '</span>',
                  '<span style="color:var(--hint)">' + esc(m.note) + '</span>',
                  '<button class="btn btn-ghost btn-sm" onclick="delMat(' + i + ')">삭제</button>'];
        }), "원료 없음") + '</div>'
    + '<div class="card">' + cardH("배합 설계 메모")
    + '<textarea rows="5" placeholder="예) 프로틴 20g 목표 — WPI 65% + 알룰로스 8% + 코코아 4% …"'
    + ' oninput="S.formulaMemo=this.value;save()">' + esc(S.formulaMemo || "") + '</textarea></div>';
};
function addMat(){
  var name = prompt("원료명"); if (!name) return;
  var price = prompt("단가 (원/Kg)"); if (price === null) return;
  S.materials.push({name:name, price:n(price), note:""}); save(); go("formula");
}
function delMat(i){ S.materials.splice(i, 1); save(); go("formula"); }

VIEW.quote = function(){
  return '<div class="card">'
    + cardH("발행 견적",
        '<button class="btn btn-ghost btn-sm" id="qr-btn" onclick="pullQuoteReplies()">고객 회신 확인</button> '
      + '<button class="btn btn-brand btn-sm" onclick="editQuote()">+ 새 견적</button>')
    + tbl(["번호|c","일자|c","브랜드","품목","발주수량|r","공급단가|r","총 금액|r","회신|c","|r"],
        S.quotes.map(function(q){
          var r = calcQuote(q);
          return ['<span class="num">' + esc(q.id) + '</span>',
            '<span class="num">' + esc(q.date) + '</span>', '<b>' + esc(q.client) + '</b>', esc(q.item),
            '<span class="num">' + fmt(q.order) + '</span>',
            '<b class="num">' + fmt(r.final) + '</b>',
            '<span class="num">' + fmt(r.amount) + '</span>',
            replyPill(q)
            + (q.reply && q.reply.name
                ? '<br><span style="font-size:11.5px;color:var(--hint)">' + esc(q.reply.name) + '</span>'
                : ""),
            '<button class="btn btn-ghost btn-sm" onclick="editQuote(\'' + q.id + '\')">수정</button> '
            + '<button class="btn btn-brand btn-sm" onclick="viewQuote(\'' + q.id + '\')">견적서</button>'];
        }), "발행한 견적 없음") + '</div>'
    + '<div class="card">' + cardH("계산 방식")
    + '<div style="font-size:13px;color:var(--sub);line-height:2.1">'
    + '함량(mg/단위) = 배합비% × 내용량 ÷ 100<br>'
    + '금액(원) = 함량 × 단가(원/Kg) × 포장단위 ÷ 1,000,000 × (1+수율)<br>'
    + '가공비(1 set) = 공정 소계(전체 로트) ÷ 발주수량<br>'
    + '제조원가 = 원재료비 + 부자재비 + 가공비 <span style="color:var(--hint)">(1 set 기준)</span><br>'
    + '공급단가 = 제조원가 × (1 + 수량구간 추가율) → 10원 절사</div></div>';
};

VIEW.prod = function(){
  var live = S.projects.filter(function(p){ return ["생산","출고완료"].indexOf(p.stage) >= 0; });
  return '<div class="card">' + cardH("생산 중 · 출고", null, 'prod')
    + tbl(["브랜드","품목","제형|c","수량|r","납기|c","단계|c"],
        live.map(function(p){
          return [esc(p.client), esc(p.item), esc(p.form),
            '<span class="num">' + fmt(p.order) + '</span>',
            '<span class="num">' + esc(p.due) + '</span>', stagePill(p.stage)];
        }), "생산 단계 프로젝트 없음") + '</div>'
    + '<div class="card">' + cardH("3PL 물류", null, 'docs')
    + '<div class="grid statgrid">'
    + metric("무료 구간", '3<small> 개월</small>', "초도 출고일 기준")
    + metric("입고 대기", '0<small> 건</small>', "연동 전")
    + metric("출고 완료", fmt(S.projects.filter(function(p){ return p.stage === "출고완료"; }).length) + '<small> 건</small>', "누적")
    + '</div></div>';
};

VIEW.settle = function(){
  var total = S.settles.reduce(function(a, t){ return a + n(t.amount); }, 0);
  return '<div class="grid statgrid" style="margin-bottom:18px">'
    + metric("정산 대기 금액", fmt(total) + '<small> 원</small>', S.settles.length + "건")
    + metric("무이자 할부", fmt(S.settles.filter(function(t){ return t.plan !== "일시불"; }).length) + '<small> 건</small>', "12개월")
    + metric("일시불", fmt(S.settles.filter(function(t){ return t.plan === "일시불"; }).length) + '<small> 건</small>', "")
    + '</div>'
    + '<div class="card">'
    + cardH("정산 현황", '<button class="btn btn-brand btn-sm" onclick="editSettle()">+ 정산 추가</button>')
    + tbl(["브랜드","품목","금액|r","방식|c","진행|c","다음 결제일|c","|r"],
        S.settles.map(function(t){
          var months = t.plan === "일시불" ? 1 : 12, pct = Math.round(n(t.paid) / months * 100);
          return ['<b>' + esc(t.client) + '</b>', esc(t.item),
            '<span class="num">' + fmt(t.amount) + '</span>',
            '<span class="pill ' + (t.plan === "일시불" ? "pill-gray" : "pill-gold") + '">' + esc(t.plan) + '</span>',
            '<div class="bar" style="min-width:92px"><i class="' + (t.plan === "일시불" ? "" : "gold")
            + '" style="width:' + pct + '%"></i></div>'
            + '<span style="font-size:11.5px;color:var(--hint)">' + t.paid + ' / ' + months + ' 회</span>',
            '<span class="num">' + esc(t.due) + '</span>',
            '<button class="btn btn-soft btn-sm" onclick="payOne(\'' + t.id + '\')">입금 체크</button> '
            + '<button class="btn btn-ghost btn-sm" onclick="editSettle(\'' + t.id + '\')">수정</button>'];
        }), "정산 건 없음") + '</div>';
};
function payOne(id){
  var t = S.settles.filter(function(x){ return x.id === id; })[0];
  if (!t) return;
  t.paid = Math.min(n(t.paid) + 1, t.plan === "일시불" ? 1 : 12);
  save(); go("settle");
}

VIEW.appr = function(){
  return '<div class="card">'
    + cardH("지출·결재",
        '<button class="btn btn-ghost btn-sm" id="ext-docs-btn" onclick="extDocs()">하이웍스 문서 가져오기</button> '
      + '<button class="btn btn-brand btn-sm" onclick="editAppr()">+ 기안</button>')
    + '<div style="font-size:13px;color:var(--hint);margin:-8px 0 14px">'
    + '하이웍스 전자결재와 같은 계정으로 연동 예정 — 지금은 앱 안에서만 처리</div>'
    + tbl(["일자|c","제목","구분|c","금액|r","기안자|c","상태|c","|r"],
        S.approvals.map(function(a){
          return ['<span class="num">' + esc(a.date) + '</span>', '<b>' + esc(a.title) + '</b>',
            '<span class="pill pill-gray">' + esc(a.kind) + '</span>',
            '<span class="num">' + fmt(a.amount) + '</span>', esc(a.writer),
            '<span class="pill ' + (a.status === "승인" ? "pill-green" : a.status === "반려" ? "pill-red" : "pill-amber")
            + '">' + esc(a.status) + '</span>',
            (a.status === "결재대기"
              ? '<button class="btn btn-brand btn-sm" onclick="setAppr(\'' + a.id + '\',\'승인\')">승인</button> '
                + '<button class="btn btn-ghost btn-sm" onclick="setAppr(\'' + a.id + '\',\'반려\')">반려</button>'
              : '<button class="btn btn-ghost btn-sm" onclick="setAppr(\'' + a.id + '\',\'결재대기\')">되돌리기</button>')
            + ' <button class="btn btn-soft btn-sm" onclick="extDraft(\'' + a.id + '\')">하이웍스 기안</button>'];
        }), "결재 건 없음") + '</div>';
};
function setAppr(id, st){
  var a = S.approvals.filter(function(x){ return x.id === id; })[0];
  if (a) { a.status = st; save(); go("appr"); }
}

VIEW.mail = function(){
  return '<div class="card">'
    + cardH("문안 템플릿", '<button class="btn btn-brand btn-sm" onclick="addMail()">+ 템플릿</button>')
    + '<div style="font-size:13px;color:var(--hint);margin:-8px 0 14px">'
    + '{브랜드} {담당자} {품목} 자리에 값이 들어감 · 실제 발송은 승인 절차 거쳐 연결</div>'
    + S.emails.map(function(e, i){
        return '<div style="border:1px solid var(--line);border-radius:14px;padding:16px;margin-bottom:12px">'
          + '<div class="row"><b>' + esc(e.name) + '</b><div class="spacer"></div>'
          + '<button class="btn btn-ghost btn-sm" onclick="delMail(' + i + ')">삭제</button></div>'
          + '<div class="field" style="margin-top:11px"><label>제목</label>'
          + '<input value="' + esc(e.subject) + '" oninput="S.emails[' + i + '].subject=this.value;save()"></div>'
          + '<div class="field" style="margin:0"><label>본문</label>'
          + '<textarea rows="4" oninput="S.emails[' + i + '].body=this.value;save()">' + esc(e.body) + '</textarea></div>'
          + '</div>';
      }).join("") + '</div>';
};
function addMail(){
  var name = prompt("템플릿 이름"); if (!name) return;
  S.emails.push({id:uid("E"), name:name, subject:"", body:""}); save(); go("mail");
}
function delMail(i){ S.emails.splice(i, 1); save(); go("mail"); }

var DRIVE = {
  root: "",   // 구글 드라이브 '영업팀 · 푸딩랩' 폴더 URL 넣는 자리
  folders: [
    ["01. 상담·리드",  "인바운드 문의서, 상담 기록, 통화 메모"],
    ["02. 브랜드사",   "브랜드사별 폴더 — 사업자등록증, 계약서, 담당 연락처"],
    ["03. 배합·원료",  "배합 설계안, 원료 규격서, 원료 시험성적서"],
    ["04. 견적",       "발행 견적서 PDF, 원가 계산 엑셀"],
    ["05. 서류·인증",  "품목제조보고서, 시험성적서, 표시사항, HACCP"],
    ["06. 디자인",     "로고, 단상자, 라벨, 상세페이지 원본"],
    ["07. 생산·출고",  "생산 지시서, 로트 기록, 거래명세서, 3PL 입출고"],
    ["08. 정산",       "세금계산서, 입금 내역, 할부 계약"]
  ]
};
VIEW.docs = function(){
  return '<div class="card">' + cardH("구글 드라이브 폴더 구조 (제안)")
    + '<div style="font-size:13px;color:var(--hint);margin:-8px 0 14px">'
    + '영업팀 드라이브 안에 <b>푸딩랩</b>을 별도 루트로 · 같은 구글 계정 사용</div>'
    + (DRIVE.root
        ? '<a class="btn btn-brand btn-sm" href="' + DRIVE.root + '" target="_blank" rel="noopener">드라이브 열기</a>'
        : '<span class="pill pill-amber">루트 폴더 URL 미설정 — DRIVE.root 에 넣으면 버튼 생김</span>')
    + '<div class="grid" style="grid-template-columns:repeat(2,1fr);margin-top:16px">'
    + DRIVE.folders.map(function(f){
        return '<div style="border:1px solid var(--line);border-radius:14px;padding:14px 16px">'
          + '<b style="font-size:13.5px">' + esc(f[0]) + '</b>'
          + '<div style="color:var(--hint);font-size:12.5px;margin-top:3px">' + esc(f[1]) + '</div></div>';
      }).join("") + '</div></div>'
    + '<div class="card">' + cardH("브랜드사별 하위 폴더")
    + '<div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;'
    + 'background:#f2f4f3;border-radius:14px;padding:16px;line-height:1.95;color:var(--sub)">'
    + '02. 브랜드사/<br>&nbsp;&nbsp;└ [브랜드명]/<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;├ 01_계약·사업자<br>&nbsp;&nbsp;&nbsp;&nbsp;├ 02_배합·원료<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;├ 03_견적<br>&nbsp;&nbsp;&nbsp;&nbsp;├ 04_서류·인증<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;├ 05_디자인<br>&nbsp;&nbsp;&nbsp;&nbsp;└ 06_생산·출고</div></div>';
};

VIEW.base = function(){
  return '<div class="notice"><b>여기 값이 모든 견적의 자동계산 기준이 됩니다.</b><br>'
    + '<span class="sub2">수량 구간·수율·부자재·공정 단가를 고치면 이후 만드는 견적에 바로 반영됩니다. '
    + '이미 발행한 견적은 그대로 유지됩니다.</span></div>'
    + '<div class="card">' + cardH("수량 구간별 단가 추가율")
    + '<div style="font-size:13px;color:var(--hint);margin:-8px 0 14px">'
    + '수량이 많을수록 추가율을 낮게. 여기 값이 모든 견적에 적용됨</div>'
    + '<div class="qform tblwrap"><table><colgroup><col style="width:200px"><col style="width:160px"><col></colgroup>'
    + '<thead><tr><th class="l">발주수량</th><th class="l">추가율(%)</th><th></th></tr></thead><tbody>'
    + S.tiers.map(function(t, i){
        return '<tr><td class="l"><input class="num" type="number" value="' + t.qty
          + '" onchange="S.tiers[' + i + '].qty=n(this.value);save()"></td>'
          + '<td class="l"><input class="num" type="number" value="' + (t.rate * 100)
          + '" onchange="S.tiers[' + i + '].rate=n(this.value)/100;save()"></td>'
          + '<td class="l"><button class="btn btn-ghost btn-sm" onclick="S.tiers.splice(' + i
          + ',1);save();go(\'base\')">삭제</button></td></tr>';
      }).join("") + '</tbody></table></div>'
    + '<button class="btn btn-ghost btn-sm" style="margin-top:12px" '
    + 'onclick="S.tiers.push({qty:0,rate:0.1});save();go(\'base\')">+ 구간 추가</button>'
    + '<div style="margin-top:11px;font-size:12.5px;color:var(--hint)">'
    + '발주수량과 같은 구간이 없으면 그 이하 최대 구간, 그것도 없으면 첫 구간이 적용됨</div></div>'

    + '<div class="card">' + cardH("수율 (로스율)")
    + '<div class="qform" style="max-width:220px"><input class="num" type="number" step="0.5" value="'
    + (S.yield * 100) + '" onchange="S.yield=n(this.value)/100;save()"></div>'
    + '<div style="font-size:12.5px;color:var(--hint);margin-top:7px">'
    + '단위 % · 원료 금액과 사용량에 (1+수율)로 반영. 견적서 표면에는 안 나옴</div></div>'

    + '<div class="card">' + cardH("부자재 기본 단가")
    + '<div class="qform tblwrap"><table><colgroup><col><col style="width:130px"><col style="width:110px"><col style="width:200px"></colgroup>'
    + '<thead><tr><th class="l">재료명</th><th class="r">단가(원)</th>'
    + '<th class="r">수량</th><th class="l">비고</th></tr></thead><tbody>'
    + S.subs.map(function(s, i){
        return '<tr><td class="l wide"><input value="' + esc(s.name) + '" onchange="S.subs[' + i + '].name=this.value;save()"></td>'
          + '<td><input class="num" type="number" value="' + s.price + '" onchange="S.subs[' + i + '].price=n(this.value);save()"></td>'
          + '<td><input class="num" type="number" step="0.01" value="' + s.qty + '" onchange="S.subs[' + i + '].qty=n(this.value);save()"></td>'
          + '<td class="l wide"><input value="' + esc(s.note || "") + '" onchange="S.subs[' + i + '].note=this.value;save()"></td></tr>';
      }).join("") + '</tbody></table></div></div>'

    + '<div class="card">' + cardH("공정 단가")
    + '<div class="qform tblwrap"><table><colgroup><col><col style="width:150px"><col style="width:150px"></colgroup>'
    + '<thead><tr><th class="l">공정명</th><th class="l">단위/규격</th>'
    + '<th class="r">단가(원)</th></tr></thead><tbody>'
    + S.procs.map(function(p, i){
        return '<tr><td class="l wide"><input value="' + esc(p.name) + '" onchange="S.procs[' + i + '].name=this.value;save()"></td>'
          + '<td class="l"><input value="' + esc(p.spec || "") + '" onchange="S.procs[' + i + '].spec=this.value;save()"></td>'
          + '<td><input class="num" type="number" value="' + p.price + '" onchange="S.procs[' + i + '].price=n(this.value);save()"></td></tr>';
      }).join("") + '</tbody></table></div>'
    + '<div style="margin-top:12px;font-size:12.5px;color:var(--amber);line-height:1.8">'
    + '⚠ 공정 단가는 제조사 단가표를 받아 채울 것 — 기준 단위(정당/병당/로트당), 최소 로트, '
    + '로트별 단가 차이까지 확인해야 원가가 맞음.<br>'
    + '특히 <b>MOQ 100</b> 구간은 가공비를 100으로 나누면 단가가 폭등함 → 소량 전용 가공비 체계가 따로 필요.</div></div>';
};

VIEW.set = function(){
  return '<div class="card">' + cardH("담당자", null, 'client')
    + tbl(["이름","역할|c","이메일"],
        S.team.map(function(t){ return ['<b>' + esc(t.name) + '</b>', esc(t.role), esc(t.email)]; }),
        "팀원 없음") + '</div>'
    + '<div class="card">' + cardH("하이웍스 확장 연동")
    + '<div style="font-size:13px;color:var(--hint);margin:-8px 0 12px">'
    + '영업웹앱과 <b>같은 확장</b>을 씁니다. 확장이 깔린 크롬에서만 동작하며, '
    + '확장을 최신(v4.8)으로 새로고침해야 이 주소가 허용됩니다.</div>'
    + '<div class="row"><span id="ext-state"><span class="pill pill-gray">미확인</span></span>'
    + '<button class="btn btn-ghost btn-sm" onclick="extPing()">연결 확인</button></div>'
    + '<div style="margin-top:12px;font-size:12.5px;color:var(--sub);line-height:1.9">'
    + '· 지출·결재 → <b>하이웍스 기안</b> / <b>문서 가져오기</b><br>'
    + '· 제조 프로젝트 → <b>하이웍스 일정</b> (납기를 캘린더로)</div></div>'

    + '<div class="card">' + cardH("메일 발송")
    + '<div style="font-size:13px;color:var(--hint);margin:-8px 0 14px">'
    + '영업웹앱과 <b>같은 백엔드·같은 발신 계정</b>을 씁니다 — '
    + '보내는사람 <span class="num">youngjoo@seoraebio.com</span> (서래바이오 박영주)</div>'
    + '<div class="qform" style="max-width:420px"><div class="field"><label>발송 PIN</label>'
    + '<input type="password" value="' + esc(mailPin()) + '" placeholder="영업웹앱과 같은 PIN"'
    + ' onchange="S.mail=Object.assign({},S.mail,{pin:this.value});save()"></div></div>'
    + '<div style="font-size:12.5px;color:var(--amber)">'
    + '⚠ PIN은 이 브라우저에만 저장됩니다. 공용 PC에서는 넣지 마세요.</div></div>'

    + '<div class="card">' + cardH("홈페이지 상담폼 연동")
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

    + '<div class="card">' + cardH("연동 예정")
    + '<div style="font-size:13.5px;color:var(--sub);line-height:2.1">'
    + '구글 로그인 · 드라이브 — <b>영업웹앱과 같은 계정</b> 사용<br>'
    + '하이웍스 전자결재 — 기존 확장/오픈API 방식 그대로 연결<br>'
    + '구글시트 백엔드 — 영업웹앱 Apps Script 구조 재사용<br>'
    + '견적서 PDF 첨부 메일 — 기존 이메일 자동화에 연결</div></div>'
    + '<div class="card">' + cardH("사업자 정보")
    + '<div style="font-size:13.5px;color:var(--sub);line-height:2.1">'
    + '상호 · 주식회사 서래바이오 (브랜드 FOODING LAB)<br>대표 · 지종환<br>'
    + '사업자등록번호 · <span class="num">848-88-02640</span><br>'
    + '통신판매업 · 2025-화성정남-0115호<br>'
    + '주소 · 경기도 화성시 정남면 신백길 102-14<br>'
    + '대표전화 · <span class="num">031-354-6110</span></div></div>'
    + '<div class="card">' + cardH("앱 정보")
    + '<div style="font-size:13.5px;color:var(--sub);line-height:2.1">'
    + '초안 v0.3 · UI는 영업웹앱 디자인 그대로, 색만 푸딩랩<br>'
    + '데이터는 이 브라우저에만 저장 (localStorage <span class="num">fl.v3</span>)<br>'
    + '견적 계산식은 제조견적서 엑셀/HTML과 동일 — 콘솔에서 <b>selfTest()</b></div></div>';
};

/* ══ 모달 ═════════════════════════════════════════════════ */
function closeModal(){ $("modal").innerHTML = ""; }
function openModal(html, wide){
  $("modal").innerHTML = '<div class="modal" onclick="if(event.target===this)closeModal()">'
    + '<div class="box' + (wide ? " wide" : "") + '">' + html + '</div></div>';
}
function fld(label, id, val, type, opts){
  if (opts) {
    return '<div class="field"><label>' + label + '</label><select id="' + id + '">'
      + opts.map(function(o){ return '<option' + (o === val ? " selected" : "") + '>' + esc(o) + '</option>'; }).join("")
      + '</select></div>';
  }
  return '<div class="field"><label>' + label + '</label>'
    + '<input id="' + id + '" type="' + (type || "text") + '" value="' + esc(val == null ? "" : val) + '"></div>';
}
function v(id){ var e = $(id); return e ? e.value : ""; }
function mhead(t, extra){
  return '<div class="mhead"><h3>' + t + '</h3><div class="spacer"></div>' + (extra || "")
       + '<button class="btn btn-ghost btn-sm" onclick="closeModal()">닫기</button></div>';
}
function g2(a, b){
  return '<div class="qform" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'
       + '<div>' + a + '</div><div>' + b + '</div></div>';
}

function editLead(id){
  var l = id ? S.leads.filter(function(x){ return x.id === id; })[0] : {date:today(), stage:"상담접수"};
  openModal(mhead(id ? "리드 수정" : "리드 추가")
    + g2(fld("일자","l-date",l.date,"date") + fld("브랜드/회사","l-company",l.company)
       + fld("담당자","l-name",l.name) + fld("연락처","l-phone",l.phone),
         fld("유입 경로","l-channel",l.channel,null,["홈페이지 폼","카카오 채널","인스타 DM","전화","지인 소개","박람회"])
       + fld("희망 품목","l-item",l.item) + fld("희망 수량","l-moq",l.moq,"number")
       + fld("단계","l-stage",l.stage,null,STAGES))
    + '<div class="field"><label>메모</label><textarea id="l-memo" rows="3">' + esc(l.memo || "") + '</textarea></div>'
    + '<div class="row" style="justify-content:flex-end">'
    + (id ? '<button class="btn btn-ghost btn-sm" onclick="delLead(\'' + id + '\')">삭제</button>' : "")
    + '<button class="btn btn-brand" onclick="saveLead(\'' + (id || "") + '\')">저장</button></div>');
}
function saveLead(id){
  var o = {date:v("l-date"), company:v("l-company"), name:v("l-name"), phone:v("l-phone"),
           channel:v("l-channel"), item:v("l-item"), moq:n(v("l-moq")), stage:v("l-stage"), memo:v("l-memo")};
  if (id) Object.assign(S.leads.filter(function(x){ return x.id === id; })[0], o);
  else { o.id = uid("L"); S.leads.unshift(o); }
  save(); closeModal(); go(CUR === "pipe" ? "pipe" : "lead");
}
function delLead(id){
  S.leads = S.leads.filter(function(x){ return x.id !== id; }); save(); closeModal(); go("lead");
}
function leadToProject(id){
  var l = S.leads.filter(function(x){ return x.id === id; })[0];
  if (!l) return;
  S.projects.unshift({id:uid("P"), client:l.company, item:l.item, form:"", stage:"배합설계",
    order:l.moq, due:"", owner:"박영주", memo:l.memo});
  if (!S.clients.some(function(c){ return c.name === l.company; }))
    S.clients.unshift({id:uid("C"), name:l.company, ceo:l.name, manager:"박영주", grade:"신규",
      phone:l.phone, email:"", memo:"리드에서 전환"});
  save(); go("project");
}

function editClient(id){
  var c = id ? S.clients.filter(function(x){ return x.id === id; })[0] : {grade:"신규", manager:"박영주"};
  openModal(mhead(id ? "브랜드사 수정" : "브랜드사 추가")
    + g2(fld("브랜드명","c-name",c.name) + fld("대표","c-ceo",c.ceo) + fld("담당","c-manager",c.manager),
         fld("등급","c-grade",c.grade,null,["신규","진행","보류","종료"])
       + fld("연락처","c-phone",c.phone) + fld("이메일","c-email",c.email))
    + '<div class="field"><label>메모</label><textarea id="c-memo" rows="3">' + esc(c.memo || "") + '</textarea></div>'
    + '<div class="row" style="justify-content:flex-end">'
    + '<button class="btn btn-brand" onclick="saveClient(\'' + (id || "") + '\')">저장</button></div>');
}
function saveClient(id){
  var o = {name:v("c-name"), ceo:v("c-ceo"), manager:v("c-manager"), grade:v("c-grade"),
           phone:v("c-phone"), email:v("c-email"), memo:v("c-memo")};
  if (id) Object.assign(S.clients.filter(function(x){ return x.id === id; })[0], o);
  else { o.id = uid("C"); S.clients.unshift(o); }
  save(); closeModal(); go("client");
}

function editProject(id){
  var p = id ? S.projects.filter(function(x){ return x.id === id; })[0] : {stage:"상담접수", owner:"박영주"};
  openModal(mhead(id ? "프로젝트 수정" : "프로젝트 추가")
    + g2(fld("브랜드","p-client",p.client) + fld("품목","p-item",p.item)
       + fld("제형","p-form",p.form,null,["정제","경질캡슐","분말스틱","구미","액상스틱","환","기타"]),
         fld("발주수량(set)","p-order",p.order,"number") + fld("납기","p-due",p.due,"date")
       + fld("단계","p-stage",p.stage,null,STAGES))
    + '<div class="field"><label>메모</label><textarea id="p-memo" rows="3">' + esc(p.memo || "") + '</textarea></div>'
    + '<div class="row" style="justify-content:flex-end">'
    + (id ? '<button class="btn btn-ghost btn-sm" onclick="delProject(\'' + id + '\')">삭제</button>' : "")
    + '<button class="btn btn-brand" onclick="saveProject(\'' + (id || "") + '\')">저장</button></div>');
}
function saveProject(id){
  var o = {client:v("p-client"), item:v("p-item"), form:v("p-form"), order:n(v("p-order")),
           due:v("p-due"), stage:v("p-stage"), memo:v("p-memo"), owner:"박영주"};
  if (id) Object.assign(S.projects.filter(function(x){ return x.id === id; })[0], o);
  else { o.id = uid("P"); S.projects.unshift(o); }
  save(); closeModal(); go("project");
}
function delProject(id){
  S.projects = S.projects.filter(function(x){ return x.id !== id; }); save(); closeModal(); go("project");
}
function quoteFromProject(id){
  var p = S.projects.filter(function(x){ return x.id === id; })[0];
  if (!p) return;
  var q = newQuote({client:p.client, item:p.item, form:p.form, order:p.order});
  S.quotes.unshift(q); save(); go("quote"); editQuote(q.id);
}

function editEvent(){
  openModal(mhead("일정 추가")
    + g2(fld("일자","e-date",today(),"date"), fld("구분","e-type","미팅",null,["미팅","팔로우업","마감","납기","기타"]))
    + fld("일정","e-title","")
    + '<div class="row" style="justify-content:flex-end">'
    + '<button class="btn btn-brand" onclick="saveEvent()">저장</button></div>');
}
function saveEvent(){
  S.schedule.push({id:uid("S"), date:v("e-date"), title:v("e-title"), type:v("e-type")});
  save(); closeModal(); go("cal");
}

function editSettle(id){
  var t = id ? S.settles.filter(function(x){ return x.id === id; })[0] : {plan:"일시불", paid:0, due:today()};
  openModal(mhead(id ? "정산 수정" : "정산 추가")
    + g2(fld("브랜드","t-client",t.client) + fld("품목","t-item",t.item) + fld("금액","t-amount",t.amount,"number"),
         fld("방식","t-plan",t.plan,null,["일시불","12개월 무이자"])
       + fld("납입 회차","t-paid",t.paid,"number") + fld("다음 결제일","t-due",t.due,"date"))
    + '<div class="row" style="justify-content:flex-end">'
    + (id ? '<button class="btn btn-ghost btn-sm" onclick="delSettle(\'' + id + '\')">삭제</button>' : "")
    + '<button class="btn btn-brand" onclick="saveSettle(\'' + (id || "") + '\')">저장</button></div>');
}
function saveSettle(id){
  var o = {client:v("t-client"), item:v("t-item"), amount:n(v("t-amount")), plan:v("t-plan"),
           paid:n(v("t-paid")), due:v("t-due")};
  if (id) Object.assign(S.settles.filter(function(x){ return x.id === id; })[0], o);
  else { o.id = uid("T"); S.settles.unshift(o); }
  save(); closeModal(); go("settle");
}
function delSettle(id){
  S.settles = S.settles.filter(function(x){ return x.id !== id; }); save(); closeModal(); go("settle");
}

function editAppr(){
  openModal(mhead("지출 기안")
    + g2(fld("일자","a-date",today(),"date") + fld("제목","a-title",""),
         fld("구분","a-kind","지출결의",null,["지출결의","품의","인건비"]) + fld("금액","a-amount",0,"number"))
    + '<div class="row" style="justify-content:flex-end">'
    + '<button class="btn btn-brand" onclick="saveAppr()">기안</button></div>');
}
function saveAppr(){
  S.approvals.unshift({id:uid("A"), date:v("a-date"), title:v("a-title"), kind:v("a-kind"),
    amount:n(v("a-amount")), writer:"박영주", status:"결재대기"});
  save(); closeModal(); go("appr");
}

/* ══ 견적 편집 ═════════════════════════════════════════════ */
var QID = null;
function editQuote(id){
  var q = id ? S.quotes.filter(function(x){ return x.id === id; })[0] : null;
  if (!q) { q = newQuote(); S.quotes.unshift(q); save(); id = q.id; }
  QID = id;
  openModal(quoteForm(q), true);
}
function curQ(){ return S.quotes.filter(function(x){ return x.id === QID; })[0]; }
function redraw(){ save(); openModal(quoteForm(curQ()), true); }
function setQ(k, val){
  var q = curQ();
  q[k] = ["content","unit","order"].indexOf(k) >= 0 ? n(val) : val;
  save();
  if (["content","unit","order"].indexOf(k) >= 0) redraw();
}
function setMat(i, k, val){ curQ().mats[i][k] = (k === "name") ? val : n(val); save(); if (k !== "name") redraw(); }
function setSub(i, k, val){ curQ().subs[i][k] = (k === "name" || k === "note") ? val : n(val); save(); if (k !== "name" && k !== "note") redraw(); }
function setPro(i, k, val){ curQ().procs[i][k] = (k === "name" || k === "spec") ? val : n(val); save(); if (k !== "name" && k !== "spec") redraw(); }
function addMatRow(){ curQ().mats.push({name:"", ratio:0, price:0}); redraw(); }
function delMatRow(i){ curQ().mats.splice(i, 1); redraw(); }
function addSubRow(){ curQ().subs.push({name:"", price:0, qty:1}); redraw(); }
function delSubRow(i){ curQ().subs.splice(i, 1); redraw(); }
function addProRow(){ curQ().procs.push({name:"", spec:"", qty:0, price:0}); redraw(); }
function delProRow(i){ curQ().procs.splice(i, 1); redraw(); }
function delQuote(id){
  if (!confirm("이 견적을 삭제합니다.")) return;
  S.quotes = S.quotes.filter(function(x){ return x.id !== id; });
  save(); closeModal(); go("quote");
}
function fldQ(label, key, val, type){
  return '<div class="field"><label>' + label + '</label>'
    + '<input type="' + (type || "text") + '" value="' + esc(val || "") + '" oninput="setQ(\'' + key + '\',this.value)"></div>';
}
function sumRow(k, v2, kind){
  // 색은 클래스로 — tr 인라인 스타일은 td 규칙에 밀려서 글씨가 안 보임
  return '<tr class="' + (kind || "") + '"><td class="l">' + k + '</td>'
       + '<td class="r num">' + fmt(v2) + '</td></tr>';
}

function quoteForm(q){
  var r = calcQuote(q), ok = Math.abs(r.tRatio - 100) < 0.01;
  var inp = function(val, oninput, num, step, ph){
    return '<input class="' + (num ? "num" : "") + '" type="' + (num ? "number" : "text") + '"'
      + (step ? ' step="' + step + '"' : "") + (ph ? ' placeholder="' + ph + '"' : "")
      + ' value="' + esc(val ? val : "") + '" oninput="' + oninput + '">';   // 0 은 빈칸
  };
  // 값이 없으면 숫자 대신 흐린 하이픈
  var cal = function(v, d){
    return '<td class="calc' + (v ? "" : " zero") + '">' + (v ? fmt(v, d || 0) : "–") + '</td>';
  };
  var sec = function(title, note){
    return '<div class="sec"><b>' + title + '</b>'
         + (note ? '<span class="hint">' + note + '</span>' : "") + '</div>';
  };
  var del = function(fn){ return '<td class="del"><button class="btn btn-sm" onclick="' + fn + '">×</button></td>'; };

  return mhead('견적 작성 <span class="hint num">' + esc(q.id) + '</span>',
        '<a class="btn btn-ghost btn-sm" href="quote-assets/제조견적서_마스터양식.xlsx" download>⬇ 마스터 양식</a> '
      + '<button class="btn btn-ghost btn-sm" onclick="quoteXlsxDown()">⬇ 값 내보내기</button> '
      + '<button class="btn btn-ghost btn-sm" onclick="quoteXlsxPick()">⬆ 엑셀 업로드</button> '
      + '<input type="file" id="xl-file" accept=".xlsx,.xls" style="display:none" onchange="quoteXlsxUp(this)"> '
      + '<button class="btn btn-soft btn-sm" onclick="viewQuote(\'' + q.id + '\')">견적서 보기</button> '
      + '<button class="btn btn-ghost btn-sm" onclick="delQuote(\'' + q.id + '\')">삭제</button> ')

    + '<div class="qform">'

    /* 제품 정보 */
    + '<div class="grid" style="grid-template-columns:repeat(4,1fr);gap:12px">'
    + fldQ("브랜드","client",q.client) + fldQ("품목","item",q.item)
    + fldQ("제품분류","category",q.category) + fldQ("제형","form",q.form)
    + fldQ("포장형태","pack",q.pack) + fldQ("내용량(mg)","content",q.content,"number")
    + fldQ("포장단위(정/개)","unit",q.unit,"number") + fldQ("발주수량(set)","order",q.order,"number")
    + '</div>'
    + '<div class="field"><label>섭취량</label>'
    + '<input value="' + esc(q.dose) + '" oninput="setQ(\'dose\',this.value)"></div>'

    /* 배합 */
    + sec("배합 (원재료)", "회색 칸은 자동 계산")
    + '<div class="tblwrap"><table>'
    + '<colgroup><col><col style="width:96px"><col style="width:96px"><col style="width:104px">'
      + '<col style="width:96px"><col style="width:104px"><col style="width:88px"><col style="width:46px"></colgroup>'
    + '<thead><tr><th class="l">원료명</th><th class="r">배합비(%)</th><th class="r">함량(mg)</th>'
      + '<th class="r">단가(원/Kg)</th><th class="r">금액(원)</th><th class="r">총사용량(g)</th>'
      + '<th class="r">표시량(mg)</th><th></th></tr></thead><tbody>'
    + q.mats.map(function(m, i){
        var c = r.mats[i];
        return '<tr>'
          + '<td><input value="' + esc(m.name) + '" oninput="setMat(' + i + ',\'name\',this.value)" list="matlist"></td>'
          + '<td>' + inp(m.ratio, "setMat(" + i + ",'ratio',this.value)", true, "0.001", "0") + '</td>'
          + cal(c.mg, 3)
          + '<td>' + inp(m.price, "setMat(" + i + ",'price',this.value)", true, null, "원/Kg") + '</td>'
          + cal(c.cost, 1) + cal(c.use)
          + '<td>' + inp(m.label, "setMat(" + i + ",'label',this.value)", true, null, "-") + '</td>'
          + del("delMatRow(" + i + ")") + '</tr>';
      }).join("")
    + '</tbody><tbody><tr class="tot"><td>합계</td>'
      + '<td class="calc" style="color:' + (ok ? "var(--brand)" : "var(--red)") + '">' + fmt(r.tRatio, 3) + ' %</td>'
      + '<td class="calc">' + fmt(r.tMg, 1) + '</td><td></td>'
      + '<td class="calc">' + fmt(r.matCost) + '</td><td class="calc">' + fmt(r.tUse) + '</td>'
      + '<td colspan="2"></td></tr></tbody></table></div>'
    + '<datalist id="matlist">' + S.materials.map(function(m){
        return '<option value="' + esc(m.name) + '">' + fmt(m.price) + '원/Kg</option>'; }).join("") + '</datalist>'
    + '<div class="row" style="margin-top:10px"><button class="btn btn-ghost btn-sm" onclick="addMatRow()">+ 원료 행</button>'
    + (q.mats.length ? "" : '<span class="hint">원료를 추가하면 함량·금액이 자동 계산됩니다</span>')
    + '<span style="font-size:12.5px;color:' + (ok ? "var(--brand)" : "var(--red)") + '">'
    + (ok ? "배합비 합계 100% ✓" : "배합비 합계 " + fmt(r.tRatio, 3) + "% — 100%로 맞춰야 함") + '</span></div>'

    /* 부자재 */
    + sec("부자재", "1 set 기준")
    + '<div class="tblwrap"><table>'
    + '<colgroup><col><col style="width:120px"><col style="width:100px"><col style="width:116px">'
      + '<col style="width:180px"><col style="width:46px"></colgroup>'
    + '<thead><tr><th class="l">재료명</th><th class="r">단가(원)</th><th class="r">수량</th>'
      + '<th class="r">금액(원)</th><th class="l">비고</th><th></th></tr></thead><tbody>'
    + q.subs.map(function(s2, i){
        return '<tr>'
          + '<td><input value="' + esc(s2.name) + '" oninput="setSub(' + i + ',\'name\',this.value)"></td>'
          + '<td>' + inp(s2.price, "setSub(" + i + ",'price',this.value)", true) + '</td>'
          + '<td>' + inp(s2.qty, "setSub(" + i + ",'qty',this.value)", true, "0.01") + '</td>'
          + cal(r.subs[i].amt, 1)
          + '<td><input value="' + esc(s2.note || "") + '" oninput="setSub(' + i + ',\'note\',this.value)"></td>'
          + del("delSubRow(" + i + ")") + '</tr>';
      }).join("")
    + '</tbody><tbody><tr class="tot"><td colspan="3">합계</td>'
      + '<td class="calc">' + fmt(r.subCost) + '</td><td colspan="2"></td></tr></tbody></table></div>'
    + '<button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="addSubRow()">+ 부자재 행</button>'

    /* 가공비 */
    + sec("가공비", "전체 로트 기준 · 소계 ÷ 발주수량 = 1 set 가공비")
    + '<div class="tblwrap"><table>'
    + '<colgroup><col><col style="width:110px"><col style="width:110px"><col style="width:110px">'
      + '<col style="width:130px"><col style="width:46px"></colgroup>'
    + '<thead><tr><th class="l">항목명</th><th class="l">단위/규격</th><th class="r">수량</th>'
      + '<th class="r">단가(원)</th><th class="r">금액(원)</th><th></th></tr></thead><tbody>'
    + q.procs.map(function(p, i){
        return '<tr>'
          + '<td><input value="' + esc(p.name) + '" oninput="setPro(' + i + ',\'name\',this.value)"></td>'
          + '<td><input value="' + esc(p.spec || "") + '" oninput="setPro(' + i + ',\'spec\',this.value)"></td>'
          + '<td>' + inp(p.qty, "setPro(" + i + ",'qty',this.value)", true, "0.1") + '</td>'
          + '<td>' + inp(p.price, "setPro(" + i + ",'price',this.value)", true) + '</td>'
          + cal(r.procs[i].amt)
          + del("delProRow(" + i + ")") + '</tr>';
      }).join("")
    + '</tbody><tbody>'
      + '<tr class="tot"><td class="l" colspan="4">소계 (전체 로트)</td>'
      + '<td class="calc">' + fmt(r.proTotal) + '</td><td></td></tr>'
      + '<tr class="tot"><td class="l" colspan="4">1 set 가공비 &nbsp;<span class="hint">소계 ÷ '
      + fmt(q.order) + ' set</span></td>'
      + '<td class="calc">' + fmt(r.proc, 1) + '</td><td></td></tr>'
      + '</tbody></table></div>'
    + '<button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="addProRow()">+ 공정 행</button>'

    /* 결과 */
    + '<div style="display:grid;grid-template-columns:1.25fr 1fr;gap:18px;margin-top:24px">'
    + '<div>' + sec("수량 구간별 공급단가").replace('margin:20px 0 9px', 'margin:0 0 9px')
    + '<div class="tblwrap"><table>'
    + '<colgroup><col style="width:104px"><col><col style="width:72px"><col style="width:104px">'
      + '<col style="width:92px"><col style="width:124px"></colgroup>'
    + '<thead><tr><th class="l">발주수량</th><th class="r">기준단가</th><th class="c">추가율</th>'
      + '<th class="r">공급단가</th><th class="r">개당</th><th class="r">총 금액</th></tr></thead><tbody>'
    + r.tiers.map(function(t2){
        var on = r.pick && t2.qty === r.pick.qty;
        return '<tr' + (on ? ' style="background:var(--brand-soft)"' : "") + '>'
          + '<td' + (on ? ' style="font-weight:700"' : "") + '><span class="num">' + fmt(t2.qty)
          + '</span> set' + (on ? ' <span style="color:var(--brand)">◀</span>' : "") + '</td>'
          + '<td class="calc">' + fmt(t2.base) + '</td>'
          + '<td class="calc" style="text-align:center">' + (t2.rate * 100).toFixed(0) + ' %</td>'
          + '<td class="calc"' + (on ? ' style="font-weight:700;color:var(--ink)"' : "") + '>'
          + fmt(t2.price) + '</td>'
          + '<td class="calc">' + (q.unit ? fmt(t2.price / n(q.unit), 1) : "") + '</td>'
          + '<td class="calc">' + fmt(t2.amount) + '</td></tr>';
      }).join("") + '</tbody></table></div></div>'

    + '<div>' + sec("견적 합계").replace('margin:20px 0 9px', 'margin:0 0 9px')
    + '<div class="tblwrap"><table><colgroup><col><col style="width:140px"></colgroup><tbody>'
    + sumRow("1. 원재료비", r.matCost) + sumRow("2. 부자재비", r.subCost) + sumRow("3. 가공비", r.proc)
    + sumRow("4. 제조원가", r.cost, "cost")
    + sumRow("5. 단가 추가금액" + (r.pick ? " (" + (r.pick.rate * 100).toFixed(0) + "%)" : ""), r.add)
    + sumRow("합계", r.total, "grand")
    + '</tbody></table></div>'
    + '<div class="grid" style="grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">'
    + '<div class="metric"><div class="l">1 set 공급단가 · VAT 별도</div>'
    + '<div class="v num">' + fmt(r.final) + '<small> 원</small></div>'
    + '<div class="hint" style="margin-top:3px">' + fmt(q.unit) + '개입 기준</div></div>'
    + '<div class="metric"><div class="l">개당 단가</div>'
    + '<div class="v num">' + fmt(r.perUnit, 1) + '<small> 원</small></div>'
    + '<div class="hint" style="margin-top:3px">공급단가 ÷ ' + fmt(q.unit) + '개</div></div>'
    + '</div>'
    + '<div class="metric" style="margin-top:12px;background:var(--brand-soft);border-color:#cfe3d8">'
    + '<div class="l">총 금액 · ' + fmt(q.order) + ' set</div>'
    + '<div class="v num">' + fmt(r.amount) + '<small> 원</small></div></div>'
    + '</div></div>'

    + '</div>';
}

/* ══ 홈페이지 상담폼 → 리드 가져오기 ═══════════════════════
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

/* ══ 배합·단가 엑셀 양식 ═══════════════════════════════════
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

  /* 가공비 38~42행 : J 항목명 · L 단위/규격 · M 수량 · N 단가 (로트 총액 기준)
     원본 B45:I52 를 J36 으로 옮긴 구조라 B→J, D→L, E→M, F→N 로 대응된다 */
  var procs = [];
  for (var r3 = 38; r3 <= 42; r3++) {
    var nm3 = txt("J" + r3);
    if (!nm3) continue;
    procs.push({name:nm3, spec:txt("L" + r3), qty:num("M" + r3), price:num("N" + r3)});
  }
  if (procs.length) q.procs = procs;

  return {mats:mats.length, subs:subs.length, procs:procs.length};
}

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

  if (!got.length) {
    toast("읽을 수 있는 시트가 없습니다 — 시트 이름이 '제조견적서' 또는 '제품정보/배합/부자재/가공비' 여야 합니다 (현재: " + wb.SheetNames.join(", ") + ")");
    return;
  }
  save(); redraw();
  toast("불러왔습니다 · " + got.join(" / "));
};

/* ══ 하이웍스 확장 연동 ═════════════════════════════════════
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

/* ══ 견적 확인·수락 링크 ═══════════════════════════════════
   메일 안에서는 자바스크립트가 안 돈다. 그래서 버튼을 링크로 만들고,
   그 링크가 여는 페이지(foodinglab.pages.dev/q.html)에서 클릭을 기록한다.
   열람 시각 / 수락·보류 / 남긴 말까지 남는다. */
function quoteSite(){
  return (leadCfg().url || "").replace(/\/api\/lead.*$/, "") || "https://foodinglab.pages.dev";
}
async function shareQuote(q){
  var c = leadCfg();
  if (!c.key) throw new Error("설정·팀 화면에서 관리키를 먼저 넣어주세요");
  var r = calcQuote(q);
  var res = await fetch(quoteSite() + "/api/quote", {
    method: "POST",
    headers: {"Content-Type": "application/json", "X-Admin-Key": c.key},
    body: JSON.stringify({
      quoteId: q.id, client: q.client, item: q.item,
      order: n(q.order), unit: n(q.unit),
      final: r.final, amount: r.amount, perUnit: r.perUnit,
      tiers: r.tiers.map(function(t){ return {qty:t.qty, price:t.price}; }),
      note: q.note, validUntil: q.validUntil || ""
    })
  });
  var j = await res.json();
  if (!j.ok) throw new Error(j.error || "링크 생성 실패");
  q.shareToken = j.token;
  save();
  return quoteSite() + "/q.html?t=" + j.token;
}

/* 메일 본문 맨 아래 붙는 버튼 (HTML 메일용) */
function replyButtons(link){
  return '<div style="margin:26px 0 8px;text-align:center">'
    + '<a href="' + link + '" style="display:inline-block;padding:14px 26px;border-radius:999px;'
    + 'background:#1A7452;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;'
    + 'font-family:Malgun Gothic,sans-serif">견적 확인하고 회신하기</a>'
    + '<div style="margin-top:10px;font-size:12px;color:#78847E;'
    + 'font-family:Malgun Gothic,sans-serif">버튼이 안 눌리면 아래 주소를 복사해 열어주세요<br>'
    + '<span style="color:#42504A">' + link + '</span></div></div>';
}

/* 응답 회수 — 견적 목록의 상태를 갱신 */
window.pullQuoteReplies = async function(){
  var c = leadCfg();
  if (!c.key) { toast("설정·팀 화면에서 관리키를 먼저 넣어주세요"); go("set"); return; }
  var btn = $("qr-btn");
  if (btn) { btn.disabled = true; btn.textContent = "확인 중…"; }
  try {
    var res = await fetch(quoteSite() + "/api/quote?list=1", {headers:{"X-Admin-Key": c.key}});
    var j = await res.json();
    if (!j.ok) throw new Error(j.error || "조회 실패");

    var byTok = {};
    j.quotes.forEach(function(x){ byTok[x.token] = x; });
    var n2 = 0;
    S.quotes.forEach(function(q){
      var x = q.shareToken && byTok[q.shareToken];
      if (!x) return;
      q.reply = {status:x.status, viewedAt:x.viewedAt, repliedAt:x.repliedAt,
                 name:x.replyName, memo:x.replyMemo};
      n2++;
    });
    save();
    toast(n2 ? n2 + "건 상태를 가져왔습니다" : "공유한 견적이 없습니다");
    go("quote");
  } catch(e){
    toast(e.message);
    if (btn) { btn.disabled = false; btn.textContent = "고객 회신 확인"; }
  }
};

function replyPill(q){
  var r = q.reply;
  if (!q.shareToken) return '<span class="pill pill-gray">미공유</span>';
  if (!r) return '<span class="pill pill-blue">발송</span>';
  if (r.status === "accepted") return '<span class="pill pill-green">수락 ✓</span>';
  if (r.status === "hold")     return '<span class="pill pill-gold">보류·문의</span>';
  if (r.status === "viewed")   return '<span class="pill pill-amber">열람</span>';
  return '<span class="pill pill-blue">발송</span>';
}

/* ══ 견적서 출력 ═══════════════════════════════════════════ */
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
    + '<div id="qvwrap"><div id="qv" class="qd2">' + quoteHTML(q) + '</div></div>', true);
  qvFit();
}
function fitPrint(){
  var el = $("qv");
  if (el) {
    setZoom(1);                               // 인쇄는 화면 배율과 무관
    var PX = 96 / 25.4, avail = (297 - 20) * PX;
    // 무조건 A4 한 장에 담는다 (하한 0.45)
    document.documentElement.style.setProperty("--fit",
      Math.max(0.3, Math.min(1, avail / el.scrollHeight)).toFixed(3));
  }
  window.print();
}

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
      availH = window.innerHeight - 116;             // 모달 헤더·여백 감안
  setZoom(Math.min(box / docW, availH / docH, 1));
};
window.qvZoom = function(dir){
  if (dir === 0) return setZoom(1);
  setZoom(QVZ + dir * 0.1);
};

function quoteHTML(q){
  var r = calcQuote(q), d = q.date ? new Date(q.date) : new Date();
  var blank = function(cols, cnt){
    var out = "";
    for (var i = 0; i < cnt; i++) {
      out += '<tr class="blank">';
      for (var j = 0; j < cols; j++) out += "<td>&nbsp;</td>";
      out += "</tr>";
    }
    return out;
  };
  var cell = function(v, cls){ return '<td class="' + (cls || "") + '">' + v + '</td>'; };

  return ''
    /* ── 머리 : 타이틀 + 작성일 (원본 엑셀과 같은 구성) ── */
    + '<div class="qhead">'
      + '<div class="qwm">FOODING LAB<i>.</i></div>'
      + '<div class="titlewrap"><h1 class="title">제조 견적서</h1><div class="title-rule"></div></div>'
      + '<div class="qdate">작성일 <span class="num">'
      + d.getFullYear() + '. ' + pad(d.getMonth() + 1) + '. ' + pad(d.getDate()) + '</span></div>'
    + '</div>'

    /* ── 고객사·제품 사양 (엑셀 상단 블록 그대로) ── */
    + '<table class="spec"><colgroup><col style="width:78px"><col><col style="width:78px"><col></colgroup>'
    + '<tr><td class="h">고객사명</td><td><b>' + esc(q.client || "―") + '</b></td>'
      + '<td class="h">포장형태</td><td>' + esc(q.pack || "―") + '</td></tr>'
    + '<tr><td class="h">제 품 명</td><td>' + esc(q.item || "―") + '</td>'
      + '<td class="h">내 용 량</td><td class="num">' + (q.content ? fmt(q.content) + " mg" : "―") + '</td></tr>'
    + '<tr><td class="h">제품분류</td><td>' + esc(q.category || "―") + '</td>'
      + '<td class="h">포장단위</td><td class="num">' + (q.unit ? fmt(q.unit) : "―") + '</td></tr>'
    + '<tr><td class="h">제품제형</td><td>' + esc(q.form || "―") + '</td>'
      + '<td class="h">발주수량</td><td class="num">' + (q.order ? fmt(q.order) + " set" : "―") + '</td></tr>'
    + '<tr><td class="h">섭 취 량</td><td colspan="3">' + esc(q.dose || "―") + '</td></tr></table>'

    /* ── 합계금액 띠 ── */
    + '<table class="total-band"><tr>'
      + '<td class="lbl">최종 견적가<small>1 set / VAT 별도</small></td>'
      + '<td class="val"><span class="kr">' + krNum(r.final) + '</span> 원정'
      + '<span class="won num">(₩ ' + fmt(r.final) + ')</span></td></tr></table>'

    /* ── 원재료비 ── */
    + '<div class="blk"><p class="cap">* 원재료비</p>'
    + '<table class="items"><colgroup><col><col style="width:62px"><col style="width:74px">'
      + '<col style="width:74px"><col style="width:70px"><col style="width:74px"><col style="width:58px"></colgroup>'
    + '<thead><tr><th>원 료 명</th><th>배합비<small>(%)</small></th><th>함 량<small>(mg/단위)</small></th>'
      + '<th>단 가<small>(원/Kg)</small></th><th>금 액<small>(원)</small></th>'
      + '<th>총 사용량<small>(g)</small></th><th>표시량<small>(mg)</small></th></tr></thead><tbody>'
    + r.mats.map(function(m){
        return '<tr>' + cell(esc(m.name)) + cell(fmt(m.ratio, 3), "r num") + cell(fmt(m.mg, 3), "r num")
          + cell(fmt(m.price), "r num") + cell(fmt(m.cost, 1), "r num") + cell(fmt(m.use), "r num")
          + cell(m.label ? fmt(m.label) : "", "r num") + '</tr>';
      }).join("")
    + blank(7, Math.max(0, 3 - r.mats.length))
    + '</tbody><tbody><tr class="sum"><td class="label">합 계</td>'
      + cell(fmt(r.tRatio, 3), "r num") + cell(fmt(r.tMg, 1), "r num") + '<td></td>'
      + cell(fmt(r.matCost), "r num") + cell(fmt(r.tUse), "r num") + '<td></td></tr></tbody></table></div>'

    /* ── 부자재비 · 가공비 (2단) ── */
    + '<div class="cols2">'
    + '<div class="blk"><p class="cap">* 부자재비</p>'
    + '<table class="items"><colgroup><col><col style="width:64px"><col style="width:52px">'
      + '<col style="width:68px"></colgroup>'
    + '<thead><tr><th>재 료 명</th><th>단 가<small>(원)</small></th><th>수 량</th>'
      + '<th>금 액<small>(원)</small></th></tr></thead><tbody>'
    + r.subs.map(function(s2){
        return '<tr>' + cell(esc(s2.name)) + cell(fmt(s2.price), "r num")
          + cell(fmt(s2.qty, s2.qty % 1 ? 2 : 0), "r num")
          + cell(fmt(s2.amt, 1), "r num") + '</tr>';
      }).join("")
    + '</tbody><tbody><tr class="sum"><td class="label" colspan="3">합 계</td>'
      + cell(fmt(r.subCost), "r num") + '</tr></tbody></table></div>'

    /* 가공비 */
    + '<div class="blk"><p class="cap">* 가공비 &nbsp;(로트 기준 · 소계 ÷ 발주수량)</p>'
    + '<table class="items"><colgroup><col><col style="width:54px"><col style="width:60px">'
      + '<col style="width:56px"><col style="width:78px"></colgroup>'
    + '<thead><tr><th>항 목 명</th><th>규격</th><th>수 량</th><th>단 가<small>(원)</small></th>'
      + '<th>금 액<small>(원)</small></th></tr></thead><tbody>'
    + r.procs.map(function(p){
        return '<tr>' + cell(esc(p.name)) + cell(esc(p.spec || ""), "c")
          + cell(fmt(p.qty, p.qty % 1 ? 1 : 0), "r num") + cell(fmt(p.price), "r num")
          + cell(fmt(p.amt), "r num") + '</tr>';
      }).join("")
    + '</tbody><tbody><tr class="sum"><td class="label" colspan="4">소 계</td>'
      + cell(fmt(r.proTotal), "r num") + '</tr></tbody></table></div>'
    + '</div>'

    /* ── 수량별 공급단가 ── */
    + '<div class="blk"><p class="cap">* 수량별 공급단가 (VAT 별도)</p>'
    + '<table class="items"><colgroup><col style="width:96px"><col><col style="width:60px">'
      + '<col style="width:100px"><col style="width:88px"><col style="width:116px"></colgroup>'
    + '<thead><tr><th>발주수량</th><th>기준단가<small>(원/set)</small></th><th>추가율</th>'
      + '<th>공급단가<small>(원/set)</small></th><th>개당 단가<small>(원)</small></th>'
      + '<th>총 금액<small>(원)</small></th></tr></thead><tbody>'
    + r.tiers.map(function(t){
        var on = r.pick && t.qty === r.pick.qty;
        return '<tr' + (on ? ' class="on"' : "") + '>'
          + '<td class="c"><b>' + fmt(t.qty) + ' set</b>'
          + (on ? ' <span style="color:var(--sg)">◀</span>' : "") + '</td>'
          + cell(fmt(t.base), "r num") + cell((t.rate * 100).toFixed(0) + " %", "c num")
          + '<td class="r num"><b>' + fmt(t.price) + '</b></td>'
          + cell(q.unit ? fmt(t.price / n(q.unit), 1) : "", "r num")
          + cell(fmt(t.amount), "r num") + '</tr>';
      }).join("") + '</tbody></table></div>'

    /* ── 비고 · 견적 합계 ── */
    + '<div class="foot2">'
    + '<div class="note"><div class="t">비 고</div><div class="b">' + esc(q.note) + '</div></div>'
    + '<div><p class="cap">* 견적 합계</p><table class="items">'
      + '<colgroup><col><col style="width:116px"><col style="width:64px"></colgroup>'
      + '<thead><tr><th>구 분</th><th>금액<small>(원)</small></th><th>비 고</th></tr></thead><tbody>'
      + qRow("1. 원재료비", r.matCost) + qRow("2. 부자재비", r.subCost) + qRow("3. 가공비", r.proc)
      + qRow("4. 제조원가", r.cost, "cost")
      + qRow("5. 단가 추가금액" + (r.pick ? " (" + (r.pick.rate * 100).toFixed(0) + "%)" : ""), r.add)
      + qRow("합 계" + (r.pick ? " · " + fmt(r.pick.qty) + "set 기준" : ""), r.total, "grand")
      + '</tbody></table>'
      /* 합계 · 개당 단가 분해 */
      + '<table class="items" style="margin-top:8px">'
      + '<colgroup><col><col style="width:116px"><col style="width:64px"></colgroup><tbody>'
      + qRow("1 set 공급단가", r.final)
      + qRow("개당 단가" + (q.unit ? " (1 set = " + fmt(q.unit) + "개)" : ""), r.perUnit, null, 1)
      + qRow("총 금액" + (q.order ? " (" + fmt(q.order) + " set)" : ""), r.amount, "grand")
      + '</tbody></table></div></div>'

    /* ── 꼬리 ── */
    + '<div class="docfoot"><span class="docno">No.<span class="val num">' + esc(q.id) + '</span></span>'
    + '<span class="supline">주식회사 서래바이오 · 사업자 <span class="num">848-88-02640</span>'
    + ' · 담당 박영주 <span class="num">010-6850-3819</span></span>'
    + '</div>';
}

function qRow(k, v2, kind, dec){
  return '<tr' + (kind ? ' class="' + kind + '"' : "") + '><td>' + k + '</td>'
       + '<td class="r num">' + fmt(v2, dec || 0) + '</td><td class="c"></td></tr>';
}

/* ══ 토스트 ═══════════════════════════════════════════════ */
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
    // 네트워크가 막힌 환경에서 무한 대기하지 않도록 15초 제한
    setTimeout(function(){ if (left > 0 && !failed) { failed = true; reject(new Error("PDF 라이브러리 로드 시간초과")); } }, 15000);
    need.forEach(function(src){
      var sc = document.createElement("script"); sc.src = src;
      sc.onload  = function(){ if (--left === 0 && !failed) resolve(); };
      sc.onerror = function(){ failed = true; reject(new Error("PDF 라이브러리 로드 실패")); };
      document.head.appendChild(sc);
    });
  });
}
async function elToPdf(el, fileName, opt){
  if (!el) throw new Error("대상 없음");
  await loadPdfLibs();
  try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch(e){}
  // 배율 3 + 품질 0.98 — 축소해서 넣어도 글씨가 뭉개지지 않게
  var canvas = await html2canvas(el, {scale:3, backgroundColor:"#ffffff", useCORS:true, logging:false});
  var img = canvas.toDataURL("image/jpeg", 0.98);
  var pdf = new window.jspdf.jsPDF({unit:"mm", format:"a4", orientation:"portrait", compress:false});
  var pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
  var m = 6,                                   // 가장자리 여백 mm
      iw = pw - m * 2,                         // 폭 맞춤 (글씨 크기 유지)
      pxPerMM = canvas.width / iw,             // 캔버스 px ↔ mm
      pageH = (ph - m * 2) * pxPerMM,          // 한 페이지에 들어가는 캔버스 px
      total = canvas.height;

  if (total <= pageH * 1.15) {                 // 15% 이내면 살짝 줄여 한 장에 (표 안 잘림)
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
      pdf.addImage(pc.toDataURL("image/jpeg", 0.98), "JPEG", m, m, iw, hPx / pxPerMM);
      first = false;
      start = end;
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

/* #qv 안에서 페이지를 끊어도 되는 y 좌표들 (블록 경계) */
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
    dlPdfBlob(await elToPdf($("qv"), qFile(QDOC), qvBlocks()));
    toast("⬇ 견적서 PDF 저장됨");
  } catch(e){ toast("PDF 생성 실패 — 인쇄 버튼으로 저장하세요"); }
  setZoom(keep);
  if (b) { b.disabled = false; b.textContent = "⬇ PDF 저장"; }
};

/* ══ 메일 — 영업웹앱과 같은 구조 (하이웍스 발송 + 첨부) ════
   ⚠ 발송은 이 화면의 [하이웍스로 보내기] 버튼을 눌러야만 실행됨 */
/* 메일 발송 — 영업웹앱과 같은 백엔드를 그대로 쓴다.
   /api → Cloudflare Pages Function(functions/api.js) → Apps Script sendSalesMail
   발신자는 백엔드에 고정: youngjoo@seoraebio.com (서래바이오 박영주)
   PIN 은 설정·팀 화면에서 넣고 이 브라우저에만 저장된다. */
var API_URL = "/api";
function mailPin(){ return (S.mail && S.mail.pin) || ""; }
/* 홈페이지 상담폼(foodinglab.pages.dev)에서 리드를 받아오는 설정 — 설정·팀 화면에서 입력 */
function leadCfg(){
  return {
    url: (S.leadApi && S.leadApi.url) || "https://foodinglab.pages.dev/api/lead",
    key: (S.leadApi && S.leadApi.key) || ""
  };
}
var MAIL_ATTACH = [];
var MAIL_LINK = "";   // 이번 메일에 넣을 확인·수락 링크

function apiPost(action, payload){
  if (!API_URL) return Promise.resolve({ok:false, error:"백엔드 미연결"});
  return fetch(API_URL, {
    method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"},
    body: JSON.stringify(Object.assign({action:action, pin:mailPin()}, payload))
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
async function openMail(q, att){
  var c = S.clients.filter(function(x){ return x.name === q.client; })[0] || {};
  var tpl = S.emails.filter(function(e){ return /견적/.test(e.name); })[0]
            || S.emails[0] || {subject:"", body:""};
  MAIL_ATTACH = att ? [att] : [];

  /* 확인·수락 링크 — 실패해도 메일은 보낼 수 있게 한다 */
  MAIL_LINK = "";
  try { MAIL_LINK = await shareQuote(q); }
  catch(e){ toast("확인 링크 없이 진행합니다 — " + e.message); }

  var r = calcQuote(q);
  var detail = "\n[견적 요약]\n"
    + "· 품목: " + (q.item || "-") + "\n"
    + "· 발주수량: " + fmt(q.order) + " set\n"
    + "· 공급단가: " + fmt(r.final) + " 원 (1 set, VAT 별도)\n"
    + "· 총 금액: " + fmt(r.amount) + " 원\n"
    + (r.tiers.length
        ? "· 수량 구간: " + r.tiers.map(function(t){
            return fmt(t.qty) + "set " + fmt(t.price) + "원"; }).join(" / ") + "\n"
        : "")
    + (MAIL_LINK ? "\n[견적 확인·회신]\n" + MAIL_LINK + "\n" : "");

  $("modal2").innerHTML =
    '<div class="modal" onclick="if(event.target===this)mailClose()"><div class="box">'
    + '<div class="mhead"><h3>메일 보내기</h3><div class="spacer"></div>'
    + '<button class="btn btn-ghost btn-sm" onclick="mailClose()">닫기</button></div>'
    + '<div style="font-size:12.5px;color:var(--hint);margin-bottom:14px">'
    + esc(q.client || "-") + ' · 견적서 메일'
    + (c.email ? "" : "  (등록된 이메일 없음 — 직접 입력하거나 브랜드사 CRM 에 추가)") + '</div>'
    + '<div class="field"><label>보내는사람</label>'
    + '<input value="서래바이오 박영주 &lt;youngjoo@seoraebio.com&gt;" disabled '
    + 'style="background:var(--bg2);color:var(--hint)"></div>'
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
    + (MAIL_LINK
        ? '<div class="notice" style="margin:4px 0 14px"><b>확인·수락 버튼이 함께 나갑니다.</b><br>'
          + '<span class="sub2">고객이 링크를 열면 <b>열람</b>, 버튼을 누르면 <b>수락</b> 또는 '
          + '<b>보류</b>로 기록됩니다 · <span class="num" style="font-size:11.5px">'
          + esc(MAIL_LINK) + '</span></span></div>'
        : "")
    + '<div class="field"><label>첨부</label><div id="mail-att"></div>'
    + '<input type="file" multiple style="margin-top:8px" onchange="attPick(this)"></div>'
    + '<div class="row" style="justify-content:flex-end;margin-top:6px">'
    + '<button class="btn btn-ghost btn-sm" onclick="mailCopy()">본문 복사</button>'
    + '<button class="btn btn-ghost btn-sm" onclick="mailDraft()">메일앱으로 열기</button>'
    + '<button class="btn btn-brand" onclick="mailSend()">메일 보내기</button></div>'
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
  if (MAIL_ATTACH.length) toast("메일앱 초안은 첨부가 안 됩니다 — 첨부하려면 [메일 보내기]");
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
  if (!mailPin()) {
    toast("설정·팀 화면에서 발송 PIN을 먼저 넣어주세요");
    mailClose(); go("set");
    return;
  }
  var btn = document.querySelector("#modal2 .btn-brand");
  if (btn) { btn.disabled = true; btn.textContent = "보내는 중…"; }
  var html = '<div style="font-family:Malgun Gothic,sans-serif;font-size:14px;line-height:1.7;'
           + 'color:#222;white-space:pre-wrap;">' + esc(body) + '</div>'
           + (MAIL_LINK ? replyButtons(MAIL_LINK) : "");
  apiPost("sendMail", {mail:{to:to, subject:subj, html:html, text:body, attachments:MAIL_ATTACH}})
    .then(function(r){
      if (r && r.ok) {
        toast(to + " 발송 완료" + (r.attached ? " · 첨부 " + r.attached + "개" : ""));
        mailClose();
      } else toast("발송 실패: " + ((r && r.error) || "권한/연결 확인"));
      if (btn) { btn.disabled = false; btn.textContent = "메일 보내기"; }
    })
    .catch(function(){
      toast("발송 오류(연결)");
      if (btn) { btn.disabled = false; btn.textContent = "메일 보내기"; }
    });
};

window.quoteMail = async function(){
  var b = $("qv-mail"); if (b) { b.disabled = true; b.textContent = "PDF 만드는 중…"; }
  var att = null, keep = QVZ; setZoom(1);
  try { att = await elToPdf($("qv"), qFile(QDOC), qvBlocks()); }
  catch(e){ toast("PDF 첨부 실패 — PDF 저장 후 직접 첨부하세요"); }
  setZoom(keep);
  if (b) { b.disabled = false; b.textContent = "📎 PDF 첨부해 메일"; }
  await openMail(QDOC, att);
  if (att) toast("견적서 PDF 첨부됨 — 받는사람 확인 후 발송");
};

/* ══ 자체 점검 — 콘솔에서 selfTest() ═══════════════════════ */
window.selfTest = function(){
  var q = newQuote({
    content:700, unit:60, order:2000, yield:0.03,
    mats:[{name:"알파CD", ratio:47.62, price:30000},{name:"오크라", ratio:14.286, price:180000},
          {name:"결정셀룰로스", ratio:29.994, price:4700},{name:"스테아린산Mg", ratio:2, price:5400}],
    subs:[{name:"병캡",price:350,qty:1},{name:"라벨",price:120,qty:1},{name:"단상자",price:350,qty:1},
          {name:"실리카겔",price:9,qty:3},{name:"카톤",price:1800,qty:1/50}],
    procs:[{name:"분말", spec:"kg", qty:200.7, price:10000},
           {name:"혼합/충진/제환", spec:"3.75g", qty:379.9, price:10000},
           {name:"대환포장", spec:"환", qty:90000, price:20}],
    tiers:[{qty:1000,rate:0.15},{qty:2000,rate:0.13},{qty:3000,rate:0.10}]
  });
  var r = calcQuote(q);
  console.assert(Math.round(r.matCost * 1e4) / 1e4 === 1796.0911, "원재료비: " + r.matCost);
  console.assert(r.subCost === 883, "부자재비: " + r.subCost);
  console.assert(r.proTotal === 7606000, "가공 소계: " + r.proTotal);
  console.assert(r.proc === 3803, "1 set 가공비: " + r.proc);
  console.assert(r.final === 7320, "최종 견적가: " + r.final);
  console.assert(r.tiers.map(function(t){ return t.price; }).join() === "11820,7320,5730",
                 "구간 단가: " + r.tiers.map(function(t){ return t.price; }));
  console.assert(krNum(7320) === "칠천삼백이십", "한글금액: " + krNum(7320));
  console.assert(Math.round(r.perUnit * 100) / 100 === 122, "개당 단가: " + r.perUnit);  // 7320 ÷ 60정
  console.log("selfTest OK", {matCost:r.matCost, cost:r.cost, final:r.final,
                              tiers:r.tiers.map(function(t){ return t.price; })});
  return r;
};

buildNav();
go("dash");
