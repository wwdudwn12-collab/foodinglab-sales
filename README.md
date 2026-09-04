# FOODING LAB 제조컨설팅 관리 웹앱

라이브: https://foodinglab-sales.pages.dev/

## 구성
| 경로 | 역할 |
|---|---|
| `index.html`, `fl_app.js`, `fl_shell.html` | 앱 본체 (SPA) |
| `design-system.css` → `foodinglab-theme.css` → `app.css` | 스타일 3단. 링크 순서 = 우선순위 |
| `functions/api.js` | Cloudflare Pages Function. `/api` 프록시 + 메일 PIN 검사 |
| `백엔드_AppsScript/FoodingMail.gs` | 메일 발송 전용 Apps Script (Gmail 별칭 발송) |
| `quote-assets/` | 제조견적서 마스터 양식, 로고, 인감, 폰트 |
| `homepage/` | 별도 Pages 프로젝트 `foodinglab` (고객 신청폼 + KV 리드 저장) |
| `_tools/` | 일회성 빌드/패치 스크립트. 배포 불필요 |

## 배포 (Cloudflare Pages)
1. Cloudflare Pages → `foodinglab-sales` → Settings → Builds → **Connect to Git** 으로 이 저장소 연결
2. Build command 비움, Build output directory `/`
3. 환경변수 (Production): `MAIL_PIN`, `MAIL_KEY` — 이미 설정돼 있으면 그대로
4. 이후 `main` push마다 자동 배포

수동 배포:
```bash
wrangler pages deploy . --project-name foodinglab-sales
```

`homepage/`는 별도 프로젝트. 해당 폴더에서 `wrangler pages deploy public --project-name foodinglab`.

## 비밀값
- `MAIL_KEY` 실제 값은 Apps Script 편집기와 Pages 환경변수에만 둔다. 소스에 커밋하지 않는다.
- `FoodingMail.gs` 배포 시 `REPLACE_ME`를 실제 키로 바꿔 넣는다.
