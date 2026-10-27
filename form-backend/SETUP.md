# Connecting the application form

The form on isailab.com sends each application to a Google Sheet through a small Google Apps Script. Setup takes about 5 minutes and is free.

1. Sign in to the Google account that should own the applications (ideally the contact@isailab.com account).
2. Create a new Google Sheet, e.g. "Indo Youth AI Leadership Program 2026 – Applications".
3. In the sheet, open **Extensions → Apps Script**. Delete the sample code and paste in everything from `apps-script.gs`.
4. Check the settings at the top of the script (confirmation email to applicants, team notification address). Save.
5. Pick the `setup` function from the toolbar dropdown and click **Run**. Approve the permissions when Google asks. This creates the "Applications" tab with headers.
6. Click **Deploy → New deployment**. Choose type **Web app**, set:
   - Execute as: **Me**
   - Who has access: **Anyone**
   Then click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
7. In `assets/site.js`, find this line at the very top and paste the URL between the quotes:
   ```js
   const FORM_ENDPOINT = '';
   ```
8. Commit and push. Submit a test application at isailab.com/youth-ai-leadership and check that a row appears in the sheet.

## Notes

- Until `FORM_ENDPOINT` is set, the form validates normally but shows "Applications are not open yet" on submit, so nothing is lost silently.
- If you edit the script later, use **Deploy → Manage deployments → Edit → New version** so the same URL keeps working.
- The last column, **Status**, is for the team to track each applicant (Shortlisted, GD scheduled, Selected, Paid).
- Gmail accounts can send about 100 emails a day through Apps Script (Google Workspace accounts: 1,500). If you expect more applications than that per day, set `SEND_CONFIRMATION_TO_APPLICANT` to `false`.
- The sheet holds personal details of minors and their parents. Keep sharing limited to the people running selection.
