import "@/styles/auth-modern.css";
import { AuthPageTransition } from "@/components/auth/AuthPageTransition";
import { AuthShowcasePanel } from "@/components/auth/AuthShowcasePanel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-modern-root">
      <div className="auth-modern-container">
        <main className="auth-modern-left">
          <AuthPageTransition>{children}</AuthPageTransition>
        </main>
        <aside className="auth-modern-right" aria-label="Painel de apresentação">
          <AuthShowcasePanel />
        </aside>
      </div>
    </div>
  );
}

