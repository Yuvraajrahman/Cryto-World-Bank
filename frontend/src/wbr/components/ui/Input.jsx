export default function Input({
  label,
  hint,
  error,
  id,
  className = "",
  as = "input",
  children,
  ...rest
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const Tag = as;
  const isVoid = Tag === "input";

  return (
    <div className={`field${error ? " error" : ""} ${className}`.trim()}>
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      {isVoid ? (
        <input id={inputId} className="field-input" {...rest} />
      ) : (
        <Tag id={inputId} className="field-input" {...rest}>
          {children}
        </Tag>
      )}
      {(error || hint) && <span className="field-hint">{error || hint}</span>}
    </div>
  );
}
