/**
 * 푸딩랩 웹앱 전용 메일 발송 백엔드 (독립 Apps Script)
 * ─────────────────────────────────────────────────────────
 * 왜 따로 두나: 영업웹앱 백엔드는 구글 로그인(세션)이 있어야 통과한다.
 * 푸딩랩 웹앱은 로그인이 없어서 그 게이트를 못 넘는다.
 * 라이브 영업 백엔드를 건드리면 영업팀 전체가 걸리므로, 메일 한 가지만 하는
 * 작은 스크립트를 따로 배포한다.
 *
 * 인증: Cloudflare Pages Function(functions/api.js)이 붙여 보내는 MAIL_KEY 하나.
 *       키는 엣지 환경변수에만 있고 브라우저로는 절대 내려가지 않는다.
 *       (사용자 PIN 확인은 엣지에서 끝난다)
 */
const MAIL_KEY  = 'REPLACE_ME'; // 실제 값은 Apps Script 편집기에만 입력. 저장소에 커밋 금지
const MAIL_FROM = 'youngjoo@seoraebio.com';
const MAIL_NAME = '서래바이오 박영주';

function doPost(e) {
  try {
    const b = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (String(b.key || '') !== MAIL_KEY) return json_({ error: '키 불일치' });
    if (b.action !== 'sendMail')          return json_({ error: '알 수 없는 action' });
    return json_(sendMail_(b.mail));
  } catch (err) { return json_({ error: String(err && err.message || err) }); }
}

function doGet() { return json_({ ok: true, service: 'foodinglab-mail' }); }

function sendMail_(p) {
  if (!p || !p.to) return { error: '받는사람 없음' };
  const opt = { htmlBody: p.html || '', name: MAIL_NAME, cc: p.cc || '', bcc: p.bcc || '' };
  // 별칭이 없는 계정에서 from을 주면 발송 자체가 실패한다 → 있을 때만 붙인다
  if (GmailApp.getAliases().indexOf(MAIL_FROM) >= 0) opt.from = MAIL_FROM;

  const blobs = [];
  let bytes = 0;
  (p.attachments || []).forEach(f => {
    if (!f || !f.base64) return;
    const raw = Utilities.base64Decode(f.base64);
    bytes += raw.length;
    blobs.push(Utilities.newBlob(raw, f.mimeType || 'application/octet-stream', f.fileName || '첨부파일'));
  });
  if (bytes > 24 * 1024 * 1024) return { error: '첨부 용량 초과(24MB) — ' + Math.round(bytes / 1048576) + 'MB' };
  if (blobs.length) opt.attachments = blobs;

  GmailApp.sendEmail(p.to, p.subject || '(제목 없음)', p.text || '', opt);
  return { ok: true, attached: blobs.length };
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

// 최초 1회 권한 승인용 — 편집기에서 이 함수를 직접 실행
function authTestMail() {
  GmailApp.getAliases();
  GmailApp.sendEmail(MAIL_FROM, '[권한확인] 푸딩랩 메일 발송', '권한 승인 완료.');
}
