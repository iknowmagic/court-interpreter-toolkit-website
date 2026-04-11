import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import {
  DEFAULT_FEEDBACK_SUBMIT_ERROR_MESSAGE,
  FEEDBACK_MAX_EMAIL_LENGTH,
  FEEDBACK_MAX_MESSAGE_LENGTH,
  FEEDBACK_MESSAGE_TOO_LONG_ERROR_MESSAGE,
  FEEDBACK_SCORE_LABELS,
  FEEDBACK_SCORE_VALUES,
  type FeedbackScore,
  getFollowUpEmailError,
  normalizeFeedbackEmail,
} from "@/lib/feedback";

export const runtime = "nodejs";

const DEFAULT_FROM_ADDRESS =
  "Court Interpreter Toolkit <onboarding@resend.dev>";
const DEFAULT_RECIPIENT = "courtinterpretertoolkit@gmail.com";
const TEST_MODE_RECIPIENT_LIMIT_MESSAGE =
  "Resend is in testing mode and can only send to your account email right now.";
const MISSING_API_KEY_MESSAGE =
  "Feedback is not configured yet. Missing RENDER_API_KEY.";
const MISSING_RECIPIENT_MESSAGE =
  "Feedback is not configured yet. Missing feedback recipient email.";
const INVALID_REQUEST_MESSAGE = "Invalid request payload.";

const feedbackRequestSchema = z.object({
  score: z.enum(FEEDBACK_SCORE_VALUES),
  message: z.string().trim().max(FEEDBACK_MAX_MESSAGE_LENGTH),
  mayFollowUp: z.boolean(),
  email: z.string().trim().max(FEEDBACK_MAX_EMAIL_LENGTH).nullable().optional(),
  pagePath: z.string().trim().max(300).optional(),
});

type FeedbackRequest = z.infer<typeof feedbackRequestSchema>;

function createErrorResponse(status: number, message: string) {
  return NextResponse.json(
    {
      ok: false,
      message,
    },
    { status },
  );
}

function resolveResendError(error: unknown) {
  if (!error || typeof error !== "object") {
    return {
      status: 502,
      message: DEFAULT_FEEDBACK_SUBMIT_ERROR_MESSAGE,
    };
  }

  const record = error as {
    statusCode?: unknown;
    name?: unknown;
    message?: unknown;
  };
  const statusCode =
    typeof record.statusCode === "number" ? record.statusCode : null;
  const errorName = typeof record.name === "string" ? record.name : "";
  const errorMessage = typeof record.message === "string" ? record.message : "";

  if (
    statusCode === 403 &&
    errorName === "validation_error" &&
    errorMessage.includes("only send testing emails to your own email address")
  ) {
    return {
      status: 503,
      message: TEST_MODE_RECIPIENT_LIMIT_MESSAGE,
    };
  }

  return {
    status: 502,
    message: DEFAULT_FEEDBACK_SUBMIT_ERROR_MESSAGE,
  };
}

function parseRecipientList(raw: string | undefined) {
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function readFeedbackRouteConfig() {
  const apiKey = process.env.RENDER_API_KEY ?? process.env.RESEND_API_KEY;
  const fromAddress =
    process.env.RESEND_FROM_EMAIL ??
    process.env.FEEDBACK_FROM_EMAIL ??
    DEFAULT_FROM_ADDRESS;
  const recipients = parseRecipientList(
    process.env.RESEND_FEEDBACK_TO_EMAIL ??
      process.env.FEEDBACK_TO_EMAIL ??
      DEFAULT_RECIPIENT,
  );

  return {
    apiKey,
    fromAddress,
    recipients,
  };
}

function resolvePayloadValidationMessage(validationError: z.ZodError<unknown>) {
  for (const issue of validationError.issues) {
    if (issue.path[0] !== "message") {
      continue;
    }

    if (issue.code === "too_big") {
      return FEEDBACK_MESSAGE_TOO_LONG_ERROR_MESSAGE;
    }
  }

  return INVALID_REQUEST_MESSAGE;
}

function validateFollowUpEmail(requestBody: FeedbackRequest):
  | {
      replyToEmail: string | null;
      errorMessage: null;
    }
  | {
      replyToEmail: null;
      errorMessage: string;
    } {
  const followUpEmail = normalizeFeedbackEmail(requestBody.email);
  const emailError = getFollowUpEmailError(
    requestBody.mayFollowUp,
    followUpEmail,
  );

  if (emailError) {
    return {
      replyToEmail: null,
      errorMessage: emailError,
    };
  }

  return {
    replyToEmail: requestBody.mayFollowUp ? followUpEmail : null,
    errorMessage: null,
  };
}

function buildFeedbackEmailText(params: {
  score: FeedbackScore;
  shouldFollowUp: boolean;
  replyToEmail: string | null;
  pagePath: string;
  messageText: string;
}) {
  return [
    "New Court Interpreter Toolkit website feedback",
    "",
    `Score: ${FEEDBACK_SCORE_LABELS[params.score]}`,
    `Follow-up requested: ${params.shouldFollowUp ? "Yes" : "No"}`,
    `Follow-up email: ${params.replyToEmail ?? "Not provided"}`,
    `Page path: ${params.pagePath}`,
    "",
    "Message:",
    params.messageText,
  ].join("\n");
}

export async function POST(request: Request) {
  const { apiKey, fromAddress, recipients } = readFeedbackRouteConfig();

  if (!apiKey) {
    return createErrorResponse(503, MISSING_API_KEY_MESSAGE);
  }

  if (recipients.length === 0) {
    return createErrorResponse(503, MISSING_RECIPIENT_MESSAGE);
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    return createErrorResponse(400, INVALID_REQUEST_MESSAGE);
  }

  const parsedRequest = feedbackRequestSchema.safeParse(requestBody);
  if (!parsedRequest.success) {
    return createErrorResponse(
      400,
      resolvePayloadValidationMessage(parsedRequest.error),
    );
  }

  const validatedFollowUpEmail = validateFollowUpEmail(parsedRequest.data);
  if (validatedFollowUpEmail.errorMessage) {
    return createErrorResponse(400, validatedFollowUpEmail.errorMessage);
  }

  const score = parsedRequest.data.score;
  const scoreLabel = FEEDBACK_SCORE_LABELS[score];
  const messageText = parsedRequest.data.message.trim();
  const pagePath = parsedRequest.data.pagePath?.trim() || "/";
  const shouldFollowUp = parsedRequest.data.mayFollowUp;
  const { replyToEmail } = validatedFollowUpEmail;

  const resend = new Resend(apiKey);
  const emailText = buildFeedbackEmailText({
    score,
    shouldFollowUp,
    replyToEmail,
    pagePath,
    messageText,
  });

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: recipients,
    subject: `Court Interpreter Toolkit feedback (${scoreLabel})`,
    text: emailText,
    replyTo: replyToEmail ?? undefined,
  });

  if (error) {
    const resolvedError = resolveResendError(error);
    return createErrorResponse(resolvedError.status, resolvedError.message);
  }

  return NextResponse.json({ ok: true });
}
