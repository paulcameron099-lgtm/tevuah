import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BUCKET = "staff-handbooks";
const MIME = new Set(["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
const MAX = 10 * 1024 * 1024;
async function authorize(context: Context) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin"))
    return { error: NextResponse.json({ error: "Admin access required." }, { status: user ? 403 : 401 }) };
  const { id } = await context.params;
  if (!UUID.test(id)) return { error: NextResponse.json({ error: "Invalid applicant ID." }, { status: 400 }) };
  const admin = createAdminClient();
  const { data, error } = await admin.from("staff_applicants").select("id,handbook_storage_path,handbook_file_name,handbook_content_type").eq("id", id).maybeSingle();
  if (error) return { error: NextResponse.json({ error: "Unable to load applicant." }, { status: 500 }) };
  if (!data) return { error: NextResponse.json({ error: "Applicant not found." }, { status: 404 }) };
  return { id, admin, applicant: data };
}
export async function POST(request: Request, context: Context) {
  const auth = await authorize(context);
  if (auth.error) return auth.error;
  const { id, admin, applicant } = auth;
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a handbook file." }, { status: 400 });
  const extension = file.name.toLowerCase().endsWith(".pdf") ? "pdf" : file.name.toLowerCase().endsWith(".docx") ? "docx" : null;
  if (!extension || !MIME.has(file.type) || file.size === 0 || file.size > MAX)
    return NextResponse.json({ error: "Use a PDF or DOCX file up to 10 MB." }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  if (extension === "pdf" && bytes.subarray(0, 5).toString() !== "%PDF-")
    return NextResponse.json({ error: "Invalid PDF file." }, { status: 400 });
  if (extension === "docx" && bytes.subarray(0, 2).toString() !== "PK")
    return NextResponse.json({ error: "Invalid DOCX file." }, { status: 400 });
  const path = `${id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, bytes, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: "Handbook upload failed." }, { status: 500 });
  const filename = file.name.replace(/[\r\n\\/]/g, "_").slice(0, 180);
  const { error: updateError } = await admin.from("staff_applicants").update({ handbook_storage_path: path, handbook_file_name: filename, handbook_content_type: file.type, updated_at: new Date().toISOString() }).eq("id", id);
  if (updateError) {
    await admin.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: "Could not save handbook details." }, { status: 500 });
  }
  if (applicant!.handbook_storage_path) {
    const { error } = await admin.storage.from(BUCKET).remove([applicant!.handbook_storage_path]);
    if (error) console.error("[STAFF HANDBOOK] Old file cleanup failed", error);
  }
  return NextResponse.json({ success: true, filename, contentType: file.type });
}
export async function GET(_request: Request, context: Context) {
  const auth = await authorize(context);
  if (auth.error) return auth.error;
  const { admin, applicant } = auth;
  if (!applicant!.handbook_storage_path) return NextResponse.json({ error: "No handbook uploaded." }, { status: 404 });
  const { data, error } = await admin.storage.from(BUCKET).download(applicant!.handbook_storage_path);
  if (error || !data) return NextResponse.json({ error: "Unable to download handbook." }, { status: 500 });
  const filename = (applicant!.handbook_file_name || "handbook.pdf").replace(/[\r\n"\\]/g, "_");
  return new Response(await data.arrayBuffer(), { headers: { "Content-Type": applicant!.handbook_content_type || "application/octet-stream", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
export async function DELETE(_request: Request, context: Context) {
  const auth = await authorize(context);
  if (auth.error) return auth.error;
  const { id, admin, applicant } = auth;
  if (!applicant!.handbook_storage_path) return NextResponse.json({ success: true });
  const { error } = await admin.from("staff_applicants").update({ handbook_storage_path: null, handbook_file_name: null, handbook_content_type: null, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: "Unable to remove handbook reference." }, { status: 500 });
  const removed = await admin.storage.from(BUCKET).remove([applicant!.handbook_storage_path]);
  if (removed.error) console.error("[STAFF HANDBOOK] Cleanup failed", removed.error);
  return NextResponse.json({ success: true });
}