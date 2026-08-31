import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import {
  EMAIL_VERIFICATION_CONFIRMED,
  ONE_DAY_IN_SECONDS,
  SEVEN_DAYS_IN_SECONDS,
} from "../common/constants";
import { envVariables } from "../common/env.config";
import { db } from "../db";
import { logger } from "../logger";
import { emailService, transporter } from "../services/email.service";
import { redisService } from "../services/redis.service";

const buildEmailVerificationTemplate = (url: string): string => {
  return `Click the link to verify your email: ${url}`;
};

const buildSignUpAttemptDetectedTemplate = (args: {
  name: string;
  email: string;
}): string => {
  const { name, email } = args;

  return `Hi ${name}, Someone tried to sign up using your email (${email}). If that was you: you already have an account — just sign in. If not: no action needed, your account is safe.`;
};

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
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    onExistingUserSignUp: async ({ user }) => {
      const [lockAcquired, lockAcquiredError] =
        await redisService.trySetSignUpAttemptEmailLock(user.id);

      if (lockAcquiredError) return;
      if (lockAcquired !== "OK") return;

      if (user.emailVerified) {
        void emailService
          .sendEmail({
            transporter,
            toEmail: user.email,
            subject: "Sign-up attempt detected",
            html: buildSignUpAttemptDetectedTemplate({
              name: user.name,
              email: user.email,
            }),
          })
          .then((result) => {
            if (result[1]) {
              logger.error(
                { error: result[1], email: user.email },
                "Failed to send sign-up attempt detected email",
              );
            }
          })
          .catch((error) => {
            logger.error(
              { error, email: user.email },
              "Failed to send sign-up attempt detected email",
            );
          });
      } else {
        void auth.api
          .sendVerificationEmail({
            body: {
              email: user.email,
              callbackURL: `${envVariables.frontendUrl}${EMAIL_VERIFICATION_CONFIRMED}`,
            },
          })
          .catch((error) => {
            logger.error(
              { error, email: user.email },
              "Failed to trigger verification email",
            );
          });
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      void emailService
        .sendEmail({
          transporter,
          toEmail: user.email,
          subject: "Registration",
          html: buildEmailVerificationTemplate(url),
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
