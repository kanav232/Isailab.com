/**
 * ISAiL — Indo Youth AI Leadership Program application form backend.
 *
 * Receives submissions from the form on isailab.com and appends them as rows
 * to the Google Sheet this script is attached to. Optionally emails the
 * applicant a confirmation and notifies the team.
 *
 * Setup: see form-backend/SETUP.md
 */

// ---- Settings ----
const SHEET_NAME = 'Applications';
const SEND_CONFIRMATION_TO_APPLICANT = true;
const NOTIFY_TEAM_EMAIL = 'contact@isailab.com'; // set to '' to turn off team notifications

// Column order in the sheet. Keys must match the form's `name` attributes.
const FIELDS = [
  ['timestamp', 'Submitted at'],
  ['name', 'Full name'],
  ['email', 'Email'],
  ['phone', 'Phone / WhatsApp'],
  ['city', 'City'],
  ['state', 'State / UT'],
  ['grade', 'Grade'],
  ['school', 'School'],
  ['board', 'Board'],
  ['stream', 'Stream'],
  ['parent_name', 'Parent / guardian name'],
  ['parent_phone', 'Parent / guardian phone'],
  ['parent_email', 'Parent / guardian email'],
  ['why_join', 'Why join'],
  ['led_or_created', 'Started, led or created'],
  ['residence', 'Residence requested'],
  ['source', 'Heard about us via'],
  ['citizen', 'Indian citizen'],
  ['english', 'Comfortable in English'],
  ['consent', 'Parent consent'],
  ['accurate', 'Info accurate'],
  ['program', 'Program'],
  ['submitted_from', 'Page'],
  ['status', 'Status'], // for the team: Shortlisted / GD scheduled / Selected / Paid ...
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const p = (e && e.parameter) || {};
    if (p.website) return ok_(); // spam trap
    if (!p.name || !p.email) return ok_();

    const sheet = getSheet_();
    const row = FIELDS.map(([key]) => {
      if (key === 'timestamp') return new Date();
      if (key === 'status') return 'New';
      return clean_(p[key]);
    });
    sheet.appendRow(row);

    if (SEND_CONFIRMATION_TO_APPLICANT) {
      MailApp.sendEmail({
        to: p.email,
        subject: 'We received your application: Indo Youth AI Leadership Program',
        htmlBody:
          '<p>Dear ' + escape_(p.name) + ',</p>' +
          '<p>Thank you for applying to the <b>Indo Youth AI Leadership Program</b> (26 to 31 December 2026, IIIT Delhi).</p>' +
          '<p>Our team will review your application. Shortlisted applicants will be invited by email to the Group Discussion round.</p>' +
          '<p>Questions? Just reply to this email or write to contact@isailab.com.</p>' +
          '<p>ISAiL (Indo Secure AI Lab)</p>',
        name: 'ISAiL',
        replyTo: 'contact@isailab.com',
      });
    }

    if (NOTIFY_TEAM_EMAIL) {
      MailApp.sendEmail(
        NOTIFY_TEAM_EMAIL,
        'New application: ' + clean_(p.name) + ' (' + clean_(p.grade) + ', ' + clean_(p.city) + ')',
        'A new application was submitted. Open the sheet: ' + SpreadsheetApp.getActive().getUrl()
      );
    }
    return ok_();
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(FIELDS.map(([, label]) => label));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, FIELDS.length).setFontWeight('bold');
  }
  return sheet;
}

// Stops spreadsheet formula injection and trims long input.
function clean_(v) {
  v = (v == null ? '' : String(v)).slice(0, 5000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function escape_(s) {
  return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function ok_() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

// Run once from the editor to create the header row and approve permissions.
function setup() {
  getSheet_();
}
