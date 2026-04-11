export const FEEDBACK_SCORE_VALUES = [
  "not-great",
  "ok",
  "good",
  "amazing",
] as const;

export type FeedbackScore = (typeof FEEDBACK_SCORE_VALUES)[number];

export const FEEDBACK_SCORE_LABELS: Record<FeedbackScore, string> = {
  "not-great": "Not great",
  ok: "OK",
  good: "Good",
  amazing: "Loved it",
};

export const FEEDBACK_MAX_MESSAGE_LENGTH = 2000;
export const FEEDBACK_MAX_EMAIL_LENGTH = 320;

export const REQUIRED_EMAIL_ERROR_MESSAGE = "Add an email so we can reply.";
export const INVALID_EMAIL_ERROR_MESSAGE = "That email does not look right.";
export const DEFAULT_FEEDBACK_SUBMIT_ERROR_MESSAGE =
  "Unable to send feedback right now. Please try again.";

const SIMPLE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeFeedbackEmail(rawEmail: string | null | undefined) {
  const trimmedEmail = rawEmail?.trim() ?? "";
  return trimmedEmail.length > 0 ? trimmedEmail : null;
}

export function isValidFeedbackEmail(email: string) {
  return SIMPLE_EMAIL_PATTERN.test(email);
}

export function getFollowUpEmailError(
  mayFollowUp: boolean,
  email: string | null,
) {
  if (!mayFollowUp) {
    return null;
  }

  if (!email) {
    return REQUIRED_EMAIL_ERROR_MESSAGE;
  }

  if (!isValidFeedbackEmail(email)) {
    return INVALID_EMAIL_ERROR_MESSAGE;
  }

  return null;
}

export function isFeedbackEmailValidationMessage(message: string) {
  return (
    message === REQUIRED_EMAIL_ERROR_MESSAGE ||
    message === INVALID_EMAIL_ERROR_MESSAGE
  );
}
