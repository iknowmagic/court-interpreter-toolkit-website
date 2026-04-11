"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  DEFAULT_FEEDBACK_SUBMIT_ERROR_MESSAGE,
  FEEDBACK_MAX_MESSAGE_LENGTH,
  type FeedbackScore,
  getFollowUpEmailError as getFollowUpEmailValidationError,
  isFeedbackEmailValidationMessage,
  normalizeFeedbackEmail,
} from "@/lib/feedback";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/ui/dialog";

const FEEDBACK_OPTIONS = [
  { value: "not-great", label: "Not great", imageSrc: "/not-great.png" },
  { value: "ok", label: "OK", imageSrc: "/ok.png" },
  { value: "good", label: "Good", imageSrc: "/good.png" },
  { value: "amazing", label: "Loved it", imageSrc: "/amazing.png" },
] as const satisfies ReadonlyArray<{
  value: FeedbackScore;
  label: string;
  imageSrc: string;
}>;

const FOLLOW_UP_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

type FollowUpChoice = "yes" | "no";
type FeedbackApiResponse = {
  message?: string;
} | null;

const DEFAULT_SCORE: FeedbackScore = "good";
// Debug toggle: force the thank-you state without submitting.
const DEBUG_FORCE_THANK_YOU_VIEW = false;
const RATE_LIMIT_SUBMIT_ERROR_MESSAGE =
  "Too many requests, please try again in 10 minutes.";
const TEMPORARY_DELIVERY_ERROR_MESSAGE =
  "We could not send your note right now. Please try again in a minute.";
const TEMPORARY_SUBMIT_BLOCKED_MESSAGE =
  "We could not submit this note right now. Please try again.";

type FeedbackOption = (typeof FEEDBACK_OPTIONS)[number];
type FeedbackDialogView = "form" | "thankyou";
type FeedbackDialogProps = {
  defaultOpen?: boolean;
  forceView?: FeedbackDialogView;
  showTrigger?: boolean;
};

function getFollowUpChoiceEmailError(
  followUpChoice: FollowUpChoice,
  rawEmail: string,
) {
  const normalizedEmail = normalizeFeedbackEmail(rawEmail);
  return getFollowUpEmailValidationError(
    followUpChoice === "yes",
    normalizedEmail,
  );
}

function resolveSubmitErrorMessage(
  statusCode: number,
  apiMessage: string | undefined,
) {
  if (statusCode === 429) {
    return RATE_LIMIT_SUBMIT_ERROR_MESSAGE;
  }

  if (statusCode === 502 || statusCode === 503) {
    return TEMPORARY_DELIVERY_ERROR_MESSAGE;
  }

  if (statusCode === 403) {
    return TEMPORARY_SUBMIT_BLOCKED_MESSAGE;
  }

  return apiMessage ?? DEFAULT_FEEDBACK_SUBMIT_ERROR_MESSAGE;
}

