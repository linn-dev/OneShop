import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phoneVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    phoneVerified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    phoneVerified?: boolean;
  }
}
