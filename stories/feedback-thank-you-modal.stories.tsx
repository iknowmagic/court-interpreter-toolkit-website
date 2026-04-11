import type { Story, StoryDefault } from "@ladle/react";
import "../src/app/globals.css";

export default {
  title: "Website/Feedback",
} satisfies StoryDefault;

export const ThankYouModal: Story = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "rgba(12, 10, 8, 0.82)",
      }}
    >
      <div className="feedback-dialog">
        <div className="thankyou-modal">
          <p className="modal-eyebrow">Court Interpreter Toolkit</p>
          <img
            src="/amazing.png"
            alt="Happy owl"
            width={140}
            height={140}
            className="thankyou-image"
          />
          <h2 className="thankyou-title">Thank you!</h2>
          <p className="thankyou-body">Your feedback helps improve the site.</p>
          <hr className="modal-rule" />
          <button type="button" className="btn-close">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
