import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        let email = (credentials.email as string).trim().toLowerCase();

        // Support aliases for Guru Demo 1 & Demo Accounts
        if (["guru@terrawise.id", "guru1@terrawise.id", "gurudemo@terrawise.id"].includes(email)) {
          email = "gurudemo1@terrawise.id";
        } else if (["guru2@terrawise.id", "gurudemo@terrawise.id"].includes(email)) {
          email = "gurudemo2@terrawise.id";
        } else if (["siswademo1@terrawise.id", "siswa1@terrawise.id", "siswademo@terrawise.id"].includes(email)) {
          email = "siswa@terrawise.id";
        }

        let [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        // Fallback for pre-seed / alternate email
        if (!user && (email === "gurudemo1@terrawise.id" || email === "guru@terrawise.id")) {
          const altEmail = email === "gurudemo1@terrawise.id" ? "guru@terrawise.id" : "gurudemo1@terrawise.id";
          const [altUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, altEmail))
            .limit(1);
          if (altUser) user = altUser;
        }

        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id?: string; role?: string };
        token.role = u.role;
        token.id = u.id;
      }
      if (typeof token.id === "string") {
        const [current] = await db
          .select({ role: users.role, isActive: users.isActive })
          .from(users)
          .where(eq(users.id, token.id))
          .limit(1);
        if (!current?.isActive) return null;
        token.role = current.role;
      }
      return token;
    },
  },
});
