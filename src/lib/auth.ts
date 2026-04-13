import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";

// internos
import { db } from "@/db";
import * as schema from "@/db/schema";
import { usersToClinicsTable } from "@/db/schema";

export const auth = betterAuth({
  //
  // BASE URL
  //
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,

  //
  // DATABASE
  //
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  //
  // SOCIAL LOGIN
  //
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  //
  // PLUGINS
  //
  plugins: [
    customSession(async ({ user, session }) => {
      try {
        const clinics = await db.query.usersToClinicsTable.findMany({
          where: eq(usersToClinicsTable.userId, user.id),
          with: {
            clinic: true,
          },
        });

        const clinic = clinics?.[0];

        return {
          user: {
            ...user,
            clinic: clinic
              ? {
                  id: clinic.clinicId, // number
                  name: clinic.clinic?.name,
                }
              : undefined,
          },
          session,
        };
      } catch (error) {
        console.error("[AUTH_SESSION_ERROR]", error);

        return {
          user,
          session,
        };
      }
    }),
  ],

  //
  // MODELS
  //
  user: {
    modelName: "usersTable",
    additionalFields: {
      stripeCustomerId: {
        type: "string",
        fieldName: "stripeCustomerId",
        required: false,
      },
      stripeSubscriptionId: {
        type: "string",
        fieldName: "stripeSubscriptionId",
        required: false,
      },
      plan: {
        type: "string",
        fieldName: "plan",
        required: false,
      },
    },
  },
  session: {
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },

  //
  // EMAIL + PASSWORD
  //
  emailAndPassword: {
    enabled: true,
  },
});
