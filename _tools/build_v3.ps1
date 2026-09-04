# 제조견적서 양식 v3 — 원본에서 Excel COM 으로 재작업
# COM 의 Cut/Paste 는 서식·수식참조·데이터유효성·조건부서식을 그대로 들고 간다.
# (openpyxl 로 만들면 데이터유효성이 통째로 사라짐 — v2 에서 실제로 사라졌었음)
$ErrorActionPreference = 'Stop'

$SRC = "$env:USERPROFILE\Documents\카카오톡 받은 파일\서래바이오_제조견적서_20260830_17.xlsx"
$OUT = "$env:USERPROFILE\Desktop\서래바이오_제조견적서_양식_v3.xlsx"
if (Test-Path $OUT) { Remove-Item $OUT -Force }

$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false; $xl.DisplayAlerts = $false
$wb = $xl.Workbooks.Open($SRC)
$ws = $wb.Sheets.Item("제조견적서")

# ── 1) 설정 패널(K열) → R열, 패킹 계산 블록(K~O) → T열 ──────────────
$ws.Range("K2:K14").Cut($ws.Range("R2"))     | Out-Null
$ws.Range("K18:O35").Cut($ws.Range("T18"))   | Out-Null

# ── 2) 가공비 블록을 부자재 오른쪽으로 (B45:I52 → J36) ──────────────
$ws.Range("B45:I52").Cut($ws.Range("J36"))   | Out-Null

# ── 3) 남은 빈 줄 제거 (가공비가 있던 44~53행) ──────────────────────
$ws.Rows("44:53").Delete() | Out-Null

# ── 4) 열 너비 — 왼쪽 부자재 / 오른쪽 가공비 ───────────────────────
$cols = @('B:15.6','C:12','D:15','E:10.6','F:14','G:14','H:12','I:10.6',
          'J:16','K:9','L:9','M:7.5','N:12','O:14','P:2','Q:2','R:15',
          'T:12','U:3','V:10','W:13','X:13')
foreach ($cw in $cols) {
  $p = $cw.Split(':')
  $ws.Columns($p[0]).ColumnWidth = [double]$p[1]
}

# ── 5) 두 표의 행 높이 통일 (빈 줄도 같은 높이) ─────────────────────
36..43 | ForEach-Object { $ws.Rows($_).RowHeight = 19.5 }
$ws.Rows(36).RowHeight = 16.5      # 캡션 줄
$ws.Rows(37).RowHeight = 27        # 머리글 줄

# ── 6) 실구매액·이론소요액 — 원본은 빈 열을 참조해 늘 0 이었음 ───────
20..33 | ForEach-Object {
  $ws.Range("W$_").Formula = "=IF(OR(V$_="""",V$_=0),0,V$_*T$_*`$F$_)"
  $ws.Range("X$_").Formula = "=IF(OR(H$_="""",H$_=0),0,H$_*`$F$_/1000)"
}
$ws.Range("W34").Formula = "=SUM(W20:W33)"
$ws.Range("X34").Formula = "=SUM(X20:X33)"
$ws.Range("W35").Formula = "=W34-X34"

# ── 7) 워드마크 (좌상단) — 마침표만 브랜드 그린 ─────────────────────
$ws.Rows(1).RowHeight = 20
$c = $ws.Range("B1")
$c.Value2 = "FOODING LAB."
$c.Font.Name = "Arial"; $c.Font.Size = 12; $c.Font.Bold = $true
$c.Font.Color = 1974547                      # #13201B (BGR)
$c.Characters(12,1).Font.Color = 5404186     # #1A7452 (BGR)
$c.HorizontalAlignment = -4131               # 왼쪽

# ── 8) 견적합계 '합 계' 행만 딥그린 + 흰 글씨 ───────────────────────
#     (행 삭제로 67 → 57 로 밀렸음)
$sum = $ws.Range("F57:I57")
$sum.Interior.Color = 1974547
$sum.Font.Color = 16777215
$sum.Font.Bold = $true

# ── 9) 인쇄 — A4 한 장 ─────────────────────────────────────────────
$ws.PageSetup.PrintArea = "`$B`$1:`$O`$60"
$ws.PageSetup.Zoom = $false
$ws.PageSetup.FitToPagesWide = 1
$ws.PageSetup.FitToPagesTall = 1

$xl.Calculate()
$wb.SaveAs($OUT, 51)   # xlOpenXMLWorkbook

"합계행 = " + $ws.Range("F57").Text + " / " + $ws.Range("G57").Text
"원재료 G34=" + $ws.Range("G34").Text + " / 부자재 G43=" + $ws.Range("G43").Text + " / 가공 O43=" + $ws.Range("O43").Text
"실구매 W34=" + $ws.Range("W34").Text + " / 이론 X34=" + $ws.Range("X34").Text + " / 차액 W35=" + $ws.Range("W35").Text
"페이지 = " + $ws.PageSetup.Pages.Count

$wb.Close($false); $xl.Quit()
"saved $OUT"
