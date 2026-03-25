import Link from "next/link";
import type { Metadata } from "next";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";

export const metadata: Metadata = {
  title: "Calendário do Casal — Registre seus momentos especiais",
  description:
    "A plataforma perfeita para casais registrarem, celebrarem e reviverem os momentos mais especiais do relacionamento.",
};

export default function LandingPage() {
  return (
    <main className="landing">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="logo">
            <span className="logo-icon">
              <AppIcon name="heart" size={26} strokeWidth={2} className="text-primary" />
            </span>
            <span className="logo-text">Calendário do Casal</span>
          </div>
          <nav className="header-nav">
            <Link href="/login" className="btn btn-ghost">
              Entrar
            </Link>
            <Link href="/register" className="btn btn-primary">
              Começar grátis
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <AppIcon name="sparkles" size={16} className="inline-icon" /> Para casais apaixonados
          </div>
          <h1 className="hero-title">
            Cada momento merece
            <br />
            <em>ser lembrado</em>
          </h1>
          <p className="hero-desc">
            Registre datas especiais, adicione fotos, acompanhe a linha do tempo
            do seu amor e receba lembretes automáticos — tudo em um só lugar.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn btn-primary btn-lg">
              Criar conta grátis
            </Link>
            <Link href="/login" className="btn btn-outline btn-lg">
              Já tenho conta
            </Link>
          </div>
          <p className="hero-hint">Sem anúncios · 100% privado · Gratuito</p>
        </div>

        {/* ── Mock app preview ─────────────────────────────────────────── */}
        <div className="hero-preview" aria-hidden="true">
          <div className="preview-card">
            <div className="preview-header">
              <div className="preview-dot" style={{ background: "#ef4444" }} />
              <div className="preview-dot" style={{ background: "#f59e0b" }} />
              <div className="preview-dot" style={{ background: "#22c55e" }} />
              <span className="preview-title">Março 2026</span>
            </div>
            <div className="preview-counter">
              <div className="counter-number">847</div>
              <div className="counter-label" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                dias juntos <AppIcon name="heart" size={14} />
              </div>
            </div>
            <div className="preview-events">
              {[
                { icon: "party-popper" as AppIconName, title: "3 anos juntos", date: "15 Mar" },
                { icon: "plane" as AppIconName, title: "Viagem a Paris", date: "22 Mar" },
                { icon: "utensils-crossed" as AppIconName, title: "Jantar especial", date: "28 Mar" },
              ].map((e) => (
                <div key={e.title} className="preview-event">
                  <span className="preview-event-emoji">
                    <AppIcon name={e.icon} size={20} />
                  </span>
                  <div>
                    <div className="preview-event-title">{e.title}</div>
                    <div className="preview-event-date">{e.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="features">
        <div className="features-inner">
          <h2 className="section-title">Tudo para o seu relacionamento</h2>
          <p className="section-desc">
            Do calendário à galeria de fotos — uma plataforma completa para
            vocês dois.
          </p>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">
                  <AppIcon name={f.icon} size={28} />
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="cta">
        <div className="cta-inner">
          <h2 className="cta-title">Comece hoje mesmo</h2>
          <p className="cta-desc">
            Crie sua conta gratuitamente e convide seu/sua parceiro(a).
          </p>
          <Link href="/register" className="btn btn-primary btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            Criar conta agora <AppIcon name="heart" size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          Feito com <AppIcon name="heart" size={16} /> para casais · &copy; {new Date().getFullYear()} Calendário do Casal
        </p>
      </footer>

      <style>{landingStyles}</style>
    </main>
  );
}

const features: { icon: AppIconName; title: string; desc: string }[] = [
  {
    icon: "calendar",
    title: "Calendário compartilhado",
    desc: "Visualize os eventos do casal em modos mensal, semanal e agenda. Crie, edite e organize facilmente.",
  },
  {
    icon: "images",
    title: "Galeria de fotos",
    desc: "Adicione fotos a cada evento e crie um álbum de memórias que vocês podem rever a qualquer momento.",
  },
  {
    icon: "history",
    title: "Linha do tempo",
    desc: "Acompanhe a história do relacionamento em uma timeline bonita, com contador de dias juntos.",
  },
  {
    icon: "bell",
    title: "Lembretes automáticos",
    desc: "Receba notificações por e-mail e push antes de datas importantes. Nunca esqueça um aniversário.",
  },
  {
    icon: "trophy",
    title: "Conquistas e badges",
    desc: "Desbloqueie conquistas especiais ao atingir marcos do relacionamento. Gamificação para o amor!",
  },
  {
    icon: "hourglass",
    title: "Cápsula do tempo",
    desc: "Crie mensagens e fotos para abrir em uma data futura. Uma surpresa guardada com carinho.",
  },
];

const landingStyles = `
  .landing { min-height: 100vh; background: var(--background); }

  /* Header */
  .landing-header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 24px;
  }
  .dark .landing-header { background: rgba(15,23,42,0.85); }
  .landing-header-inner {
    max-width: 1100px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    height: 64px;
  }
  .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .logo-icon { display: flex; align-items: center; justify-content: center; }
  .logo-text { font-family: var(--font-display); font-weight: 700; font-size: 17px; color: var(--primary); }
  .header-nav { display: flex; align-items: center; gap: 12px; }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 9px 20px; border-radius: var(--radius-md);
    font-weight: 600; font-size: 14px; text-decoration: none;
    cursor: pointer; border: none; transition: all 0.2s ease;
  }
  .btn-lg { padding: 13px 28px; font-size: 15px; border-radius: var(--radius-lg); }
  .btn-primary { background: var(--primary); color: white; box-shadow: var(--shadow-primary); }
  .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .btn-ghost { color: var(--foreground-muted); background: transparent; }
  .btn-ghost:hover { background: var(--primary-surface); color: var(--primary); }
  .btn-outline {
    background: transparent; border: 2px solid var(--border);
    color: var(--foreground);
  }
  .btn-outline:hover { border-color: var(--primary); color: var(--primary); }

  /* Hero */
  .hero {
    position: relative; overflow: hidden;
    min-height: calc(100vh - 64px);
    display: flex; align-items: center;
    padding: 80px 24px;
    gap: 60px;
    max-width: 1100px; margin: 0 auto;
  }
  .hero-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
  .hero-orb {
    position: absolute; border-radius: 50%;
    filter: blur(80px); opacity: 0.12;
  }
  .hero-orb-1 { width: 500px; height: 500px; background: var(--primary); top: -150px; right: -100px; }
  .hero-orb-2 { width: 300px; height: 300px; background: var(--primary-light); bottom: -100px; left: 200px; }
  .hero-orb-3 { width: 200px; height: 200px; background: #7c3aed; top: 200px; left: -50px; opacity: 0.08; }

  .hero-content { position: relative; z-index: 1; flex: 1; max-width: 540px; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--primary-surface); color: var(--primary);
    padding: 6px 16px; border-radius: var(--radius-full);
    font-size: 13px; font-weight: 600;
    margin-bottom: 24px;
    border: 1px solid var(--primary-surface-strong);
  }
  .hero-title {
    font-family: var(--font-display);
    font-size: clamp(38px, 5vw, 58px);
    font-weight: 900;
    color: var(--foreground);
    line-height: 1.1;
    margin-bottom: 20px;
  }
  .hero-title em { font-style: italic; color: var(--primary); }
  .hero-desc {
    font-size: 17px; color: var(--foreground-muted);
    line-height: 1.7; margin-bottom: 36px;
    max-width: 480px;
  }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 20px; }
  .hero-hint { font-size: 12px; color: var(--foreground-subtle); }

  /* Preview card */
  .hero-preview { position: relative; z-index: 1; flex-shrink: 0; }
  .preview-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 24px;
    width: 300px;
    box-shadow: var(--shadow-lg);
  }
  .preview-header {
    display: flex; align-items: center; gap: 6px; margin-bottom: 20px;
  }
  .preview-dot { width: 10px; height: 10px; border-radius: 50%; }
  .preview-title {
    margin-left: auto;
    font-size: 12px; font-weight: 700; color: var(--foreground-muted);
    font-family: var(--font-display);
  }
  .preview-counter { text-align: center; margin-bottom: 20px; }
  .counter-number {
    font-family: var(--font-display);
    font-size: 52px; font-weight: 900;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; line-height: 1;
  }
  .counter-label { font-size: 13px; color: var(--foreground-muted); margin-top: 4px; }
  .preview-events { display: flex; flex-direction: column; gap: 10px; }
  .preview-event {
    display: flex; align-items: center; gap: 10px;
    background: var(--primary-surface);
    border-radius: var(--radius-md);
    padding: 10px 12px;
  }
  .preview-event-emoji { display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 28px; color: var(--primary); }
  .preview-event-title { font-size: 13px; font-weight: 600; color: var(--foreground); }
  .preview-event-date { font-size: 11px; color: var(--foreground-muted); }

  /* Features */
  .features { background: var(--background-subtle); padding: 100px 24px; }
  .features-inner { max-width: 1100px; margin: 0 auto; }
  .section-title {
    font-family: var(--font-display);
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 800; color: var(--foreground);
    text-align: center; margin-bottom: 12px;
  }
  .section-desc {
    font-size: 16px; color: var(--foreground-muted);
    text-align: center; margin-bottom: 56px; max-width: 480px; margin-left: auto; margin-right: auto;
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
  .feature-card {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 28px;
    transition: all 0.2s ease;
  }
  .feature-card:hover {
    border-color: var(--primary-light);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
  .feature-icon { display: flex; align-items: center; justify-content: center; margin-bottom: 14px; color: var(--primary); }
  .feature-title {
    font-size: 16px; font-weight: 700;
    color: var(--foreground); margin-bottom: 8px;
  }
  .feature-desc { font-size: 14px; color: var(--foreground-muted); line-height: 1.6; }

  /* CTA */
  .cta { padding: 100px 24px; text-align: center; }
  .cta-inner { max-width: 560px; margin: 0 auto; }
  .cta-title {
    font-family: var(--font-display);
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 800; color: var(--foreground); margin-bottom: 12px;
  }
  .cta-desc { font-size: 16px; color: var(--foreground-muted); margin-bottom: 32px; }

  /* Footer */
  .landing-footer {
    border-top: 1px solid var(--border);
    padding: 24px;
    text-align: center;
    font-size: 13px;
    color: var(--foreground-subtle);
  }

  @media (max-width: 768px) {
    .hero { flex-direction: column; min-height: auto; padding: 60px 24px; }
    .hero-preview { display: none; }
  }
`;
