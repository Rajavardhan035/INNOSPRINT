// ============================================================================
// Supabase Edge Function: send-project-notification
// InnoSprint 2026 — Project Shortlist Email Dispatcher via Google Apps Script
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Primary immutable site owner email
const PRIMARY_OWNER_EMAIL = "rajavardhan445@gmail.com";

/**
 * Returns dynamic CORS headers matching allowed frontend origins.
 * Strictly avoids wildcard '*' with credentials or unvalidated origins.
 */
function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = [
    "https://inno-sprint.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
  ];

  const isAllowed =
    allowedOrigins.includes(origin) ||
    /^https:\/\/inno-sprint-[a-z0-9-]+-vardhan-aeees-projects\.vercel\.app$/.test(origin) ||
    /^https:\/\/inno-sprint-[a-z0-9-]+\.vercel\.app$/.test(origin);

  const matchedOrigin = isAllowed ? origin : "https://inno-sprint.vercel.app";

  return {
    "Access-Control-Allow-Origin": matchedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-caller-email",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

/**
 * Helper to construct JSON response with mandatory CORS headers.
 */
function jsonResponse(req: Request, data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      ...getCorsHeaders(req),
      "Content-Type": "application/json",
    },
    status,
  });
}

interface RequestBody {
  submissionId?: string;
  registrationId?: string;
  forceRetry?: boolean;
  callerEmail?: string;
}

