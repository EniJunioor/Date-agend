export function AuthBrandPanel() {
  return (
    <aside className="auth-split-brand" aria-label="Calendário do Casal">
      <div className="auth-split-waves" aria-hidden="true">
        <svg viewBox="0 0 900 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 180C120 140 200 220 320 200C460 176 520 80 660 100C780 116 820 200 900 160V320H0V180Z"
            fill="url(#w1)"
            opacity="0.5"
          />
          <path
            d="M0 240C140 200 260 280 400 250C540 220 620 140 900 200V320H0V240Z"
            fill="url(#w2)"
            opacity="0.35"
          />
          <defs>
            <linearGradient id="w1" x1="0" y1="0" x2="900" y2="0">
              <stop stopColor="#ec4899" stopOpacity="0.35" />
              <stop offset="1" stopColor="#7c3aed" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="w2" x1="0" y1="0" x2="900" y2="0">
              <stop stopColor="#fdf4ff" stopOpacity="0.12" />
              <stop offset="1" stopColor="#ec4899" stopOpacity="0.08" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="auth-split-dots" aria-hidden="true">
        {Array.from({ length: 36 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

      <div className="auth-split-brand-inner">
        <div className="auth-split-logo">
          <div className="auth-split-logo-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="4"
                width="18"
                height="17"
                rx="3"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="1.5"
              />
              <path
                d="M8 2v4M16 2v4M3 10h18"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="auth-split-logo-text">
            Calendário
            <br />
            do Casal
          </span>
        </div>

        <p className="auth-split-eyebrow">— Seus momentos</p>

        <h1 className="auth-split-headline">
          Guarde cada <strong>momento especial</strong> com cuidado.
        </h1>

        <p className="auth-split-sub">
          Uma forma delicada de registrar as memórias que fazem parte da
          história de vocês dois.
        </p>

        <div className="auth-split-stats">
          <div>
            <div className="auth-split-stat-num">365</div>
            <div className="auth-split-stat-label">dias por ano</div>
          </div>
          <div>
            <div className="auth-split-stat-num">+</div>
            <div className="auth-split-stat-label">memórias juntos</div>
          </div>
          <div>
            <div className="auth-split-stat-num">1</div>
            <div className="auth-split-stat-label">grande história</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
