import Glass from './Glass';
import Icon from './Icon';
import Button from './Button';

/**
 * Shared shape for the "error state" and "empty state" every data-driven
 * page needs (frontend-development-plan.md, Shared/Global Elements:
 * "an explicit empty state (with a call-to-action, not just blank space),
 * and an error state (with retry)"). Keep copy in the interface's voice —
 * explain what happened, not an apology.
 *
 * Usage:
 *   <StateMessage
 *     variant="error"
 *     title="Live reserve data is unavailable"
 *     description="The rest of the page still works — check back shortly."
 *     action={{ label: 'Retry', onClick: refetch }}
 *   />
 */
export default function StateMessage({ variant = 'error', title, description, action, className = '' }) {
  return (
    <Glass className={`state-message ${variant} ${className}`.trim()}>
      <span className="state-icon">
        <Icon name={variant === 'error' ? 'alert' : 'clock'} size={16} />
      </span>
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action && (
        <Button variant="ghost" size="sm" showArrow={false} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Glass>
  );
}
