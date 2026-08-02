import { type CreateEmailResponseSuccess, Resend } from "resend";
import { envVariables } from "../common/env.config";
import { logger } from "../logger";

export const transporter = new Resend(envVariables.sendEmailApiKey);

type SendEmailArgs = {
  transporter: Resend;
  toEmail: string;
  subject: string;
  html: string;
};

type SendEmailSuccessResult = {
  data: CreateEmailResponseSuccess;
  error: null;
} & {
  headers: Record<string, string> | null;
};

type SendEmailResult = Promise<[SendEmailSuccessResult, null] | [null, Error]>;

async function sendEmail(args: SendEmailArgs): SendEmailResult {
  logger.info("Sending email start");

  const { transporter, toEmail, subject, html } = args;

  try {
    const result = await transporter.emails.send({
      from: envVariables.sendEmailFrom,
      to: toEmail,
      subject,
      html,
    });

    if (result.error) {
      return [null, new Error("Sending email failed")];
    }

    logger.info("Email has been sent successfully");

    return [result, null];
  } catch (error) {
    logger.error({ error }, "Error during sending email");

    return [
      null,
      new Error(
        error instanceof Error ? error.message : "Sending email failed",
      ),
    ];
  }
}

export const emailService = { sendEmail } as const;
