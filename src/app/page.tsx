import Image from "next/image";
import { RevealObserver } from "./reveal-observer";

export default function Home() {
  return (
    <div className="site-shell">
      <RevealObserver />
      <nav className="site-nav">
        <a href="/" className="nav-logo">
          Court Interpreter <span>Toolkit</span>
        </a>
        <a
          href="https://chromewebstore.google.com"
          className="nav-cta"
          target="_blank"
          rel="noopener noreferrer"
        >
          Add to Chrome →
        </a>
      </nav>

      <section className="hero">
        <p className="hero-eyebrow">
          Chrome Extension · Free · No Account Required
        </p>
        <h1>
          Practice like a pro.
          <br />
          <em>Every single day.</em>
        </h1>
        <p className="hero-sub">
          A structured daily practice timer built for court interpreters —
          shadowing, sight translation, consecutive, simultaneous, vocabulary.
          All from your browser toolbar.
        </p>
        <div className="hero-actions">
          <a
            href="https://chromewebstore.google.com"
            className="btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <title>Add icon</title>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            Add to Chrome - It&apos;s Free
          </a>
        </div>

        <div className="preview-wrap">
          <Image
            src="/screenshot.png"
            alt="Court Interpreter Toolkit extension interface"
            className="preview-screenshot"
            width={1242}
            height={1130}
            priority
            sizes="(max-width: 768px) 100vw, 680px"
          />
        </div>
      </section>

      <hr className="section-rule" />

      <section>
        <div className="section-inner">
          <p className="section-label reveal">What it does</p>
          <h2 className="section-heading reveal">
            Everything you need.
            <br />
            <em>Nothing you don&apos;t.</em>
          </h2>
          <p className="section-body reveal">
            No accounts, no subscriptions, no cloud sync. Just a focused
            practice tool that runs in your browser - privately, locally, and
            reliably.
          </p>

          <div className="features-grid reveal">
            <article className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">
                  <title>Background timer</title>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="feature-title">Background Timer</h3>
              <p className="feature-desc">
                The timer keeps running even when you close the popup. Your
                session progress is never lost mid-task.
              </p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">
                  <title>Task list</title>
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </div>
              <h3 className="feature-title">Custom Task Lists</h3>
              <p className="feature-desc">
                Build your own practice sequences. Add, edit, reorder, or delete
                tasks. Your list persists between sessions.
              </p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">
                  <title>Calendar</title>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="feature-title">Session Calendar</h3>
              <p className="feature-desc">
                A calendar view highlights days where you completed a full
                session. Build the streak. Stay consistent.
              </p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">
                  <title>Notes</title>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <h3 className="feature-title">Task Notes</h3>
              <p className="feature-desc">
                Keep a note per task - what you practiced, what stumped you,
                what to revisit. Stored locally on your device.
              </p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">
                  <title>Playback controls</title>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <h3 className="feature-title">Toolbar &amp; Context Menu</h3>
              <p className="feature-desc">
                Play, Stop, and mark Done without opening the popup. Quick
                controls right from the Chrome toolbar.
              </p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">
                  <title>Privacy</title>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="feature-title">Fully Private</h3>
              <p className="feature-desc">
                No data leaves your device. No analytics, no tracking, no
                accounts. All storage is local Chrome storage.
              </p>
            </article>
          </div>
        </div>
      </section>

      <hr className="section-rule" />

      <section className="audience-section">
        <div className="section-inner">
          <p className="section-label reveal">Who it&apos;s for</p>
          <h2 className="section-heading reveal">
            Built for interpreters,
            <br />
            <em>at every stage.</em>
          </h2>

          <div className="audience-grid reveal">
            <article className="audience-item">
              <h3>Certification Candidates</h3>
              <p>
                Structured daily practice is the most reliable path to passing
                the California Court Interpreter Certification Exam. This tool
                keeps you on schedule without the friction.
              </p>
            </article>
            <article className="audience-item">
              <h3>Working Interpreters</h3>
              <p>
                Stay sharp. Use it to maintain skills in all three modes -
                consecutive, simultaneous, and sight translation - even on busy
                weeks.
              </p>
            </article>
            <article className="audience-item">
              <h3>Students &amp; Trainees</h3>
              <p>
                Taking an interpreting course? Use this alongside your
                coursework to reinforce daily practice habits before they become
                hard to break.
              </p>
            </article>
          </div>
        </div>
      </section>

      <hr className="section-rule" />

      <section>
        <div className="section-inner">
          <p className="section-label reveal">How it works</p>
          <h2 className="section-heading reveal">
            Simple by design.
            <br />
            <em>Powerful by habit.</em>
          </h2>
          <p className="section-body reveal">
            Court interpreting skills are built through repetition. The toolkit
            gets out of your way so you can focus on what matters - the practice
            itself.
          </p>

          <div className="steps reveal">
            <article className="step">
              <div className="step-num" />
              <div className="step-content">
                <h3>Install and set up your task list</h3>
                <p>
                  Add the extension to Chrome. Build a task list that matches
                  your daily routine - shadowing, vocabulary, sight translation,
                  consecutive, simultaneous. Set durations for each.
                </p>
              </div>
            </article>
            <article className="step">
              <div className="step-num" />
              <div className="step-content">
                <h3>Click Play and start practicing</h3>
                <p>
                  Hit Play on the first task. The timer runs in the background -
                  close the popup, switch tabs, do whatever. Your session
                  continues uninterrupted.
                </p>
              </div>
            </article>
            <article className="step">
              <div className="step-num" />
              <div className="step-content">
                <h3>Mark tasks Done as you go</h3>
                <p>
                  When a task is finished, mark it Done and move to the next.
                  Add notes about what you practiced or what needs work.
                  Everything saves automatically.
                </p>
              </div>
            </article>
            <article className="step">
              <div className="step-num" />
              <div className="step-content">
                <h3>Track your consistency on the calendar</h3>
                <p>
                  Open the calendar view to see which days you completed a full
                  session. A green day means you showed up. Build the streak.
                  Consistency beats intensity.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <hr className="section-rule" />

      <section className="cta-section">
        <div className="section-inner cta-inner">
          <p className="section-label reveal cta-label">
            Free. Open source. No signup.
          </p>
          <h2 className="section-heading reveal cta-heading">
            Your next session starts
            <br />
            <em>right now.</em>
          </h2>
          <p className="section-body reveal cta-body">
            Add the extension and run your first structured practice session in
            under two minutes.
          </p>
          <div className="reveal">
            <a
              href="https://chromewebstore.google.com"
              className="btn-primary cta-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Add to Chrome - It&apos;s Free →
            </a>
          </div>
          <div className="cta-badges reveal">
            <span className="badge">
              <span className="badge-dot" /> No account required
            </span>
            <span className="badge">
              <span className="badge-dot" /> No data collected
            </span>
            <span className="badge">
              <span className="badge-dot" /> Open source
            </span>
            <span className="badge">
              <span className="badge-dot" /> Free forever
            </span>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-logo">Court Interpreter Toolkit</div>
        <div className="footer-links">
          <a
            href="https://github.com/iknowmagic/court-interpreter-toolkit"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a href="/privacy">Privacy Policy</a>
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chrome Web Store
          </a>
        </div>
      </footer>
    </div>
  );
}
