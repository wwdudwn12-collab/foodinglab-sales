# -*- coding: utf-8 -*-
"""견적서 상단 정리 — 발행일/수신처/공급자표 블록 제거, 엑셀처럼 고객사명을 사양표로"""
import io, os, re

D = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(D, 'fl_app.js')
s = io.open(P, encoding='utf-8').read()

start = s.index("  return ''\n    /* ── 머리 ── */")
end   = s.index("    /* ── 합계금액 띠 ── */")

NEW = '''  return ''
    /* ── 머리 : 타이틀 + 작성일 (원본 엑셀과 같은 구성) ── */
    + '<div class="qhead">'
      + '<div class="qhead-sp"></div>'
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

'''
s = s[:start] + NEW + s[end:]

# 꼬리에 공급자 한 줄 (공급자표를 뺐으니 최소 정보는 남긴다)
a = """    + '<div class="docfoot"><span class="docno">No.<span class="val num">' + esc(q.id) + '</span></span>'
    + '<span class="wmk">FOODING LAB.</span></div>';"""
b = """    + '<div class="docfoot"><span class="docno">No.<span class="val num">' + esc(q.id) + '</span></span>'
    + '<span class="supline">주식회사 서래바이오 · 사업자 <span class="num">848-88-02640</span>'
    + ' · 담당 박영주 <span class="num">010-6850-3819</span></span>'
    + '<span class="wmk">FOODING LAB.</span></div>';"""
assert a in s, 'docfoot'
s = s.replace(a, b)

io.open(P, 'w', encoding='utf-8').write(s)
print('app: 견적서 상단 교체')

# ── CSS ──
P2 = os.path.join(os.path.expanduser("~"), "Desktop", "푸딩랩_웹앱", "app.css")
t = io.open(P2, encoding='utf-8').read()
a2 = "#qv h1.title{font-size:23px;letter-spacing:.24em;text-indent:.24em}\n#qv .head{margin-bottom:11px}\n#qv .top{gap:14px;margin-bottom:10px}"
b2 = """#qv h1.title{font-size:23px;letter-spacing:.24em;text-indent:.24em}
/* 머리 — 가운데 타이틀, 오른쪽 작성일 (좌우 균형 맞추려고 빈 칸 하나 둠) */
#qv .qhead{display:grid;grid-template-columns:1fr auto 1fr;align-items:end;margin-bottom:12px}
#qv .qhead .titlewrap{text-align:center}
#qv .qdate{justify-self:end;font-size:10.5px;color:var(--g700);white-space:nowrap}
#qv .supline{flex:1;text-align:center;font-size:9.5px;color:var(--g500)}"""
assert a2 in t, 'css head'
t = t.replace(a2, b2)
io.open(P2, 'w', encoding='utf-8').write(t)
print('app.css: 머리 스타일')
