import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { can, type Permission } from "@/lib/permissions";

export const verifySession = cache(async (permission?: Permission) => {
  const session = await auth();

  if (!session?.user || session.invalid) {
    redirect("/login");
  }

  if (permission && !can(session.user.role, permission)) {
    redirect("/dashboard");
  }

  return session;
});
