/**
 * Glass text field — not used on the landing page (which has no forms),
 * but every onboarding/lending page (Registration, KYC, Loan Application…)
 * will need this. Included here so the input styling is decided once, in
 * one place, rather than reinvented per form page.
 *
 * Usage:
 *   <Input label="Wallet address" placeholder="0x…" hint="Paste or connect a wallet above" />
 *   <Input label="Loan amount" error="Must be at least 50 USDC" />
 */
export default function Input({ label, hint, error, id, className = '', ...rest }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`field${error ? ' error' : ''} ${className}`.trim()}>
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input id={inputId} className="field-input" {...rest} />
      {(error || hint) && <span className="field-hint">{error || hint}</span>}
    </div>
  );
}
