import "@/styles/auth-split.css";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthModeTabs } from "@/components/auth/AuthModeTabs";
import { AuthPageTransition } from "@/components/auth/AuthPageTransition";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-split-root">
      <AuthBrandPanel />
      <div className="auth-split-form-wrap">
        <div className="auth-split-form-inner">
          <AuthModeTabs />
          <AuthPageTransition>{children}</AuthPageTransition>
        </div>
      </div>
    </div>
  );
}
