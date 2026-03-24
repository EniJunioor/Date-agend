"use client";

import { useState, useTransition } from "react";
import { useTheme } from "next-themes";
import { logoutAction } from "@/app/actions/auth";

const COLOR_THEMES = [
  { id: "rosa", label: "Rosa", color: "#db2777" },
  { id: "azul", label: "Azul", color: "#2563eb" },
  { id: "verde", label: "Verde", color: "#059669" },
  { id: "roxo", label: "Roxo", color: "#7c3aed" },
  { id: "laranja", label: "Laranja", color: "#ea580c" },
];

const LOCALES = [
  { id: "pt-BR", label: "🇧🇷 Português" },
  { id: "en", label: "🇺🇸 English" },
  { id: "es", label: "🇪🇸 Español" },
];

interface SettingsClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    nickname: string | null;
    locale: string | null;
    coupleId: string | null;
  } | undefined;
  couple: {
    id: string;
    theme: string | null;
    bio: string | null;
    phrase: string | null;
    startDate: string;
  } | null;
}

export function SettingsClient({ user, couple }: SettingsClientProps) {
  const { theme, setTheme } = useTheme();
  const [colorTheme, setColorTheme] = useState(couple?.theme ?? "rosa");
  const [locale, setLocale] = useState(user?.locale ?? "pt-BR");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");

  const sections = [
    { id: "profile", label: "👤 Perfil", icon: "👤" },
    { id: "appearance", label: "🎨 Aparência", icon: "🎨" },
    { id: "couple", label: "💑 Casal", icon: "💑" },
    { id: "language", label: "🌐 Idioma", icon: "🌐" },
    { id: "danger", label: "⚠️ Conta", icon: "⚠️" },
  ];

  const applyTheme = (themeId: string) => {
    setColorTheme(themeId);
    document.documentElement.setAttribute("data-theme", themeId);
    // In real app: save to DB via server action
  };

  const applyLocale = (loc: string) => {
    setLocale(loc);
    document.cookie = `locale=${loc};path=/;max-age=31536000`;
    // In real app: save to DB and refresh
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-layout">
      {/* Sidebar */}
      <nav className="settings-nav">
        {sections.map((s) => (
          <button
            key={s.id}
            className={`settings-nav-item ${activeSection === s.id ? "settings-nav-active" : ""}`}
            onClick={() => setActiveSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="settings-content">

        {/* ── Profile ────────────────────────────────────────────────────── */}
        {activeSection === "profile" && (
          <div className="settings-section">
            <h2 className="settings-title">Perfil</h2>
            <div className="settings-card">
              <div className="settings-field">
                <label className="settings-label">Nome completo</label>
                <input type="text" defaultValue={user?.name} className="settings-input" />
              </div>
              <div className="settings-field">
                <label className="settings-label">Apelido</label>
                <input type="text" defaultValue={user?.nickname ?? ""} placeholder="Como seu/sua parceiro(a) te chama" className="settings-input" />
              </div>
              <div className="settings-field">
                <label className="settings-label">E-mail</label>
                <input type="email" defaultValue={user?.email} className="settings-input" disabled />
                <span className="settings-hint">O e-mail não pode ser alterado</span>
              </div>
              <button className="btn-save-settings" onClick={showSaved}>
                {saved ? "✅ Salvo!" : "Salvar alterações"}
              </button>
            </div>
          </div>
        )}

        {/* ── Appearance ─────────────────────────────────────────────────── */}
        {activeSection === "appearance" && (
          <div className="settings-section">
            <h2 className="settings-title">Aparência</h2>

            {/* Dark/Light mode */}
            <div className="settings-card" style={{ marginBottom: 16 }}>
              <h3 className="settings-subtitle">Modo</h3>
              <div className="theme-mode-grid">
                {[
                  { id: "light", label: "☀️ Claro" },
                  { id: "dark", label: "🌙 Escuro" },
                  { id: "system", label: "💻 Sistema" },
                ].map((m) => (
                  <button
                    key={m.id}
                    className={`theme-mode-btn ${theme === m.id ? "theme-mode-active" : ""}`}
                    onClick={() => setTheme(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color theme */}
            <div className="settings-card">
              <h3 className="settings-subtitle">Tema de cor do casal</h3>
              <div className="color-theme-grid">
                {COLOR_THEMES.map((ct) => (
                  <button
                    key={ct.id}
                    className={`color-theme-btn ${colorTheme === ct.id ? "color-theme-active" : ""}`}
                    onClick={() => applyTheme(ct.id)}
                  >
                    <div className="color-theme-swatch" style={{ background: ct.color }} />
                    <span>{ct.label}</span>
                  </button>
                ))}
              </div>
              <p className="settings-hint" style={{ marginTop: 12 }}>
                O tema de cor é compartilhado entre os dois parceiros.
              </p>
            </div>
          </div>
        )}

        {/* ── Couple ─────────────────────────────────────────────────────── */}
        {activeSection === "couple" && (
          <div className="settings-section">
            <h2 className="settings-title">Perfil do Casal</h2>
            {couple ? (
              <div className="settings-card">
                <div className="settings-field">
                  <label className="settings-label">Data de início</label>
                  <input type="date" defaultValue={couple.startDate as string} className="settings-input" />
                </div>
                <div className="settings-field">
                  <label className="settings-label">Frase do casal</label>
                  <input type="text" defaultValue={couple.phrase ?? ""} placeholder="Uma frase especial de vocês..." className="settings-input" maxLength={200} />
                </div>
                <div className="settings-field">
                  <label className="settings-label">Nossa história</label>
                  <textarea defaultValue={couple.bio ?? ""} placeholder="Conte a história de vocês..." rows={4} className="settings-input" style={{ resize: "vertical" }} />
                </div>
                <button className="btn-save-settings" onClick={showSaved}>
                  {saved ? "✅ Salvo!" : "Salvar"}
                </button>
              </div>
            ) : (
              <div className="settings-card">
                <p style={{ color: "var(--foreground-muted)", fontSize: 14 }}>
                  Você ainda não está vinculado a um casal.{" "}
                  <a href="/invite" style={{ color: "var(--primary)", fontWeight: 600 }}>
                    Criar ou entrar em um casal →
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Language ───────────────────────────────────────────────────── */}
        {activeSection === "language" && (
          <div className="settings-section">
            <h2 className="settings-title">Idioma</h2>
            <div className="settings-card">
              <div className="locale-grid">
                {LOCALES.map((loc) => (
                  <button
                    key={loc.id}
                    className={`locale-btn ${locale === loc.id ? "locale-btn-active" : ""}`}
                    onClick={() => applyLocale(loc.id)}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Danger zone ────────────────────────────────────────────────── */}
        {activeSection === "danger" && (
          <div className="settings-section">
            <h2 className="settings-title">Conta</h2>
            <div className="settings-card danger-zone">
              <div className="danger-item">
                <div>
                  <div className="danger-label">Sair da conta</div>
                  <div className="danger-desc">Você será redirecionado para a tela de login.</div>
                </div>
                <form action={logoutAction}>
                  <button type="submit" className="btn-danger-secondary">Sair</button>
                </form>
              </div>
              <div className="danger-item">
                <div>
                  <div className="danger-label">Exportar meus dados</div>
                  <div className="danger-desc">Baixe um arquivo ZIP com todos os seus dados (LGPD).</div>
                </div>
                <button className="btn-danger-secondary">Exportar ZIP</button>
              </div>
              <div className="danger-item danger-item-red">
                <div>
                  <div className="danger-label" style={{ color: "#dc2626" }}>Excluir conta</div>
                  <div className="danger-desc">Esta ação é permanente e não pode ser desfeita.</div>
                </div>
                <button className="btn-danger">Excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{settingsStyles}</style>
    </div>
  );
}

const settingsStyles = `
  .settings-layout {
    display: flex; gap: 24px;
  }
  @media (max-width: 768px) {
    .settings-layout { flex-direction: column; }
  }

  .settings-nav {
    width: 200px; flex-shrink: 0;
    display: flex; flex-direction: column; gap: 2px;
  }
  @media (max-width: 768px) {
    .settings-nav { width: 100%; flex-direction: row; flex-wrap: wrap; }
  }

  .settings-nav-item {
    text-align: left; padding: 10px 14px;
    border-radius: var(--radius-md); border: none;
    background: transparent; color: var(--foreground-muted);
    font-size: 14px; font-weight: 500; cursor: pointer;
    transition: all 0.15s;
  }
  .settings-nav-item:hover { background: var(--card); color: var(--foreground); }
  .settings-nav-active { background: var(--primary-surface) !important; color: var(--primary) !important; font-weight: 700; }

  .settings-content { flex: 1; min-width: 0; }
  .settings-section { display: flex; flex-direction: column; gap: 16px; }
  .settings-title {
    font-family: var(--font-display);
    font-size: 22px; font-weight: 800; color: var(--foreground);
  }
  .settings-subtitle { font-size: 14px; font-weight: 700; color: var(--foreground); margin-bottom: 12px; }

  .settings-card {
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 24px;
    display: flex; flex-direction: column; gap: 16px;
  }

  .settings-field { display: flex; flex-direction: column; gap: 6px; }
  .settings-label { font-size: 13px; font-weight: 600; color: var(--foreground); }
  .settings-hint { font-size: 12px; color: var(--foreground-subtle); }
  .settings-input {
    padding: 10px 12px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--background);
    color: var(--foreground); font-size: 14px;
    font-family: var(--font-body); outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .settings-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-surface); }
  .settings-input:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-save-settings {
    align-self: flex-start; padding: 10px 22px;
    border-radius: var(--radius-md);
    background: var(--primary); color: white;
    border: none; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
    box-shadow: var(--shadow-primary);
  }
  .btn-save-settings:hover { filter: brightness(1.08); }

  /* Theme mode */
  .theme-mode-grid { display: flex; gap: 8px; }
  .theme-mode-btn {
    flex: 1; padding: 10px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--background);
    color: var(--foreground-muted); font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .theme-mode-btn:hover { border-color: var(--primary-light); color: var(--primary); }
  .theme-mode-active { border-color: var(--primary) !important; color: var(--primary) !important; font-weight: 700; background: var(--primary-surface) !important; }

  /* Color themes */
  .color-theme-grid { display: flex; flex-wrap: wrap; gap: 10px; }
  .color-theme-btn {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    padding: 12px 16px; border-radius: var(--radius-md);
    border: 2px solid var(--border); background: var(--background);
    cursor: pointer; font-size: 12px; font-weight: 600; color: var(--foreground-muted);
    transition: all 0.15s; min-width: 70px;
  }
  .color-theme-btn:hover { border-color: var(--border-strong); }
  .color-theme-active { border-color: var(--primary) !important; color: var(--primary) !important; background: var(--primary-surface) !important; }
  .color-theme-swatch { width: 32px; height: 32px; border-radius: 50%; }

  /* Locale */
  .locale-grid { display: flex; flex-direction: column; gap: 8px; }
  .locale-btn {
    padding: 12px 16px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--background);
    color: var(--foreground); font-size: 14px; font-weight: 500;
    text-align: left; cursor: pointer; transition: all 0.15s;
  }
  .locale-btn:hover { border-color: var(--primary-light); }
  .locale-btn-active { border-color: var(--primary); color: var(--primary); font-weight: 700; background: var(--primary-surface); }

  /* Danger zone */
  .danger-zone { gap: 0; padding: 0; }
  .danger-item {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    padding: 20px 24px; border-bottom: 1px solid var(--border);
  }
  .danger-item:last-child { border-bottom: none; }
  .danger-label { font-size: 14px; font-weight: 700; color: var(--foreground); margin-bottom: 2px; }
  .danger-desc { font-size: 12px; color: var(--foreground-muted); }
  .btn-danger-secondary {
    padding: 8px 18px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--background);
    color: var(--foreground); font-size: 13px; font-weight: 600;
    cursor: pointer; flex-shrink: 0; transition: all 0.15s;
  }
  .btn-danger-secondary:hover { border-color: var(--border-strong); }
  .btn-danger {
    padding: 8px 18px; border-radius: var(--radius-md);
    border: 1px solid #fecaca; background: #fee2e2;
    color: #dc2626; font-size: 13px; font-weight: 600;
    cursor: pointer; flex-shrink: 0; transition: all 0.15s;
  }
  .btn-danger:hover { background: #fecaca; }
`;
