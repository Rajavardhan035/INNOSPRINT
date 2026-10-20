# InnoSprint 2026 — Google Apps Script Setup Guide

This guide describes how to configure and deploy the existing Google Apps Script project **`InnoSprint Email Sender`** to send automatic shortlisted project notifications.

---

## 1. Open the Existing Project

1. Navigate to [script.google.com](https://script.google.com/).
2. Locate and open your existing project named: **`InnoSprint Email Sender`**.
3. In the left editor file panel, select **`Code.gs`**.
4. Delete any existing template content, paste the entire contents of [`google-apps-script/Code.gs`](./Code.gs), and click **Save** (`Ctrl + S` or `Cmd + S`).

---

## 2. Configure the Shared Secret (Script Properties)

1. In the Google Apps Script left sidebar, click the **Project Settings** gear icon (⚙️).
2. Scroll down to the **Script Properties** section.
3. Click **Add script property**.
4. Enter:
   - **Property**: `EMAIL_WEBHOOK_SECRET`
   - **Value**: *[Generate a 32+ character random string or use the recommended secret generated below]*
5. Click **Save script properties**.

> **Note on Sender Account**:
> The emails will be sent from the Gmail account that executes the web app.
> For initial testing, deploy the script from your personal Gmail account.
> Later, when switching to the official hackathon email account, simply open Google Apps Script in that account, paste `Code.gs`, configure the property, and deploy.

---

## 3. Deploy as a Web App

1. In the top right corner of the Google Apps Script editor, click **Deploy** > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deployment configuration:
   - **Description**: `InnoSprint 2026 Shortlist Email Webhook v1`
   - **Execute as**: `Me (<your-email>@gmail.com)` *(determines who sends the emails)*
   - **Who has access**: `Anyone` *(required so Supabase Edge Function can call it using the shared secret)*
4. Click **Deploy**.
5. When prompted to **Authorize Access**:
   - Click **Authorize access**.
   - Choose your Google account.
   - If Google shows *"Google hasn't verified this app"*, click **Advanced**, then click **Go to InnoSprint Email Sender (unsafe)**.
   - Click **Allow** to grant permissions for `MailApp` (Send email as you).
6. Copy the **Web App URL** ending in `/exec`.
   - Format: `https://script.google.com/macros/s/AKfycbx.../exec`
   - Save this URL — you will configure it in Supabase as `EMAIL_WEBHOOK_URL`.

---

## 4. Test the Deployed Web App Directly (Optional)

Open your terminal or browser to verify that the web app is running:

```bash
# Health check (GET):
curl -L "https://script.google.com/macros/s/<YOUR_DEPLOYMENT_ID>/exec"

# Expected JSON response:
# {"success":true,"service":"InnoSprint Email Sender","status":"ONLINE","remainingDailyQuota":100,...}
```
