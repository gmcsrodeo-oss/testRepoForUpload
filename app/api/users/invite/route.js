import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";


export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const appRole = String(body.appRole || "member").trim().toLowerCase();
    const functions = Array.isArray(body.functions) ? body.functions : [];
    const jobTitle = String(body.role || "Team Member").trim() || "Team Member";

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Enter a valid name and email address." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        message: "Email invitations require SUPABASE_SERVICE_ROLE_KEY on the server. Add it to your deployment environment and restart the app."
      }, { status: 500 });
    }

    // This key is server-only. Never expose it through a NEXT_PUBLIC variable.
    const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const origin = new URL(request.url).origin;
    const redirectTo = process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/auth/confirm`
      : `${origin}/auth/confirm`;

    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { name, jobTitle, appRole }
    });
    if (inviteError) {
      const status = /already registered|already been registered|already exists/i.test(inviteError.message) ? 409 : 400;
      return NextResponse.json({ success: false, message: inviteError.message }, { status });
    }

    const authUser = inviteData?.user;
    if (!authUser?.id) {
      return NextResponse.json({ success: false, message: "Supabase did not return an invited user." }, { status: 502 });
    }

    // The PostgreSQL enum `UserRoles` stores title-cased values, while the UI
    // uses lowercase role identifiers. Convert only at the database boundary.
    const databaseRole = ({ admin: "Admin", executive: "Executive", member: "Member" })[appRole];
    if (!databaseRole) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.id);
      return NextResponse.json({ success: false, message: `Unsupported application role: ${appRole}` }, { status: 400 });
    }

    // `role` is not a column in this project's users table; appRole is the
    // application permission field. Keep the job title in Auth user metadata.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .upsert({
        id: authUser.id,
        name,
        email,
        appRole: databaseRole,
        functions: appRole === "admin" || appRole === "executive" ? [
          "Operations", "Procurement", "Finance", "Accounting", "HR", "Marketing", "RCM", "Facilities", "Patient Loyalty"
        ] : functions,
        isDeleted: false
      }, { onConflict: "id" })
      .select()
      .single();

    if (profileError) {
      // Avoid leaving an Auth invite without its matching app profile.
      await supabaseAdmin.auth.admin.deleteUser(authUser.id);
      return NextResponse.json({ success: false, message: `Invitation email could not be completed because the user profile could not be saved: ${profileError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Invitation email sent to ${email}.`,
      data: { ...profile, appRole, role: jobTitle }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error?.message || "Unable to send invitation." }, { status: 500 });
  }
}
