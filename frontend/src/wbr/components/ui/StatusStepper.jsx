import Icon from './Icon';

const STEPS = [
  { key: 'signing', label: 'SIGN' },
  { key: 'pending', label: 'CONFIRM' },
  { key: 'success', label: 'DONE' },
];

/**
 * Visual reference for the five-state transaction machine every on-chain
 * action must model per frontend-development-plan.md's Shared/Global
 * Elements: idle → signing (wallet prompt) → pending (mempool/confirming)
 * → success → error. `idle` renders nothing (no transaction started yet);
 * `error` takes over whichever step it failed on.
 *
 * Not used on the landing page (no transactions there), but this is the
 * component every lending/deposit/FX page should reuse rather than
 * building its own status UI.
 *
 * Usage:
 *   <StatusStepper state="pending" />
 *   <StatusStepper state="error" errorStep="pending" />
 */
export default function StatusStepper({ state = 'idle', errorStep }) {
  if (state === 'idle') return null;

  const activeIndex = state === 'error' ? STEPS.findIndex((s) => s.key === errorStep) : STEPS.findIndex((s) => s.key === state);

  return (
    <div className="stepper" role="status" aria-label={`Transaction ${state}`}>
      {STEPS.map((step, i) => {
        const isError = state === 'error' && i === activeIndex;
        const isDone = state === 'success' ? true : i < activeIndex || (state !== 'error' && i < STEPS.findIndex((s) => s.key === state));
        const isActive = !isError && !isDone && i === activeIndex;
        const cls = isError ? 'error' : isDone ? 'done' : isActive ? 'active' : '';
        return (
          <div className={`stepper-step ${cls}`.trim()} key={step.key}>
            <div className="stepper-line" />
            <div className="stepper-dot">
              {isError ? <Icon name="close" size={12} /> : isDone ? <Icon name="check" size={12} /> : <span>{i + 1}</span>}
            </div>
            <span className="stepper-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