export function FeedbackDialog({
  defaultOpen = false,
  forceView,
  showTrigger = true,
}: FeedbackDialogProps = {}) {
  const formScrollContainerRef = useRef<HTMLDivElement>(null);
  const formActionAreaRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(defaultOpen);
  const [score, setScore] = useState<FeedbackScore>(DEFAULT_SCORE);
  const [message, setMessage] = useState("");
  const [followUpChoice, setFollowUpChoice] = useState<FollowUpChoice>("no");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const showFollowUpEmail = followUpChoice === "yes";
  const showThankYouView =
    forceView === "thankyou" || hasSubmitted || DEBUG_FORCE_THANK_YOU_VIEW;
  const showFollowUpThankYouMessage = followUpChoice === "yes";

  function resetFormState() {
    setScore(DEFAULT_SCORE);
    setMessage("");
    setFollowUpChoice("no");
    setEmail("");
    setEmailError(null);
    setSubmitError(null);
    setHasSubmitted(false);
    setIsSubmitting(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isSubmitting) {
      resetFormState();
    }

    setOpen(nextOpen);
  }

  function clearSubmitError() {
    if (submitError) {
      setSubmitError(null);
    }
  }

  function handleMessageChange(value: string) {
    setMessage(value);
    clearSubmitError();
  }

  function handleScoreChange(value: FeedbackScore) {
    setScore(value);
    clearSubmitError();
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    if (emailError) {
      setEmailError(null);
    }
    clearSubmitError();
  }

  function handleCancel() {
    setOpen(false);
    resetFormState();
  }

  function handleFollowUpChoiceChange(value: string) {
    const nextChoice: FollowUpChoice = value === "yes" ? "yes" : "no";
    setFollowUpChoice(nextChoice);
    if (nextChoice === "no") {
      setEmailError(null);
    }
    clearSubmitError();
  }

  function scrollFormToBottom() {
    requestAnimationFrame(() => {
      const scrollContainer = formScrollContainerRef.current;
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        });
      }
      formActionAreaRef.current?.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });
    });
  }

  function setEmailErrorAndReveal(errorMessage: string) {
    setEmailError(errorMessage);
    scrollFormToBottom();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const trimmedMessage = message.trim();

    const shouldFollowUp = followUpChoice === "yes";
    const normalizedEmail = normalizeFeedbackEmail(email);
    const nextEmailError = getFollowUpChoiceEmailError(followUpChoice, email);
    if (nextEmailError) {
      setEmailErrorAndReveal(nextEmailError);
      return;
    }

    setIsSubmitting(true);
    setEmailError(null);
    setSubmitError(null);

    try {
      const response = await globalThis.fetch("/api/feedback", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          score,
          message: trimmedMessage,
          mayFollowUp: shouldFollowUp,
          email: shouldFollowUp ? normalizedEmail : null,
          pagePath: window.location.pathname,
        }),
      });

      const payload = (await response
        .json()
        .catch(() => null)) as FeedbackApiResponse;
      if (!response.ok) {
        const message = resolveSubmitErrorMessage(
          response.status,
          payload?.message,
        );
        if (isFeedbackEmailValidationMessage(message)) {
          setEmailErrorAndReveal(message);
          return;
        }
        throw new Error(message);
      }

      setHasSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : DEFAULT_FEEDBACK_SUBMIT_ERROR_MESSAGE,
      );
      scrollFormToBottom();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {showTrigger ? (
        <p className="support-note">
          Have a question or suggestion?{" "}
          <DialogTrigger className="support-note-trigger">
            Leave me a note.
          </DialogTrigger>
        </p>
      ) : null}

      <DialogContent className="feedback-dialog">
        {showThankYouView ? (
          <div className="thankyou-modal">
            <p className="modal-eyebrow">Court Interpreter Toolkit</p>

            <Image
              src="/amazing.png"
              alt="Happy owl"
              width={140}
              height={140}
              className="thankyou-image"
            />

            <DialogTitle className="thankyou-title">Thank you!</DialogTitle>
            <p className="thankyou-body">
              Your feedback helps improve the site.
            </p>
            {showFollowUpThankYouMessage ? (
              <p className="thankyou-body thankyou-body-follow-up">
                I&apos;ll reply to your note soon.
              </p>
            ) : null}

            <hr className="modal-rule" />

            <button type="button" className="btn-close" onClick={handleCancel}>
              Close
            </button>
          </div>
        ) : (
          <form
            className="feedback-form-shell"
            onSubmit={handleSubmit}
            noValidate
          >
            <div ref={formScrollContainerRef} className="feedback-scroll-area">
              <p className="modal-subtitle">Court Interpreter Toolkit</p>
              <DialogTitle className="modal-title">
                Leave me a note.
              </DialogTitle>

              <span className="field-label">How does the Chrome app feel?</span>
              <div
                className="sentiment-grid"
                role="radiogroup"
                aria-label="Rating"
              >
                {FEEDBACK_OPTIONS.map((option: FeedbackOption) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "sentiment-card",
                      option.value === score && "selected",
                    )}
                    aria-pressed={option.value === score}
                    aria-label={`Feedback option: ${option.label}`}
                    onClick={() => handleScoreChange(option.value)}
                    disabled={isSubmitting}
                  >
                    <Image
                      src={option.imageSrc}
                      alt=""
                      width={52}
                      height={52}
                      className="sentiment-img"
                    />
                    <span className="sentiment-label">{option.label}</span>
                  </button>
                ))}
              </div>

              <hr className="modal-rule" />

              <label className="field-label" htmlFor="feedback-message">
                Anything we could improve?
              </label>
              <textarea
                id="feedback-message"
                name="message"
                value={message}
                onChange={(event) => handleMessageChange(event.target.value)}
                placeholder="There's..."
                rows={4}
                maxLength={FEEDBACK_MAX_MESSAGE_LENGTH}
                className="modal-textarea"
              />

              <div className="reply-section">
                <span className="field-label">Want a reply?</span>
                <div
                  className="radio-group"
                  role="radiogroup"
                  aria-label="Want a reply"
                >
                  {FOLLOW_UP_OPTIONS.map((option) => (
                    <label key={option.value} className="radio-label">
                      <input
                        type="radio"
                        name="want-reply"
                        value={option.value}
                        checked={followUpChoice === option.value}
                        onChange={() =>
                          handleFollowUpChoiceChange(option.value)
                        }
                        disabled={isSubmitting}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>

                <div
                  className={cn(
                    "email-field-wrap",
                    showFollowUpEmail && "visible",
                  )}
                >
                  <div className="email-field-inner">
                    <label htmlFor="feedback-email">Email for follow-up</label>
                    <input
                      id="feedback-email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        handleEmailChange(event.target.value)
                      }
                      onBlur={() => {
                        const nextEmailError = getFollowUpChoiceEmailError(
                          followUpChoice,
                          email.trim(),
                        );
                        setEmailError(nextEmailError);
                      }}
                      autoComplete="email"
                      aria-invalid={emailError ? "true" : undefined}
                      className={cn("modal-input", emailError && "has-error")}
                      placeholder="you@example.com"
                    />
                    {emailError ? (
                      <p className="feedback-error">{emailError}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div ref={formActionAreaRef} className="feedback-actions-area">
              {submitError ? (
                <p className="feedback-error feedback-submit-error">
                  {submitError}
                </p>
              ) : null}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-send"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
