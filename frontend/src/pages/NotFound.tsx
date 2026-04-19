import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Logo size={48} />
      <div className="font-display text-5xl font-semibold gold-text">404</div>
      <p className="max-w-md text-ink-200">
        That vault doesn't exist. It may have been moved, renamed, or never existed in the first place.
      </p>
      <Link to="/" className="btn-primary">
        Back to home
      </Link>
    </div>
  );
}
