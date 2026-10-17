import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/neon-auth/server";
import { getUserPastes } from "@/lib/paste-service";
import { SiteHeader } from "@/components/site-header";
import { UserPastesList } from "@/components/user-pastes-list";

export const dynamic = "force-dynamic";

export default async function MyPastesPage() {
  let user: { id: string; name?: string | null; email?: string | null } | null = null;
  try {
    const session = await auth.getSession();
    user = session?.data?.user ?? null;
  } catch {
    user = null;
  }

  if (!user) {
    redirect("/auth/sign-in");
  }

  const pastes = await getUserPastes(user.id);
  const displayName = user.name || (user.email ? user.email.split("@")[0] : "User");

  return (
    <>
      <SiteHeader />
      <main className="shell dashboard-page">
        <div className="dashboard-header">
          <div>
            <span className="eyebrow">DASHBOARD</span>
            <h1>My Pastes</h1>
            <p>
              Pastes created by <strong>{displayName}</strong>
              {user.email ? ` (${user.email})` : ""}
            </p>
          </div>
          <Link href="/" className="primary-button">
            + New paste
          </Link>
        </div>

        <UserPastesList initialPastes={pastes} />
      </main>
    </>
  );
}
