"use client";

import Image from "next/image";

// Painel visual (lado direito) para o layout de autenticação.
// Mantém o visual do mock sem depender de assets externos.
export function AuthShowcasePanel() {
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f8d6e6"/>
          <stop offset="1" stop-color="#f2f6ff"/>
        </linearGradient>
      </defs>
      <rect width="900" height="600" fill="url(#g)"/>
      <circle cx="670" cy="180" r="170" fill="#ffffff" opacity="0.55"/>
      <circle cx="220" cy="420" r="200" fill="#ffffff" opacity="0.35"/>
      <rect x="220" y="160" width="460" height="280" rx="28" fill="#ffffff" opacity="0.85"/>
      <rect x="260" y="200" width="160" height="16" rx="8" fill="#e9e3f1"/>
      <rect x="260" y="230" width="260" height="16" rx="8" fill="#efeaf6"/>
      <rect x="260" y="260" width="220" height="16" rx="8" fill="#efeaf6"/>
      <rect x="260" y="310" width="320" height="18" rx="9" fill="#e9e3f1"/>
      <rect x="260" y="342" width="240" height="18" rx="9" fill="#efeaf6"/>
    </svg>
  `);

  return (
    <div className="auth-modern-showcase">
      <div className="auth-modern-badge" aria-hidden="true">
        <span className="auth-modern-badge-dot" />
        <div className="auth-modern-badge-text">
          <div className="auth-modern-badge-title">NEW MEMORY ADDED</div>
          <div className="auth-modern-badge-sub">“Our First Anniversary”</div>
        </div>
      </div>

      <div className="auth-modern-card">
        <div className="auth-modern-card-media">
          <Image
            src={`data:image/svg+xml;charset=utf-8,${svg}`}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 0px, 520px"
            className="auth-modern-card-img"
          />
        </div>

        <div className="auth-modern-heart" aria-hidden="true">
          <span>♥</span>
        </div>

        <div className="auth-modern-card-body">
          <h3 className="auth-modern-card-title">A space built for two.</h3>
          <p className="auth-modern-card-sub">
            Documente cada conquista, cada risada e cada momento quietinho no seu
            arquivo digital.
          </p>
          <div className="auth-modern-dots" aria-hidden="true">
            <span className="is-on" />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}

