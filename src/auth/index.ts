import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { ONE_DAY_IN_SECONDS, SEVEN_DAYS_IN_SECONDS } from "../common/constants";
import { envVariables } from "../common/env.config";
import { db } from "../db";
import { logger } from "../logger";
import { emailService, transporter } from "../services/email.service";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  baseURL: envVariables.betterAuthUrl,
  secret: envVariables.betterAuthSecret,
  plugins: [bearer()],
  user: {
    modelName: "userTable",
    fields: { emailVerified: "isEmailVerified" },
    additionalFields: {
      isAdmin: {
        type: "boolean",
        required: true,
        defaultValue: false,
        input: false,
      },
    },
  },
  account: { modelName: "accountTable" },
  session: {
    modelName: "sessionTable",
    expiresIn: SEVEN_DAYS_IN_SECONDS,
    updateAge: ONE_DAY_IN_SECONDS,
    disableSessionRefresh: false,
  },
  verification: { modelName: "verificationTable" },
  advanced: { database: { generateId: "uuid" } },
  trustedOrigins: [envVariables.frontendUrl],
  emailAndPassword: { enabled: true, requireEmailVerification: true },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      void emailService
        .sendEmail({
          transporter,
          toEmail: user.email,
          subject: "Registration",
          html: `Click the link to verify your email: ${url}`,
        })
        .then((result) => {
          if (result[1]) {
            logger.error(
              { error: result[1], email: user.email },
              "Failed to send verification email",
            );
          }
        })
        .catch((error) => {
          logger.error(
            { error: error, email: user.email },
            "Failed to send verification email",
          );
        });
    },
  },
});
