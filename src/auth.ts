import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { users } from "@/db/schema";

const credentialsSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const [staff] = await db
          .select()
          .from(users)
          .where(sql`lower(${users.email}) = ${parsed.data.email}`)
          .limit(1);
        if (!staff || !(await compare(parsed.data.password, staff.passwordHash))) return null;

        return {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          image: staff.image,
          role: staff.role,
          sessionVersion: staff.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
      }

      if (!token.id) return token;
      const [current] = await db
        .select({ role: users.role, sessionVersion: users.sessionVersion })
        .from(users)
        .where(eq(users.id, token.id))
        .limit(1);

      token.invalid = !current || current.sessionVersion !== token.sessionVersion;
      if (current) token.role = current.role;
      return token;
    },
    session({ session, token }) {
      session.invalid = token.invalid;
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
});
