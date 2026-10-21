# InnoSprint 2026 — Google Apps Script Setup Guide

This guide describes how to configure and deploy the existing Google Apps Script project **`InnoSprint Email Notification`** to send automatic shortlisted project notifications.

---

## 1. Open the Existing Project

1. Navigate to [script.google.com](https://script.google.com/).
2. Locate and open your existing project named: **`InnoSprint Email Notification`**.
3. In the left editor file panel, select **`Code.gs`**.
4. Delete any existing template content, paste the entire contents of [`google-apps-script/Code.gs`](./Code.gs), and click **Save** (`Ctrl + S` or `Cmd + S`).

---

## 2. Authorize Permissions (One-Click)

1. In the Apps Script toolbar at the top, select the function **`testEmailAuthorization`** from the function dropdown.
2. Click **Run** (▶️).
3. Google will show an authorization prompt: **"Authorization required"**.
4. Click **Review permissions**, select your Google account, click **Advanced**, and click **Go to InnoSprint Email Notification (unsafe)** > **Allow**.
5. Check the execution log: you should see `SUCCESS: MailApp is authorized and working! Test email dispatched`.
6. You will also receive a test email in your inbox confirming Google has granted sending permissions.

---

## 3. Configure the Shared Secret (Script Properties)

1. In the Google Apps Script left sidebar, click the **Project Settings** gear icon (⚙️).
2. Scroll down to the **Script Properties** section.
3. Click **Add script property**.
4. Enter:
   - **Property**: `EMAIL_WEBHOOK_SECRET`
   - **Value**: *[The exact private secret configured in Supabase Edge Function secrets]*
5. Click **Save script properties**.

*(Alternative: You can also run `setWebhookSecret("YOUR_SECRET_HERE")` in the editor to save it automatically).*

---

## 4. Deploy as a Web App

1. In the top right corner of the Google Apps Script editor, click **Deploy** > **Manage deployments** (or **New deployment**).
2. Click the pencil (edit) icon on your deployment (or click **New deployment** > **Web app**):
   - **Execute as**: `Me (your-email@gmail.com)` *(determines who sends the emails)*
   - **Who has access**: `Anyone` *(Crucial: 'Only myself' or domain restrictions block Supabase)*
   - **Version**: Select **New version**
3. Click **Deploy**.
4. Copy the **Web App URL** ending in `/exec`.
   - Format: `https://script.google.com/macros/s/AKfycbx.../exec`
5. If the URL changed, update the Supabase Edge Function secret:
   ```bash
   npx supabase secrets set EMAIL_WEBHOOK_URL="https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec"
   ```

# Expected JSON response:
# {"success":true,"service":"InnoSprint Email Sender","status":"ONLINE","remainingDailyQuota":100,...}
```
