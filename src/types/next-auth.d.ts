import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

type StaffRole = "ADMIN" | "FRONT_DESK" | "HOUSEKEEPING";

declare module "next-auth" {
  interface Session {
    invalid?: boolean;
    user: {
      id: string;
      role: StaffRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: StaffRole;
    sessionVersion: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: StaffRole;
    sessionVersion: number;
    invalid?: boolean;
  }
}
