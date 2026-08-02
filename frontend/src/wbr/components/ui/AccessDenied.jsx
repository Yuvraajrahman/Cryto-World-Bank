import { Link } from "react-router-dom";
import Button from "./Button";

/**
 * Full-page access denied for wrong-role hits on retail routes.
 */
export default function AccessDenied({
  title = "Access denied",
  description = "This area is for retail clients. Switch to a borrower account, or go home.",
  homeTo = "/app/dashboard",
}) {
  return (
    <div className="client-page">
      <header className="client-hero">
        <p className="eyebrow">Permission</p>
        <h1 className="client-title">{title}</h1>
        <p className="client-lede">{description}</p>
      </header>
      <div className="quick-actions">
        <Button as={Link} to={homeTo} showArrow={false}>
          Go to dashboard
        </Button>
        <Button as={Link} to="/login" variant="ghost" showArrow={false}>
          Switch account
        </Button>
      </div>
    </div>
  );
}
