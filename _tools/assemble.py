# -*- coding: utf-8 -*-
"""푸딩랩 index.html 조립 — 서래바이오 디자인시스템 + 푸딩랩 팔레트 + 앱 컴포넌트"""
import io, os

D     = os.path.dirname(os.path.abspath(__file__))
DEST  = os.path.join(os.path.expanduser("~"), "Desktop", "푸딩랩_웹앱")
SHELL = os.path.join(D, 'fl_shell.html')
APP   = os.path.join(D, 'fl_app.js')
OUT   = os.path.join(DEST, 'index.html')

head = """<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FOODING LAB · 제조컨설팅 관리</title>

<!--
  푸딩랩(FOODING LAB) 제조컨설팅 관리 웹앱 — 초안 v0.4
  ──────────────────────────────────────────────────────────────
  스타일 3단 구성 (링크 순서가 곧 우선순위)
    1) design-system.css     서래바이오 디자인시스템 원본 — 손대지 않음
    2) foodinglab-theme.css  색 토큰만 푸딩랩(그린/골드)으로 교체
    3) app.css               이 앱에만 있는 컴포넌트 (칸반·캘린더·견적입력 등)

  견적 계산식은 제조견적서 엑셀/HTML 과 동일 — 콘솔에서 selfTest()
  데이터는 localStorage(fl.v3). 홈페이지 상담폼 연동은 설정·팀 화면 참조
-->

<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.min.css">
<link rel="stylesheet" href="design-system.css">
<link rel="stylesheet" href="foodinglab-theme.css">
<link rel="stylesheet" href="app.css">
</head>
"""

out = (head
       + io.open(SHELL, encoding='utf-8').read()
       + "\n<script>\n" + io.open(APP, encoding='utf-8').read() + "\n</script>\n</body>\n</html>\n")

io.open(OUT, 'w', encoding='utf-8').write(out)
print('saved', OUT, round(len(out) / 1024), 'KB')
