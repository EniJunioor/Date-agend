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
    <main className="lp">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="lp-header">
        <div className="lp-header-inner">
          <div className="lp-logo">
            <span className="lp-logo-ic">
              <AppIcon name="heart" size={22} strokeWidth={2} />
            </span>
            <span className="lp-logo-text">Calendário do Casal</span>
          </div>
          <nav className="lp-nav">
            <a href="#features" className="lp-nav-link">Funcionalidades</a>
            <a href="#how" className="lp-nav-link">Como funciona</a>
            <a href="#pricing" className="lp-nav-link">Planos</a>
            <Link href="/login" className="lp-nav-link">Entrar</Link>
          </nav>
          <Link href="/register" className="lp-btn-primary">Começar agora</Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-left">
          <h1 className="lp-hero-title">
            Transformem cada momento em uma{" "}
            <em className="lp-hero-em">memória eterna.</em>
          </h1>
          <p className="lp-hero-desc">
            Um refúgio digital exclusivo para o seu relacionamento. Organize o futuro, celebre o passado e viva o presente… juntos.
          </p>
          <div className="lp-hero-actions">
            <Link href="/register" className="lp-btn-primary lp-btn-lg">
              Criar nosso universo →
            </Link>
          </div>
          <div className="lp-hero-social">
            <div className="lp-social-avatars">
              <div className="lp-sav lp-sav-1" />
              <div className="lp-sav lp-sav-2" />
              <div className="lp-sav lp-sav-3" />
            </div>
            <span className="lp-social-text">+100k casais nos confiam</span>
          </div>
        </div>

        <div className="lp-hero-right" aria-hidden="true">
          {/* Mock phone/card */}
          <div className="lp-mock-card">
            <div className="lp-mock-header">
              <div className="lp-mock-dot" />
              <div className="lp-mock-dot" />
              <div className="lp-mock-dot" />
            </div>
            <div className="lp-mock-counter">
              <div className="lp-mc-label">Dias juntos</div>
              <div className="lp-mc-num">842</div>
            </div>
            <div className="lp-mock-events">
              {["🎂 Aniversário — 2 dias", "✈️ Viagem a Paris — 18 dias", "🍝 Jantar especial — 23 dias"].map((e) => (
                <div key={e} className="lp-mock-event">{e}</div>
              ))}
            </div>
          </div>

          {/* Floating badge */}
          <div className="lp-float-badge">
            <div className="lp-float-badge-ic">📸</div>
            <div>
              <div className="lp-float-badge-title">Nova Memória</div>
              <div className="lp-float-badge-sub">Jantar de 2 Anos ❤️</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features bento ───────────────────────────────────────────────── */}
      <section className="lp-features" id="features">
        <div className="lp-section-inner">
          <div className="lp-section-label">PRINCIPAIS RECURSOS</div>
          <h2 className="lp-section-title">Feito para o amor moderno.</h2>

          <div className="lp-bento">
            {/* 1 – Calendário */}
            <div className="lp-bento-card lp-bento-cal">
              <div className="lp-bento-icon"><AppIcon name="calendar" size={28} /></div>
              <h3 className="lp-bento-title">Calendário Inteligente</h3>
              <p className="lp-bento-desc">Sincronize plans futuros, lembretes e aniversários de vocês em um clique, compartilhe com quem você ama.</p>
            </div>

            {/* 2 – Galeria (destaque rosa) */}
            <div className="lp-bento-card lp-bento-gallery">
              <div className="lp-bento-icon"><AppIcon name="images" size={28} /></div>
              <h3 className="lp-bento-title">Galeria de Afeto</h3>
              <p className="lp-bento-desc">Um só álbum para cada momento que vale a pena eternizar, compartilhado entre o casal.</p>
            </div>

            {/* 3 – Conquistas */}
            <div className="lp-bento-card lp-bento-ach">
              <div className="lp-bento-icon"><AppIcon name="trophy" size={28} /></div>
              <h3 className="lp-bento-title">Conquistas e Bôis</h3>
              <p className="lp-bento-desc">Desbloqueie conquistas ao atingir marcos especiais e celebre cada vitória juntos em todas as ocasiões.</p>
            </div>

            {/* 4 – Linha do Tempo */}
            <div className="lp-bento-card lp-bento-timeline">
              <div className="lp-bento-icon"><AppIcon name="activity" size={28} /></div>
              <h3 className="lp-bento-title">Linha do Tempo</h3>
              <p className="lp-bento-desc">Cada evento vira um capítulo na história do casal — nostálgico e organizado.</p>
            </div>

            {/* 5 – Mob Final (dark) */}
            <div className="lp-bento-card lp-bento-dark">
              <div className="lp-bento-icon"><AppIcon name="smartphone" size={28} /></div>
              <h3 className="lp-bento-title">Mob Final</h3>
              <p className="lp-bento-desc">App otimizado para mobile com notificações push e acesso offline a qualquer hora.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="lp-testimonials" id="how">
        <div className="lp-section-inner">
          <h2 className="lp-section-title">O que nossos casais dizem</h2>
          <div className="lp-testi-grid">
            {testimonials.map((t) => (
              <div key={t.name} className="lp-testi-card">
                <p className="lp-testi-text">"{t.text}"</p>
                <div className="lp-testi-author">
                  <div className="lp-testi-avatar">{t.initials}</div>
                  <div>
                    <div className="lp-testi-name">{t.name}</div>
                    <div className="lp-testi-since">{t.since}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="lp-pricing" id="pricing">
        <div className="lp-section-inner lp-pricing-inner">
          <div className="lp-pricing-left">
            <h2 className="lp-pricing-title">Prontos para eternizar sua jornada?</h2>
            <p className="lp-pricing-desc">
              Comece gratuitamente. Desbloqueie o plano Premium para armazenar fotos e ter personalização total da nossa história.
            </p>
            <ul className="lp-pricing-features">
              <li><span className="lp-check">✓</span> Acesso compartilhado para o casal</li>
              <li><span className="lp-check">✓</span> Notificações antes de datas importantes</li>
              <li><span className="lp-check">✓</span> Linha do tempo e galeria de memórias</li>
              <li><span className="lp-check">✓</span> Conquistas para o casal</li>
            </ul>
            <Link href="/register" className="lp-btn-primary lp-btn-lg">Criar Conta Grátis</Link>
          </div>
          <div className="lp-pricing-card">
            <div className="lp-price-kicker">PLANO PREMIUM</div>
            <div className="lp-price-amount">R$ <span>14</span><sup>,50</sup></div>
            <div className="lp-price-period">/mês por casal</div>
            <Link href="/register" className="lp-price-btn">
              Testar premium, é grátis hoje!
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-logo lp-logo-footer">
              <span className="lp-logo-ic"><AppIcon name="heart" size={18} /></span>
              <span className="lp-logo-text">Calendário do Casal</span>
            </div>
            <p className="lp-footer-tagline">Nesta plataforma, você transforma cada pequena e grande memória em uma jornada inesquecível. Sua história merece um lugar especial.</p>
          </div>
          <div className="lp-footer-cols">
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Produto</div>
              <Link href="#features">Funcionalidades</Link>
              <Link href="#pricing">Preços</Link>
              <a href="#">Segurança</a>
              <a href="#">Blog</a>
            </div>
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Suporte</div>
              <a href="#">Central de Ajuda</a>
              <a href="#">FAQ</a>
              <a href="#">Privacidade</a>
              <a href="#">Contato</a>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          © 2026 Calendário do Casal · Site feito com ♥ · PIPA Approved
        </div>
      </footer>

      <style>{styles}</style>
    </main>
  );
}

const testimonials = [
  {
    text: "O Calendário do Casal mudou a forma como nos comunicamos. Antes, perdíamos calls e esquecíamos de fotos. Agora, temos um pequeno templo do nosso passado e progresso.",
    name: "Mariana & Lucas",
    initials: "ML",
    since: "Juntos há 3 anos",
  },
  {
    text: "As conquistas e marcos nos motivam a viver coisas novas! É mais que um calendário: é um jeito de conectar a gente pelo que a gente tem de melhor.",
    name: "Beatriz & Felipe",
    initials: "BF",
    since: "Juntos há 1 ano e meio",
  },
];

const styles = `
.lp { min-height: 100vh; background: #ffffff; font-family: var(--font-body); }

/* ── Header ── */
.lp-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #f0f0f5;
  padding: 0 24px;
}
.lp-header-inner {
  max-width: 1100px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  height: 64px; gap: 24px;
}
.lp-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
.lp-logo-ic { color: #db2777; display: flex; }
.lp-logo-text { font-weight: 800; font-size: 15px; color: #db2777; letter-spacing: -0.01em; }
.lp-nav { display: flex; align-items: center; gap: 24px; }
.lp-nav-link { font-size: 14px; font-weight: 500; color: #374151; text-decoration: none; }
.lp-nav-link:hover { color: #db2777; }

/* Buttons */
.lp-btn-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 22px; border-radius: 999px;
  background: linear-gradient(90deg, #b0005f, #db2777, #f472b6);
  color: white; font-weight: 700; font-size: 14px; text-decoration: none;
  border: none; cursor: pointer;
  transition: filter 0.2s, transform 0.2s;
  box-shadow: 0 8px 28px rgba(219,39,119,0.24);
}
.lp-btn-primary:hover { filter: brightness(1.06); transform: translateY(-1px); }
.lp-btn-lg { padding: 13px 30px; font-size: 15px; }

/* ── Hero ── */
.lp-hero {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 64px; align-items: center;
  padding: 80px 24px 64px;
}
@media (max-width: 900px) {
  .lp-hero { grid-template-columns: 1fr; gap: 40px; padding: 48px 24px; }
  .lp-hero-right { display: none; }
}
.lp-hero-title {
  font-size: clamp(36px, 4.5vw, 58px);
  font-weight: 900; line-height: 1.1;
  color: #111827; letter-spacing: -0.03em;
  margin: 0 0 16px;
}
.lp-hero-em {
  font-style: normal;
  color: #db2777;
}
.lp-hero-desc {
  font-size: 16px; line-height: 1.65;
  color: #6b7280; margin: 0 0 32px;
  max-width: 480px;
}
.lp-hero-actions { margin-bottom: 28px; }
.lp-hero-social { display: flex; align-items: center; gap: 12px; }
.lp-social-avatars { display: flex; }
.lp-sav {
  width: 32px; height: 32px; border-radius: 50%;
  border: 2px solid white;
  background: linear-gradient(135deg, #ffd6e8, #c8e6f5);
}
.lp-sav-1 { background: linear-gradient(135deg, #ffd6e8, #ffb4d6); }
.lp-sav-2 { background: linear-gradient(135deg, #c8e6f5, #bfdbfe); margin-left: -8px; }
.lp-sav-3 { background: linear-gradient(135deg, #fef3c7, #fde68a); margin-left: -8px; }
.lp-social-text { font-size: 13px; color: #6b7280; font-weight: 500; }

/* Mock card */
.lp-hero-right { position: relative; }
.lp-mock-card {
  background: white;
  border: 1px solid #e9edf5;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 24px 80px rgba(15,23,42,0.1);
}
.lp-mock-header { display: flex; gap: 6px; margin-bottom: 20px; }
.lp-mock-dot { width: 10px; height: 10px; border-radius: 50%; background: #e9edf5; }
.lp-mc-label { font-size: 12px; color: #9ca3af; margin-bottom: 4px; }
.lp-mc-num { font-size: 52px; font-weight: 900; color: #db2777; line-height: 1; margin-bottom: 24px; }
.lp-mock-events { display: flex; flex-direction: column; gap: 10px; }
.lp-mock-event {
  padding: 10px 14px;
  background: #f8faff;
  border-radius: 10px;
  border: 1px solid #eef1f8;
  font-size: 13px; font-weight: 600; color: #374151;
}
.lp-float-badge {
  position: absolute; top: -16px; right: -16px;
  display: flex; align-items: center; gap: 10px;
  background: white; border-radius: 14px;
  padding: 10px 14px;
  box-shadow: 0 8px 30px rgba(15,23,42,0.12);
  border: 1px solid #f0f0f5;
}
.lp-float-badge-ic { font-size: 20px; }
.lp-float-badge-title { font-size: 10px; color: #9ca3af; font-weight: 700; }
.lp-float-badge-sub { font-size: 12px; font-weight: 800; color: #111827; }

/* ── Features ── */
.lp-features {
  background: #f8faff;
  padding: 80px 24px;
}
.lp-section-inner { max-width: 1100px; margin: 0 auto; }
.lp-section-label {
  display: inline-block;
  font-size: 11px; font-weight: 800; letter-spacing: 0.14em;
  color: #b0005f;
  background: rgba(176,0,95,0.08);
  padding: 4px 12px; border-radius: 999px;
  margin-bottom: 12px;
}
.lp-section-title {
  font-size: clamp(28px, 3.5vw, 40px);
  font-weight: 900; color: #111827;
  letter-spacing: -0.02em; margin: 0 0 40px;
}

/* Bento grid */
.lp-bento {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: 16px;
}
@media (max-width: 900px) { .lp-bento { grid-template-columns: 1fr 1fr; } }
@media (max-width: 580px) { .lp-bento { grid-template-columns: 1fr; } }

.lp-bento-card {
  border-radius: 20px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.lp-bento-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
.lp-bento-title { font-size: 16px; font-weight: 800; color: #111827; margin: 0; }
.lp-bento-desc { font-size: 13px; color: #6b7280; line-height: 1.55; margin: 0; }

/* Bento variants */
.lp-bento-cal { background: white; border: 1px solid #e9edf5; }
.lp-bento-cal .lp-bento-icon { background: rgba(219,39,119,0.08); color: #db2777; }
.lp-bento-gallery { background: #db2777; color: white; }
.lp-bento-gallery .lp-bento-title { color: white; }
.lp-bento-gallery .lp-bento-desc { color: rgba(255,255,255,0.82); }
.lp-bento-gallery .lp-bento-icon { background: rgba(255,255,255,0.18); color: white; }
.lp-bento-ach { background: white; border: 1px solid #e9edf5; }
.lp-bento-ach .lp-bento-icon { background: rgba(234,179,8,0.1); color: #ca8a04; }
.lp-bento-timeline { background: white; border: 1px solid #e9edf5; }
.lp-bento-timeline .lp-bento-icon { background: rgba(99,102,241,0.08); color: #6366f1; }
.lp-bento-dark { background: #111827; border: 1px solid #1f2937; }
.lp-bento-dark .lp-bento-title { color: white; }
.lp-bento-dark .lp-bento-desc { color: rgba(255,255,255,0.6); }
.lp-bento-dark .lp-bento-icon { background: rgba(255,255,255,0.1); color: white; }

/* ── Testimonials ── */
.lp-testimonials { padding: 80px 24px; }
.lp-testi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
@media (max-width: 700px) { .lp-testi-grid { grid-template-columns: 1fr; } }
.lp-testi-card {
  background: white; border: 1px solid #e9edf5;
  border-radius: 20px; padding: 28px 26px;
  box-shadow: 0 2px 12px rgba(15,23,42,0.04);
  display: flex; flex-direction: column; gap: 20px;
}
.lp-testi-text { font-size: 14px; line-height: 1.7; color: #374151; margin: 0; }
.lp-testi-author { display: flex; align-items: center; gap: 12px; }
.lp-testi-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, #ffd6e8, #f472b6);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: #b0005f;
  flex-shrink: 0;
}
.lp-testi-name { font-size: 13px; font-weight: 800; color: #111827; }
.lp-testi-since { font-size: 12px; color: #9ca3af; }

/* ── Pricing ── */
.lp-pricing { padding: 80px 24px; background: #f8faff; }
.lp-pricing-inner { display: grid; grid-template-columns: 1fr 360px; gap: 64px; align-items: center; }
@media (max-width: 900px) { .lp-pricing-inner { grid-template-columns: 1fr; gap: 36px; } }
.lp-pricing-title {
  font-size: clamp(28px, 3vw, 38px);
  font-weight: 900; color: #111827;
  letter-spacing: -0.02em; margin: 0 0 14px;
}
.lp-pricing-desc { font-size: 15px; color: #6b7280; line-height: 1.65; margin: 0 0 24px; }
.lp-pricing-features { list-style: none; padding: 0; margin: 0 0 32px; display: flex; flex-direction: column; gap: 10px; }
.lp-pricing-features li { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #374151; }
.lp-check {
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(219,39,119,0.1);
  color: #db2777;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; flex-shrink: 0;
}
.lp-pricing-card {
  background: white; border: 1px solid #e9edf5;
  border-radius: 24px; padding: 36px 32px;
  box-shadow: 0 12px 40px rgba(15,23,42,0.08);
  text-align: center;
}
.lp-price-kicker {
  font-size: 11px; font-weight: 800; letter-spacing: 0.14em;
  color: #9ca3af; margin-bottom: 16px;
}
.lp-price-amount {
  font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 4px;
}
.lp-price-amount span { font-size: 52px; font-weight: 900; color: #111827; letter-spacing: -0.03em; }
.lp-price-amount sup { font-size: 22px; font-weight: 700; }
.lp-price-period { font-size: 13px; color: #9ca3af; margin-bottom: 28px; }
.lp-price-btn {
  display: block; width: 100%;
  padding: 13px 0; border-radius: 999px;
  background: linear-gradient(90deg, #b0005f, #db2777);
  color: white; font-weight: 700; font-size: 14px;
  text-decoration: none; text-align: center;
  transition: filter 0.2s;
}
.lp-price-btn:hover { filter: brightness(1.08); }

/* ── Footer ── */
.lp-footer { background: #111827; padding: 64px 24px 0; }
.lp-footer-inner {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 2fr 1fr;
  gap: 64px; padding-bottom: 48px;
}
@media (max-width: 700px) { .lp-footer-inner { grid-template-columns: 1fr; gap: 32px; } }
.lp-logo-footer .lp-logo-ic { color: #db2777; }
.lp-logo-footer .lp-logo-text { color: #db2777; }
.lp-footer-tagline { font-size: 13px; color: #6b7280; line-height: 1.6; margin: 12px 0 0; max-width: 380px; }
.lp-footer-cols { display: flex; gap: 48px; }
.lp-footer-col { display: flex; flex-direction: column; gap: 10px; }
.lp-footer-col-title { font-size: 13px; font-weight: 700; color: white; margin-bottom: 4px; }
.lp-footer-col a { font-size: 13px; color: #6b7280; text-decoration: none; }
.lp-footer-col a:hover { color: #db2777; }
.lp-footer-bottom {
  border-top: 1px solid #1f2937;
  padding: 20px 0; text-align: center;
  font-size: 12px; color: #4b5563;
}
`;
