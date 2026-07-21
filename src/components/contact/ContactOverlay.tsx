import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import InteractiveGrid from './InteractiveGrid';
import { site, web3formsAccessKey, contactReasons } from '../../data/site';

type Field = 'name' | 'email' | 'reason' | 'message';
type Status = 'form' | 'submitting' | 'done' | 'error';

interface Step {
  key: Field;
  question: string;
  type: 'text' | 'email' | 'choice' | 'textarea';
  placeholder?: string;
  optional?: boolean;
  validate?: (value: string) => string;
}

const STEPS: Step[] = [
  {
    key: 'name',
    question: "What's your name?",
    type: 'text',
    placeholder: 'Jane Smith',
    validate: (v) => (v.trim() ? '' : 'Please enter your name.'),
  },
  {
    key: 'email',
    question: "What's your email?",
    type: 'email',
    placeholder: 'jane@email.com',
    validate: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
        ? ''
        : 'Please enter a valid email.',
  },
  {
    key: 'reason',
    question: 'What brings you here?',
    type: 'choice',
  },
  {
    key: 'message',
    question: 'Anything you want to add?',
    type: 'textarea',
    placeholder: 'Your message…',
    optional: true,
  },
];

const empty: Record<Field, string> = {
  name: '',
  email: '',
  reason: '',
  message: '',
};

export default function ContactOverlay() {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<Field, string>>({ ...empty });
  const [status, setStatus] = useState<Status>('form');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // Open when any [data-open-contact] element is activated
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('[data-open-contact]');
      if (!target) return;
      e.preventDefault();
      openerRef.current = target as HTMLElement;
      setStepIndex(0);
      setAnswers({ ...empty });
      setStatus('form');
      setError('');
      setOpen(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Body scroll lock + Esc to close while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Focus the field when the step changes
  useEffect(() => {
    if (open && status === 'form') {
      const id = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
  }, [open, status, stepIndex]);

  const close = () => {
    setOpen(false);
    openerRef.current?.focus?.();
  };

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const setValue = (value: string) =>
    setAnswers((a) => ({ ...a, [step.key]: value }));

  const goNext = () => {
    const value = answers[step.key];
    const msg = step.validate?.(value) ?? '';
    if (msg) {
      setError(msg);
      return;
    }
    setError('');
    if (isLast) {
      void submit();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const goBack = () => {
    setError('');
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const chooseReason = (reason: string) => {
    setAnswers((a) => ({ ...a, reason }));
    setError('');
    setStepIndex((i) => i + 1);
  };

  async function submit() {
    setStatus('submitting');
    const subject = `Portfolio contact — ${answers.reason || 'message'}`;
    if (!web3formsAccessKey) {
      // No key configured yet: fall back to the visitor's mail client.
      const body = `Reason: ${answers.reason}\n\n${
        answers.message || ''
      }\n\n— ${answers.name} (${answers.email})`;
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;
      setStatus('done');
      return;
    }
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: web3formsAccessKey,
          subject,
          from_name: answers.name,
          name: answers.name,
          email: answers.email,
          reason: answers.reason,
          message: answers.message || '(no message)',
          botcheck: false,
        }),
      });
      const json = await res.json();
      if (json.success) setStatus('done');
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  const seeProjects = () => {
    close();
    window.setTimeout(() => {
      const el = document.getElementById('projects');
      // On the home page, just scroll. From a project detail page (which has
      // no #projects section of its own), navigate home and land on it there.
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.location.href = '/#projects';
    }, 120);
  };

  const progress =
    status === 'done'
      ? 100
      : ((stepIndex + (status === 'submitting' ? 1 : 0)) / STEPS.length) * 100;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <motion.div
            className="overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Contact form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <InteractiveGrid className="overlay-canvas" />
            <div className="overlay-progress" style={{ width: `${progress}%` }} />
            <button
              type="button"
              className="overlay-close"
              onClick={close}
              aria-label="Close contact form"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M4 4l10 10M14 4L4 14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div className="flow">
              <AnimatePresence mode="wait">
                {status === 'done' ? (
                  <motion.div
                    key="done"
                    className="flow-done"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h2 className="flow-done-title">
                      Thank you for getting in touch
                    </h2>
                    <p className="flow-done-text">
                      I'll get back to you ASAP. Meanwhile, check out more of my
                      projects.
                    </p>
                    <button
                      type="button"
                      className="flow-done-link"
                      onClick={seeProjects}
                    >
                      See my projects
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M3 8h10M9 4l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </motion.div>
                ) : status === 'submitting' ? (
                  <motion.p
                    key="submitting"
                    className="flow-question"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Sending…
                  </motion.p>
                ) : status === 'error' ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                  >
                    <p className="flow-question">Something went wrong.</p>
                    <p className="flow-hint">
                      Please try again, or email me directly at {site.email}.
                    </p>
                    <div className="flow-controls">
                      <button
                        type="button"
                        className="flow-next"
                        onClick={() => void submit()}
                      >
                        Try again
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={stepIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.32, ease: 'easeOut' }}
                  >
                    <p className="flow-step-index">
                      {String(stepIndex + 1).padStart(2, '0')} /{' '}
                      {String(STEPS.length).padStart(2, '0')}
                    </p>
                    <h2 className="flow-question">{step.question}</h2>

                    {step.type === 'choice' ? (
                      <div className="flow-options">
                        {contactReasons.map((reason) => (
                          <button
                            key={reason}
                            type="button"
                            className="flow-option"
                            onClick={() => chooseReason(reason)}
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                    ) : step.type === 'textarea' ? (
                      <textarea
                        ref={(el) => {
                          inputRef.current = el;
                        }}
                        className="flow-textarea"
                        placeholder={step.placeholder}
                        value={answers[step.key]}
                        rows={4}
                        onChange={(e) => setValue(e.target.value)}
                      />
                    ) : (
                      <input
                        ref={(el) => {
                          inputRef.current = el;
                        }}
                        className="flow-input"
                        type={step.type}
                        inputMode={step.type === 'email' ? 'email' : 'text'}
                        placeholder={step.placeholder}
                        value={answers[step.key]}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            goNext();
                          }
                        }}
                      />
                    )}

                    <p className="flow-error">{error}</p>

                    {step.type !== 'choice' && (
                      <div className="flow-controls">
                        {stepIndex > 0 && (
                          <button
                            type="button"
                            className="flow-back"
                            onClick={goBack}
                          >
                            ← Back
                          </button>
                        )}
                        <button
                          type="button"
                          className="flow-next"
                          onClick={goNext}
                        >
                          {isLast ? 'Send' : 'Continue'}
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M3 8h10M9 4l4 4-4 4"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    )}

                    {step.type !== 'choice' && step.type !== 'textarea' && (
                      <p className="flow-hint">Press Enter to continue.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