serve(async (req: Request) => {
  const cors = getCorsHeaders(req);

  // 1. Handle CORS preflight: RFC 7231 / Fetch standard strictly requires NULL body for status 204
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors, status: 204 });
  }

  if (req.method !== "POST") {
    return jsonResponse(req, { success: false, error: "Method not allowed. Use POST." }, 405);
  }

  try {
    // 2. Validate Supabase environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("[send-project-notification] Missing Supabase environment variables");
      return jsonResponse(
        req,
        { success: false, error: "Internal server error: Supabase service credentials missing." },
        500
      );
    }

    // Elevated client with service role for authoritative database operations
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    // 3. Parse request payload
    let body: RequestBody = {};
    try {
      body = await req.json();
    } catch {
      return jsonResponse(req, { success: false, error: "Malformed JSON payload." }, 400);
    }

    const targetId = (body.submissionId || body.registrationId || "").trim();
    const forceRetry = Boolean(body.forceRetry);

    if (!targetId) {
      return jsonResponse(
        req,
        { success: false, error: "Bad Request: Missing submissionId or registrationId parameter." },
        400
      );
    }

    // 4. Authenticate caller & verify admin privileges
    const authHeader = req.headers.get("Authorization") || "";
    let callerEmail = "";
    let isAuthorized = false;

    // Check A: Try verifying Supabase Auth JWT if present
    if (authHeader.startsWith("Bearer ")) {
      const rawToken = authHeader.replace("Bearer ", "").trim();

      // If token matches service role key directly, elevate immediately
      if (rawToken === supabaseServiceRoleKey) {
        isAuthorized = true;
        callerEmail = PRIMARY_OWNER_EMAIL;
      } else {
        try {
          const userClient = createClient(supabaseUrl, supabaseAnonKey || "", {
            global: { headers: { Authorization: authHeader } },
            auth: { persistSession: false },
          });

          const { data: { user }, error: userError } = await userClient.auth.getUser();
          if (!userError && user?.email) {
            callerEmail = user.email.trim().toLowerCase();
          }
        } catch {}
      }
    }

    // Check B: Fallback caller identity from request body / header if userClient.auth.getUser() was not populated
    // (e.g. admin authenticated via dashboard admin list rather than GoTrue password)
    if (!callerEmail) {
      const candidate = (
        req.headers.get("x-caller-email") ||
        body.callerEmail ||
        ""
      ).trim().toLowerCase();
      if (candidate) {
        callerEmail = candidate;
      }
    }

    // Check C: Validate candidate caller against authoritative admin registers
    if (!isAuthorized && callerEmail) {
      // 1. Immutable primary owner
      if (callerEmail === PRIMARY_OWNER_EMAIL) {
        isAuthorized = true;
      }

      // 2. Live SYS-AUTH-ADMINS cloud registry
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
          console.warn("[send-project-notification] Notice inspecting SYS-AUTH-ADMINS:", e);
        }
      }

      // 3. user_roles database table
      if (!isAuthorized) {
        try {
          const { data: roleRows } = await adminClient
            .from("user_roles")
            .select("role, user_id")
            .maybeSingle();

          // Also check by email if user_roles has email or user_id
          const { data: authUser } = await adminClient.auth.admin.listUsers();
          const matchedUser = authUser?.users?.find(
            (u) => u.email?.toLowerCase().trim() === callerEmail
          );

          if (matchedUser) {
            const { data: userRole } = await adminClient
              .from("user_roles")
              .select("role")
              .eq("user_id", matchedUser.id)
              .maybeSingle();

            if (userRole && ["organizer", "superadmin"].includes(userRole.role)) {
              isAuthorized = true;
            }
          }
        } catch {}
      }
    }

    if (!isAuthorized) {
      console.warn(`[send-project-notification] Unauthorized access attempt: ${callerEmail || "Anonymous"}`);
      return jsonResponse(
        req,
        {
          success: false,
          error: "Forbidden: You do not have organizer or superadmin permissions to trigger project notifications.",
        },
        403
      );
    }

    // 5. Fetch authoritative project record from Supabase
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
      return jsonResponse(
        req,
        { success: false, error: `Project record not found for identifier: ${targetId}` },
        404
      );
    }

    // 6. Verify that project is actually approved / shortlisted in Supabase
    const projectStatus = String(registrationRecord.status || "").toLowerCase().trim();
    if (projectStatus !== "approved") {
      return jsonResponse(
        req,
        {
          success: false,
          error: `Cannot send shortlist notification: Current project status is '${projectStatus}'. Shortlist notifications can only be dispatched for approved projects.`,
          currentStatus: projectStatus,
        },
        400
      );
    }

    // 7. Extract & validate recipient email and project info from database record
    const recipientEmail = (
      registrationRecord.applicant_email ||
      registrationRecord.user_email ||
      ""
    ).trim();

    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return jsonResponse(
        req,
        {
          success: false,
          error: `Invalid or missing recipient email address in database record: '${recipientEmail}'`,
        },
        422
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

    // 8. Atomic Concurrency & Idempotency Check via record_notification_attempt RPC
    let notificationRowId: string | null = null;
    let rpcHandled = false;

    try {
      const { data: rpcRows, error: rpcError } = await adminClient.rpc(
        "record_notification_attempt",
        {
          p_registration_id: registrationRecord.id,
          p_submission_id: projectSubmissionRecord?.id || null,
          p_recipient_email: recipientEmail,
          p_team_name: teamName,
          p_project_title: projectTitle,
          p_notification_type: "shortlisted",
          p_force_retry: Boolean(forceRetry),
        }
      );

      if (!rpcError && rpcRows && rpcRows.length > 0) {
        rpcHandled = true;
        const record = rpcRows[0];
        notificationRowId = record.notification_id;

        // If already delivered and not forced, return idempotent success
        if (record.already_sent && !forceRetry) {
          return jsonResponse(
            req,
            {
              success: true,
              delivered: true,
              alreadySent: true,
              message: "Shortlist email notification was already sent to this team.",
              recipient: recipientEmail,
              teamName: teamName,
              projectTitle: projectTitle,
              referenceCode: referenceCode,
            },
            200
          );
        }

        // Concurrency guard: If attempt is throttled or cannot proceed
        if (!record.can_proceed) {
          return jsonResponse(
            req,
            {
              success: false,
              error: "A notification dispatch is currently in progress for this team. Please wait.",
            },
            429
          );
        }
      } else if (rpcError) {
        console.warn("[send-project-notification] RPC record_notification_attempt notice (falling back to direct table):", rpcError.message);
      }
    } catch (rpcErr) {
      console.warn("[send-project-notification] RPC invocation exception (falling back):", rpcErr);
    }

    // Direct table fallback if RPC is not present
    let hasNotificationTable = true;
    if (!rpcHandled) {
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

          if (existingNotif.status === "delivered" && !forceRetry) {
            return jsonResponse(
              req,
              {
                success: true,
                delivered: true,
                alreadySent: true,
                message: "Shortlist email notification was already sent to this team.",
                recipient: recipientEmail,
                teamName: teamName,
                projectTitle: projectTitle,
                referenceCode: referenceCode,
                sentAt: existingNotif.sent_at,
              },
              200
            );
          }

          if (existingNotif.status === "pending") {
            const lastAttempt = new Date(existingNotif.last_attempt_at || 0).getTime();
            const now = Date.now();
            if (now - lastAttempt < 30000 && !forceRetry) {
              return jsonResponse(
                req,
                {
                  success: false,
                  error: "A notification dispatch is currently in progress for this team. Please wait.",
                },
                429
              );
            }
          }
        }
      } catch {
        hasNotificationTable = false;
      }

      if (hasNotificationTable) {
        try {
          if (notificationRowId) {
            await adminClient
              .from("project_notifications")
              .update({
                status: "pending",
                attempt_count: 1,
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
    }

    // 9. Retrieve Google Apps Script Webhook secrets
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

      return jsonResponse(
        req,
        {
          success: false,
          delivered: false,
          canRetry: true,
          error: configErrMsg,
        },
        503
      );
    }

    // 10. Dispatch to Google Apps Script Webhook
    let urlInfo = "";
    try {
      const u = new URL(webhookUrl);
      urlInfo = `${u.hostname}${u.pathname.slice(-8)}`;
    } catch {}
    console.info(`[send-project-notification] Dispatching shortlist email to GAS webhook (${urlInfo}) for: ${recipientEmail} (${teamName})`);

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

      return jsonResponse(
        req,
        {
          success: false,
          delivered: false,
          canRetry: true,
          error: errMsg,
        },
        502
      );
    }

    clearTimeout(timeoutId);

    // 11. Parse Google Apps Script Response
    let responseData: any = null;
    const responseText = await gasResponse.text();

    try {
      responseData = JSON.parse(responseText);
    } catch {
      console.error("[send-project-notification] GAS returned non-JSON response:", responseText);
      const snippet = responseText.slice(0, 150).replace(/\s+/g, ' ');
      const isLoginHtml = snippet.includes("<!DOCTYPE html>") || snippet.includes("<html");
      const gasDiag = isLoginHtml
        ? "Google Apps Script returned a Google login HTML page instead of executing. In Google Apps Script Deployment settings: 1) Set 'Who has access' to 'Anyone' (not 'Only myself'), 2) Ensure the webhook URL ends in '/exec' (not '/dev'), and 3) Click 'Run' on doGet once in Apps Script to authorize permissions."
        : `Google Apps Script returned an invalid response (HTTP ${gasResponse.status}): ${snippet}`;

      const nonJsonErr = `${gasDiag} (Endpoint target: ${urlInfo})`;

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

      return jsonResponse(
        req,
        {
          success: false,
          delivered: false,
          canRetry: true,
          error: nonJsonErr,
        },
        502
      );
    }

    // 12. Check delivery success
    if (gasResponse.ok && responseData?.success === true && responseData?.delivered === true) {
      const nowIso = new Date().toISOString();

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

      return jsonResponse(
        req,
        {
          success: true,
          delivered: true,
          recipient: recipientEmail,
          teamName: teamName,
          projectTitle: projectTitle,
          referenceCode: referenceCode,
          sentAt: nowIso,
          quotaRemaining: responseData.quotaRemaining,
        },
        200
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

      return jsonResponse(
        req,
        {
          success: false,
          delivered: false,
          canRetry: true,
          error: dispatchError,
        },
        gasResponse.status === 401 ? 401 : 502
      );
    }
  } catch (err: any) {
    console.error("[send-project-notification] Unhandled Exception:", err);
    return jsonResponse(
      req,
      {
        success: false,
        error: "Internal Error: " + (err.message || "An unexpected error occurred."),
      },
      500
    );
  }
});
