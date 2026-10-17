import { AuthView } from "@neondatabase/auth-ui";
import { authViewPaths } from "@neondatabase/auth-ui/server";
import { SiteHeader } from "@/components/site-header";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({
    path
  }));
}

export default async function AuthPage({
  params
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  return (
    <>
      <SiteHeader />
      <main className="container mx-auto flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
        <AuthView path={path} redirectTo={path === "sign-out" ? "/" : undefined} />
      </main>
    </>
  );
}
