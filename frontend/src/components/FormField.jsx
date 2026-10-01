// Label + input/select/textarea + error message. Pass `as="select"` or `as="textarea"` for those controls.
export default function FormField({ label, name, error, hint, as = 'input', children, ...rest }) {
  const Control = as;
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <Control id={name} name={name} aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy} {...rest}>
        {children}
      </Control>
      {hint && !error && (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
