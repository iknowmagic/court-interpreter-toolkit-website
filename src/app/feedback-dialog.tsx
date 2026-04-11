"use client";

import Image from "next/image";
import { useState } from "react";
import {
  DEFAULT_FEEDBACK_SUBMIT_ERROR_MESSAGE,
  FEEDBACK_MAX_MESSAGE_LENGTH,
  type FeedbackScore,
  getFollowUpEmailError,
  isFeedbackEmailValidationMessage,
  normalizeFeedbackEmail,
} from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/ui/dialog";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/shadcn/ui/field";
import { Input } from "@/shadcn/ui/input";
import { RadioGroup, RadioGroupItem } from "@/shadcn/ui/radio-group";
import { Textarea } from "@/shadcn/ui/textarea";

const FEEDBACK_OPTIONS = [
  {
    value: "not-great",
    label: "Not great",
    imageSrc: "/feedback/not-great.png",
  },
  { value: "ok", label: "OK", imageSrc: "/feedback/ok.png" },
  { value: "good", label: "Good", imageSrc: "/feedback/good.png" },
  { value: "amazing", label: "Loved it", imageSrc: "/feedback/amazing.png" },
] as const satisfies ReadonlyArray<{
  value: FeedbackScore;
  label: string;
  imageSrc: string;
}>;

const FOLLOW_UP_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

const RATE_LIMIT_SUBMIT_ERROR_MESSAGE =
  "Too many requests, please try again in 10 minutes.";
const TEMPORARY_DELIVERY_ERROR_MESSAGE =
  "We could not send your note right now. Please try again in a minute.";

type FollowUpChoice = "yes" | "no";
type FeedbackApiResponse = {
  message?: string;
} | null;

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

  return apiMessage ?? DEFAULT_FEEDBACK_SUBMIT_ERROR_MESSAGE;
}

export function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<FeedbackScore>("good");
  const [message, setMessage] = useState("");
  const [followUpChoice, setFollowUpChoice] = useState<FollowUpChoice>("no");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const showFollowUpEmail = followUpChoice === "yes";

  function resetFormState() {
    setScore("good");
    setMessage("");
    setFollowUpChoice("no");
    setEmail("");
    setEmailError(null);
    setSubmitError(null);
    setIsSubmitting(false);
    setHasSubmitted(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isSubmitting) {
      resetFormState();
    }

    setOpen(nextOpen);
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setOpen(false);
    resetFormState();
  }

  function clearSubmitError() {
    if (submitError) {
      setSubmitError(null);
    }
  }

  function handleFollowUpChoiceChange(value: string) {
    const nextChoice: FollowUpChoice = value === "yes" ? "yes" : "no";
    setFollowUpChoice(nextChoice);

    if (nextChoice === "no") {
      setEmailError(null);
    }

    clearSubmitError();
  }

  function handleEmailChange(value: string) {
    setEmail(value);

    if (emailError) {
      setEmailError(null);
    }

    clearSubmitError();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setSubmitError("Please include a quick note before sending.");
      return;
    }

    const shouldFollowUp = followUpChoice === "yes";
    const normalizedEmail = normalizeFeedbackEmail(email);
    const nextEmailError = getFollowUpEmailError(
      shouldFollowUp,
      normalizedEmail,
    );

    if (nextEmailError) {
      setEmailError(nextEmailError);
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
        const errorMessage = resolveSubmitErrorMessage(
          response.status,
          payload?.message,
        );

        if (isFeedbackEmailValidationMessage(errorMessage)) {
          setEmailError(errorMessage);
          return;
        }

        throw new Error(errorMessage);
      }

      setHasSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : DEFAULT_FEEDBACK_SUBMIT_ERROR_MESSAGE,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <p className="support-note">
        Have a question or suggestion?{" "}
        <DialogTrigger className="support-note-trigger">
          Leave me a note.
        </DialogTrigger>
      </p>
      <DialogContent className="feedback-modal" showCloseButton={!isSubmitting}>
        {hasSubmitted ? (
          <div className="feedback-thank-you">
            <h3>Thanks for the note.</h3>
            <p>
              {followUpChoice === "yes"
                ? "I will follow up by email soon."
                : "I read every message and use it to improve the toolkit."}
            </p>
            <Button type="button" onClick={handleClose}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form" noValidate>
            <DialogHeader className="feedback-modal-header">
              <DialogTitle className="feedback-modal-title">
                Leave me a note
              </DialogTitle>
              <DialogDescription className="feedback-modal-description">
                Questions, suggestions, or bugs are all welcome.
              </DialogDescription>
            </DialogHeader>

            <FieldSet className="feedback-fieldset">
              <FieldLegend className="feedback-legend">
                How is the toolkit working for you?
              </FieldLegend>
              <div className="feedback-score-grid">
                {FEEDBACK_OPTIONS.map((option) => (
                  <Button
                    type="button"
                    variant="ghost"
                    key={option.value}
                    onClick={() => setScore(option.value)}
                    className={cn(
                      "feedback-score-card",
                      score === option.value && "is-selected",
                    )}
                    aria-pressed={score === option.value}
                    aria-label={`Feedback option: ${option.label}`}
                  >
                    <Image
                      src={option.imageSrc}
                      alt=""
                      width={96}
                      height={131}
                      className="feedback-score-image"
                    />
                    <span className="feedback-score-label">{option.label}</span>
                  </Button>
                ))}
              </div>
            </FieldSet>

            <Field className="feedback-field">
              <FieldLabel htmlFor="feedback-message" className="feedback-label">
                Message
              </FieldLabel>
              <Textarea
                id="feedback-message"
                name="message"
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  clearSubmitError();
                }}
                maxLength={FEEDBACK_MAX_MESSAGE_LENGTH}
                placeholder="What would you like me to know?"
                className="feedback-textarea"
              />
            </Field>

            <FieldSet className="feedback-fieldset">
              <FieldLegend className="feedback-legend">
                Want a reply?
              </FieldLegend>
              <RadioGroup
                name="follow-up"
                value={followUpChoice}
                onValueChange={handleFollowUpChoiceChange}
                className="feedback-follow-up-group"
              >
                {FOLLOW_UP_OPTIONS.map((option) => (
                  <Field
                    key={option.value}
                    orientation="horizontal"
                    className="feedback-radio-field"
                  >
                    <RadioGroupItem
                      id={`feedback-follow-up-${option.value}`}
                      value={option.value}
                      className="feedback-radio"
                    />
                    <FieldLabel
                      htmlFor={`feedback-follow-up-${option.value}`}
                      className="feedback-radio-label"
                    >
                      {option.label}
                    </FieldLabel>
                  </Field>
                ))}
              </RadioGroup>
            </FieldSet>

            {showFollowUpEmail ? (
              <Field className="feedback-field" data-invalid={!!emailError}>
                <FieldLabel htmlFor="feedback-email" className="feedback-label">
                  Email for follow-up
                </FieldLabel>
                <Input
                  id="feedback-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => handleEmailChange(event.target.value)}
                  onBlur={() => {
                    const nextEmailError = getFollowUpEmailError(
                      followUpChoice === "yes",
                      normalizeFeedbackEmail(email),
                    );
                    setEmailError(nextEmailError);
                  }}
                  autoComplete="email"
                  aria-invalid={emailError ? "true" : undefined}
                  className="feedback-input"
                />
                <FieldError>{emailError}</FieldError>
              </Field>
            ) : null}

            <FieldError>{submitError}</FieldError>

            <div className="feedback-actions">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send note"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
