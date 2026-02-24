import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminRegistrationSettings from "@/components/AdminRegistrationSettings";
import { isAdminAuthenticatedFromCookieHeader } from "@/lib/admin-auth";

export default async function AdminRegistrationSettingsPage() {
  const headerStore = await headers();
  const isAdmin = isAdminAuthenticatedFromCookieHeader(headerStore.get("cookie"));
  if (!isAdmin) {
    redirect("/admin/login?next=/admin/settings");
  }

  return <AdminRegistrationSettings />;
}
