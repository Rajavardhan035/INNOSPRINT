// ============================================================================
// Supabase Edge Function: send-project-notification
// InnoSprint 2026 — Project Shortlist Email Dispatcher via Google Apps Script
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Standard CORS headers for Supabase Edge Functions
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Primary site owner email
const PRIMARY_OWNER_EMAIL = "rajavardhan445@gmail.com";

interface RequestBody {
  submissionId?: string;
  registrationId?: string;
  forceRetry?: boolean;
}

serve(async (req: Request) => {
  // 1. Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 204 });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed. Use POST." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 }
    );
  }

  try {
    // 2. Validate Supabase environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("[send-project-notification] Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ success: false, error: "Internal server error: Supabase service credentials missing." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // 3. Authenticate caller via JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required: Missing Authorization header." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Client bound to caller's JWT to verify identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey || "", {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Invalid or expired session token." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const callerEmail = (user.email || "").trim().toLowerCase();

    // 4. Verify admin authorization
    // Elevated client with service role to inspect permissions & project data
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    let isAuthorized = false;

    // Check 1: Primary immutable owner
    if (callerEmail === PRIMARY_OWNER_EMAIL) {
      isAuthorized = true;
    }

    // Check 2: Live SYS-AUTH-ADMINS cloud registry
    if (!isAuthorized) {
      try {
        const { data: sysRecord } = await adminClient
          .from("registrations")
          .select("organizer_notes")
          .eq("reference_code", "SYS-AUTH-ADMINS")
          .maybeSingle();

        if (sysRecord?.organizer_notes) {
          try {
            const parsed = JSON.parse(sysRecord.organizer_notes);
            let activeList: Array<{ email?: string }> = [];
            let revokedList: string[] = [];

            if (Array.isArray(parsed)) {
              activeList = parsed;
            } else if (parsed && typeof parsed === "object") {
              if (Array.isArray(parsed.admins)) activeList = parsed.admins;
              if (Array.isArray(parsed.revoked)) {
                revokedList = parsed.revoked.map((e: string) => String(e).toLowerCase().trim());
              }
            }

            if (!revokedList.includes(callerEmail)) {
              isAuthorized = activeList.some(
                (a) => String(a.email || "").toLowerCase().trim() === callerEmail
              );
            }
          } catch {}
        }
      } catch (e) {
        console.warn("[send-project-notification] Error checking SYS-AUTH-ADMINS:", e);
      }
    }

    // Check 3: user_roles table
    if (!isAuthorized) {
      try {
        const { data: roleData } = await adminClient
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (roleData && ["organizer", "superadmin"].includes(roleData.role)) {
          isAuthorized = true;
        }
      } catch {}
    }

    if (!isAuthorized) {
      console.warn(`[send-project-notification] Unauthorized access attempt by user: ${callerEmail} (${user.id})`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Forbidden: You do not have organizer or superadmin permissions to trigger project notifications.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // 5. Parse and validate request parameters
    const body: RequestBody = await req.json().catch(() => ({}));
    const targetId = (body.submissionId || body.registrationId || "").trim();
    const forceRetry = Boolean(body.forceRetry);

    if (!targetId) {
      return new Response(
        JSON.stringify({ success: false, error: "Bad Request: Missing submissionId or registrationId parameter." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 6. Fetch authoritative project record from Supabase
    // We check `registrations` first, then `project_submissions`
    let registrationRecord: any = null;
    let projectSubmissionRecord: any = null;

    // Check registrations by UUID id or reference_code
    const { data: regData } = await adminClient
      .from("registrations")
      .select("*, teams(id, team_name)")
      .or(`id.eq.${targetId},reference_code.eq.${targetId}`)
      .maybeSingle();

    if (regData) {
      registrationRecord = regData;
    } else {
      // Check project_submissions by ID
      const { data: subData } = await adminClient
        .from("project_submissions")
        .select("*, registrations(*, teams(id, team_name))")
        .eq("id", targetId)
        .maybeSingle();

      if (subData) {
        projectSubmissionRecord = subData;
        registrationRecord = subData.registrations;
      }
    }

    if (!registrationRecord) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Project record not found for identifier: ${targetId}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // 7. Verify that project is actually approved / shortlisted
    const projectStatus = String(registrationRecord.status || "").toLowerCase().trim();
    if (projectStatus !== "approved") {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Cannot send shortlist notification: Current project status is '${projectStatus}'. Shortlist notifications can only be dispatched for approved projects.`,
          currentStatus: projectStatus,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 8. Extract & validate recipient email and project info from database
    const recipientEmail = (
      registrationRecord.applicant_email ||
      registrationRecord.user_email ||
      ""
    ).trim();

    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid or missing recipient email address in database record: '${recipientEmail}'`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 }
      );
    }

    const teamName = (
      registrationRecord.teams?.team_name ||
      registrationRecord.applicant_name ||
      "Innovators"
    ).trim();

    const projectTitle = (
      projectSubmissionRecord?.title ||
      registrationRecord.project_title ||
      "Untitled Innovation Pitch"
    ).trim();

    const referenceCode = registrationRecord.reference_code || "";
    const theme = registrationRecord.theme || "";

    // 9. Concurrency & Idempotency Check
    // Check if project_notifications table exists and if an email was already delivered
    let notificationRowId: string | null = null;
    let hasNotificationTable = true;

    try {
      const { data: existingNotif, error: notifCheckErr } = await adminClient
        .from("project_notifications")
        .select("*")
        .eq("registration_id", registrationRecord.id)
        .eq("notification_type", "shortlisted")
        .maybeSingle();

      if (notifCheckErr && notifCheckErr.code === "PGRST205") {
        hasNotificationTable = false;
      } else if (existingNotif) {
        notificationRowId = existingNotif.id;

        // If already delivered and not forced, return idempotent success
        if (existingNotif.status === "delivered" && !forceRetry) {
          return new Response(
            JSON.stringify({
              success: true,
              delivered: true,
              alreadySent: true,
              message: "Shortlist email notification was already sent to this team.",
              recipient: recipientEmail,
              teamName: teamName,
              projectTitle: projectTitle,
              referenceCode: referenceCode,
              sentAt: existingNotif.sent_at,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }

        // Concurrency guard: If already pending and attempted within last 30s, reject duplicate click
        if (existingNotif.status === "pending") {
          const lastAttempt = new Date(existingNotif.last_attempt_at || 0).getTime();
          const now = Date.now();
          if (now - lastAttempt < 30000 && !forceRetry) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "A notification dispatch is currently in progress for this team. Please wait.",
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
            );
          }
        }
      }
    } catch {
      hasNotificationTable = false;
    }

    // 10. Record Pending Attempt in Database
    if (hasNotificationTable) {
      try {
        if (notificationRowId) {
          await adminClient
            .from("project_notifications")
            .update({
              status: "pending",
              attempt_count: adminClient.rpc
                ? undefined
                : 1, // Will be incremented or tracked
              last_attempt_at: new Date().toISOString(),
              error_message: null,
            })
            .eq("id", notificationRowId);
        } else {
          const { data: newRow } = await adminClient
            .from("project_notifications")
            .insert({
              registration_id: registrationRecord.id,
              submission_id: projectSubmissionRecord?.id || null,
              recipient_email: recipientEmail,
              team_name: teamName,
              project_title: projectTitle,
              notification_type: "shortlisted",
              status: "pending",
              attempt_count: 1,
              last_attempt_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (newRow) notificationRowId = newRow.id;
        }
      } catch (e) {
        console.warn("[send-project-notification] Warning writing pending notification record:", e);
      }
    }

    // 11. Retrieve Google Apps Script Webhook secrets
    const webhookUrl = Deno.env.get("EMAIL_WEBHOOK_URL");
    const webhookSecret = Deno.env.get("EMAIL_WEBHOOK_SECRET");

    if (!webhookUrl || !webhookSecret) {
      console.error("[send-project-notification] Missing EMAIL_WEBHOOK_URL or EMAIL_WEBHOOK_SECRET in Supabase secrets");
      
      const configErrMsg = "Server Configuration Notice: EMAIL_WEBHOOK_URL or EMAIL_WEBHOOK_SECRET is not yet configured in Supabase Edge Function secrets.";
      
      if (hasNotificationTable && notificationRowId) {
        await adminClient
          .from("project_notifications")
          .update({
            status: "failed",
            error_message: configErrMsg,
          })
          .eq("id", notificationRowId);
      }

      return new Response(
        JSON.stringify({
          success: false,
          delivered: false,
          canRetry: true,
          error: configErrMsg,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
      );
    }

    // 12. Dispatch to Google Apps Script Webhook
    console.info(`[send-project-notification] Dispatching shortlist email to GAS webhook for: ${recipientEmail} (${teamName})`);

    const gasPayload = {
      secret: webhookSecret,
      recipientEmail: recipientEmail,
      teamName: teamName,
      projectTitle: projectTitle,
      notificationType: "shortlisted",
      referenceCode: referenceCode,
      theme: theme,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    let gasResponse: Response;
    try {
      gasResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gasPayload),
        signal: controller.signal,
        redirect: "follow", // Follow GAS 302 redirects automatically
      });
    } catch (networkError: any) {
      clearTimeout(timeoutId);
      const isTimeout = networkError.name === "AbortError";
      const errMsg = isTimeout
        ? "Google Apps Script request timed out after 20 seconds."
        : `Network error reaching Google Apps Script: ${networkError.message || networkError}`;

      console.error("[send-project-notification] GAS Fetch Error:", errMsg);

      if (hasNotificationTable && notificationRowId) {
        await adminClient
          .from("project_notifications")
          .update({
            status: "failed",
            error_message: errMsg,
          })
          .eq("id", notificationRowId);
      }

      return new Response(
        JSON.stringify({
          success: false,
          delivered: false,
          canRetry: true,
          error: errMsg,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
      );
    }

    clearTimeout(timeoutId);

    // 13. Parse Google Apps Script Response
    let responseData: any = null;
    const responseText = await gasResponse.text();

    try {
      responseData = JSON.parse(responseText);
    } catch {
      console.error("[send-project-notification] GAS returned non-JSON response:", responseText);
      const nonJsonErr = `Google Apps Script returned an invalid response (HTTP ${gasResponse.status}).`;

      if (hasNotificationTable && notificationRowId) {
        await adminClient
          .from("project_notifications")
          .update({
            status: "failed",
            error_message: nonJsonErr,
            response_payload: { raw: responseText.slice(0, 500) },
          })
          .eq("id", notificationRowId);
      }

      return new Response(
        JSON.stringify({
          success: false,
          delivered: false,
          canRetry: true,
          error: nonJsonErr,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
      );
    }

    // 14. Check delivery success
    if (gasResponse.ok && responseData?.success === true && responseData?.delivered === true) {
      const nowIso = new Date().toISOString();

      // Update project_notifications record
      if (hasNotificationTable && notificationRowId) {
        await adminClient
          .from("project_notifications")
          .update({
            status: "delivered",
            sent_at: nowIso,
            error_message: null,
            response_payload: responseData,
          })
          .eq("id", notificationRowId);
      }

      // Dual-resilient stamp in organizer_notes
      try {
        const currentNotes = registrationRecord.organizer_notes || "";
        const emailStamp = `[EMAIL_SHORTLIST_SENT: ${nowIso} to ${recipientEmail}]`;
        if (!currentNotes.includes("EMAIL_SHORTLIST_SENT")) {
          await adminClient
            .from("registrations")
            .update({
              organizer_notes: currentNotes ? `${currentNotes}\n${emailStamp}` : emailStamp,
              updated_at: nowIso,
            })
            .eq("id", registrationRecord.id);
        }
      } catch {}

      console.info(`[send-project-notification] Successfully delivered email to ${recipientEmail}`);

      return new Response(
        JSON.stringify({
          success: true,
          delivered: true,
          recipient: recipientEmail,
          teamName: teamName,
          projectTitle: projectTitle,
          referenceCode: referenceCode,
          sentAt: nowIso,
          quotaRemaining: responseData.quotaRemaining,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else {
      const dispatchError = responseData?.error || `Email delivery failed (HTTP ${gasResponse.status}).`;
      console.error("[send-project-notification] GAS returned delivery failure:", dispatchError);

      if (hasNotificationTable && notificationRowId) {
        await adminClient
          .from("project_notifications")
          .update({
            status: "failed",
            error_message: dispatchError,
            response_payload: responseData,
          })
          .eq("id", notificationRowId);
      }

      return new Response(
        JSON.stringify({
          success: false,
          delivered: false,
          canRetry: true,
          error: dispatchError,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: gasResponse.status === 401 ? 401 : 502 }
      );
    }

  } catch (err: any) {
    console.error("[send-project-notification] Unhandled Exception:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal Error: " + (err.message || "An unexpected error occurred."),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
