"use client";

import { useMemo, useState, useTransition } from "react";
import { useTheme } from "next-themes";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";

const COLOR_THEMES = [
  { id: "rosa", label: "Rosa", color: "#db2777" },
  { id: "azul", label: "Azul", color: "#2563eb" },
  { id: "verde", label: "Verde", color: "#059669" },
  { id: "laranja", label: "Laranja", color: "#ea580c" },
  { id: "roxo", label: "Roxo", color: "#7c3aed" },
] as const;

const LOCALES = [
  { id: "en", label: "English" },
  { id: "pt-BR", label: "Português (BR)" },
  { id: "es", label: "Español" },
  { id: "fr", label: "Français" },
] as const;

interface SettingsClientProps {
  user:
    | {
        id: string;
        name: string;
        email: string;
        image: string | null;
        nickname: string | null;
        locale: string | null;
        coupleId: string | null;
      }
    | undefined;
  partner: { name: string; image: string | null } | null;
  couple:
    | {
        id: string;
        theme: string | null;
        bio: string | null;
        phrase: string | null;
        startDate: string;
      }
    | null;
}

function initial(name: string | null | undefined) {
  const t = name?.trim();
  return t ? t[0]!.toUpperCase() : "?";
}

export function SettingsClient({ user, partner, couple }: SettingsClientProps) {
  const { theme, setTheme } = useTheme();
  const [colorTheme, setColorTheme] = useState<string>(couple?.theme ?? "rosa");
  const [locale, setLocale] = useState<string>(user?.locale ?? "en");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const [notifAnniversary, setNotifAnniversary] = useState(true);
  const [notifNotes, setNotifNotes] = useState(true);
  const [notifRecap, setNotifRecap] = useState(false);

  const accent = useMemo(() => {
    const hit = COLOR_THEMES.find((c) => c.id === (colorTheme as any));
    return hit?.color ?? "#db2777";
  }, [colorTheme]);

  const applyTheme = (themeId: string) => {
    setColorTheme(themeId);
    document.documentElement.setAttribute("data-theme", themeId);
  };

  const applyLocale = (loc: string) => {
    setLocale(loc);
    document.cookie = `locale=${loc};path=/;max-age=31536000`;
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const modeOptions: { id: "light" | "dark"; label: string; icon: AppIconName }[] =
    [
      { id: "light", label: "Light", icon: "sun" },
      { id: "dark", label: "Dark", icon: "moon" },
    ];

  return (
    <div className="amore-settings">
      <header className="amore-settings-head">
        <h1>Settings</h1>
        <p>
          Customize your shared digital keepsake to match your unique journey
          together.
        </p>
      </header>

      <div className="amore-settings-grid">
        {/* Couple Profile */}
        <section className="as-card as-card--profile">
          <div className="as-card-title">
            <span className="as-ic as-ic-heart" aria-hidden="true">
              <AppIcon name="heart" size={16} />
            </span>
            <span>Couple Profile</span>
          </div>

          <div className="as-profile-row">
            <div className="as-avatars">
              <div className="as-av">
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="" />
                ) : (
                  <span>{initial(user?.name ?? null)}</span>
                )}
              </div>
              <div className="as-av as-av-2">
                {partner?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={partner.image} alt="" />
                ) : (
                  <span>{initial(partner?.name ?? null)}</span>
                )}
              </div>
              <span className="as-edit" aria-hidden="true">
                <AppIcon name="pencil" size={14} />
              </span>
            </div>

            <div className="as-fields">
              <div className="as-field">
                <div className="as-k">PARTNER 1</div>
                <div className="as-v">{user?.name ?? "—"}</div>
              </div>
              <div className="as-field">
                <div className="as-k">PARTNER 2</div>
                <div className="as-v">{partner?.name ?? "—"}</div>
              </div>
              <div className="as-field as-field-wide">
                <div className="as-k">THE DAY IT STARTED</div>
                <div className="as-v as-v-date">
                  <span>{couple?.startDate ?? "—"}</span>
                  <span className="as-date-ic" aria-hidden="true">
                    <AppIcon name="calendar" size={16} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Theme */}
        <section className="as-card as-card--theme">
          <div className="as-card-title">
            <span className="as-ic as-ic-palette" aria-hidden="true">
              <AppIcon name="palette" size={16} />
            </span>
            <span>Visual Theme</span>
          </div>

          <div className="as-sub">
            <div className="as-sub-k">MODE</div>
            <div className="as-mode">
              {modeOptions.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={theme === m.id ? "is-on" : ""}
                  onClick={() => setTheme(m.id)}
                >
                  <AppIcon name={m.icon} size={14} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="as-sub" style={{ marginTop: 14 }}>
            <div className="as-sub-k">ACCENT PALETTE</div>
            <div className="as-palette">
              {COLOR_THEMES.slice(0, 4).map((ct) => (
                <button
                  key={ct.id}
                  type="button"
                  className={colorTheme === ct.id ? "is-on" : ""}
                  onClick={() => applyTheme(ct.id)}
                  aria-label={ct.label}
                >
                  <span style={{ background: ct.color }} />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="as-card as-card--notif">
          <div className="as-card-title">
            <span className="as-ic as-ic-bell" aria-hidden="true">
              <AppIcon name="bell" size={16} />
            </span>
            <span>Notifications</span>
          </div>

          <div className="as-toggle-row">
            <div>
              <div className="as-t-title">Anniversary Alerts</div>
              <div className="as-t-sub">Don’t miss a milestone</div>
            </div>
            <button
              type="button"
              className={`as-toggle ${notifAnniversary ? "is-on" : ""}`}
              onClick={() => setNotifAnniversary((v) => !v)}
              aria-label="Toggle anniversary alerts"
            >
              <span />
            </button>
          </div>

          <div className="as-toggle-row">
            <div>
              <div className="as-t-title">Shared Notes</div>
              <div className="as-t-sub">When your partner writes</div>
            </div>
            <button
              type="button"
              className={`as-toggle ${notifNotes ? "is-on" : ""}`}
              onClick={() => setNotifNotes((v) => !v)}
              aria-label="Toggle shared notes"
            >
              <span />
            </button>
          </div>

          <div className="as-toggle-row">
            <div>
              <div className="as-t-title">Monthly Recap</div>
              <div className="as-t-sub">Email summary of memories</div>
            </div>
            <button
              type="button"
              className={`as-toggle ${notifRecap ? "is-on" : ""}`}
              onClick={() => setNotifRecap((v) => !v)}
              aria-label="Toggle monthly recap"
            >
              <span />
            </button>
          </div>
        </section>

        {/* Language */}
        <section className="as-card as-card--lang">
          <div className="as-card-title">
            <span className="as-ic as-ic-globe" aria-hidden="true">
              <AppIcon name="globe" size={16} />
            </span>
            <span>Language</span>
          </div>

          <div className="as-lang">
            {LOCALES.map((loc) => (
              <button
                key={loc.id}
                type="button"
                className={locale === loc.id ? "is-on" : ""}
                onClick={() => applyLocale(loc.id)}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </section>

        {/* Privacy & Data */}
        <section className="as-card as-card--privacy">
          <div className="as-card-title">
            <span className="as-ic as-ic-shield" aria-hidden="true">
              <AppIcon name="shield" size={16} />
            </span>
            <span>Privacy & Data</span>
          </div>

          <div className="as-privacy-row">
            <button type="button" className="as-btn as-btn-ghost">
              <AppIcon name="download" size={16} /> Export Memories
            </button>
            <button type="button" className="as-btn as-btn-danger">
              <AppIcon name="trash" size={16} /> Delete Account
            </button>
          </div>
        </section>
      </div>

      <footer className="as-footer">
        <button type="button" className="as-discard">
          Discard changes
        </button>
        <button
          type="button"
          className="as-save"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await new Promise((r) => setTimeout(r, 350));
              showSaved();
            })
          }
          style={{
            boxShadow: "0 14px 40px rgba(219, 39, 119, 0.28)",
            background: saved ? "#16a34a" : undefined,
          }}
        >
          {saved ? "Saved" : "Save Changes"}
        </button>
      </footer>

      <style>{settingsStyles(accent)}</style>
    </div>
  );
}

function settingsStyles(accent: string) {
  return `
  .amore-settings { display: flex; flex-direction: column; gap: 18px; }
  .amore-settings-head h1 {
    margin: 0;
    font-size: 42px;
    line-height: 1;
    letter-spacing: -0.03em;
    color: #111827;
    font-weight: 900;
  }
  .amore-settings-head p {
    margin: 8px 0 0;
    font-size: 14px;
    color: rgba(107,114,128,0.85);
  }

  .amore-settings-grid{
    display: grid;
    grid-template-columns: 1.45fr 1fr;
    gap: 18px;
    align-items: start;
  }

  .as-card{
    background: rgba(255,255,255,0.8);
    border: 1px solid rgba(148,163,184,0.22);
    border-radius: 22px;
    padding: 18px 18px;
    box-shadow: 0 24px 60px rgba(15,23,42,0.06);
    backdrop-filter: blur(10px);
  }
  .as-card-title{
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-weight: 900;
    color: #1f2937;
    margin-bottom: 14px;
  }
  .as-ic{
    width: 28px;
    height: 28px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(219,39,119,0.10);
    color: #b0005f;
  }
  .as-ic-palette{ background: rgba(59,130,246,0.10); color: #2563eb; }
  .as-ic-bell{ background: rgba(219,39,119,0.08); color: #b0005f; }
  .as-ic-globe{ background: rgba(59,130,246,0.08); color: #2563eb; }
  .as-ic-shield{ background: rgba(219,39,119,0.08); color: #b0005f; }

  .as-card--profile{ padding: 18px 18px 16px; }
  .as-profile-row{
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 16px;
    align-items: center;
  }
  .as-avatars{ position: relative; height: 92px; }
  .as-av{
    width: 74px;
    height: 74px;
    border-radius: 999px;
    background: #0b1220;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    overflow: hidden;
    box-shadow: 0 14px 30px rgba(15,23,42,0.18);
  }
  .as-av img{ width:100%; height:100%; object-fit:cover; }
  .as-av-2{
    position: absolute;
    left: 44px;
    top: 26px;
    border: 3px solid rgba(255,255,255,0.9);
  }
  .as-edit{
    position: absolute;
    left: 70px;
    top: 62px;
    width: 26px;
    height: 26px;
    border-radius: 999px;
    background: linear-gradient(90deg, ${accent} 0%, #db2777 55%, #ef5da8 100%);
    color: #fff;
    display:flex;
    align-items:center;
    justify-content:center;
    box-shadow: 0 14px 30px rgba(219,39,119,0.22);
  }
  .as-fields{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 12px;
  }
  .as-field{
    background: rgba(241,245,255,0.75);
    border: 1px solid rgba(148,163,184,0.18);
    border-radius: 14px;
    padding: 10px 12px;
  }
  .as-field-wide{ grid-column: 1 / -1; }
  .as-k{
    font-size: 10px;
    letter-spacing: 0.14em;
    font-weight: 900;
    color: rgba(107,114,128,0.75);
    margin-bottom: 6px;
  }
  .as-v{
    font-weight: 800;
    color: #111827;
    font-size: 13px;
  }
  .as-v-date{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 10px;
  }
  .as-date-ic{ color: rgba(107,114,128,0.85); display:inline-flex; }

  .as-sub-k{
    font-size: 10px;
    letter-spacing: 0.14em;
    font-weight: 900;
    color: rgba(107,114,128,0.75);
    margin-bottom: 8px;
  }
  .as-mode{
    display:flex;
    background: rgba(241,245,255,0.75);
    border: 1px solid rgba(148,163,184,0.18);
    border-radius: 999px;
    padding: 4px;
    gap: 4px;
  }
  .as-mode button{
    flex: 1;
    border: none;
    border-radius: 999px;
    background: transparent;
    padding: 8px 10px;
    font-weight: 800;
    font-size: 12px;
    color: rgba(51,65,85,0.8);
    display:flex;
    align-items:center;
    justify-content:center;
    gap: 8px;
    cursor:pointer;
  }
  .as-mode button.is-on{
    background: rgba(255,255,255,0.9);
    box-shadow: 0 10px 26px rgba(15,23,42,0.08);
    color: #111827;
  }
  .as-palette{ display:flex; gap: 12px; }
  .as-palette button{
    width: 32px;
    height: 32px;
    border-radius: 999px;
    border: 2px solid rgba(255,255,255,0.95);
    background: transparent;
    cursor: pointer;
    box-shadow: 0 14px 30px rgba(15,23,42,0.10);
    padding: 0;
  }
  .as-palette button span{
    display:block;
    width: 100%;
    height: 100%;
    border-radius: 999px;
  }
  .as-palette button.is-on{
    outline: 3px solid rgba(17,24,39,0.10);
  }

  .as-toggle-row{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 12px;
    padding: 10px 0;
  }
  .as-t-title{ font-weight: 900; font-size: 13px; color:#111827; }
  .as-t-sub{ font-size: 12px; color: rgba(107,114,128,0.78); margin-top: 2px; }
  .as-toggle{
    width: 48px;
    height: 28px;
    border-radius: 999px;
    border: 1px solid rgba(148,163,184,0.22);
    background: rgba(241,245,255,0.8);
    position: relative;
    cursor: pointer;
    padding: 0;
  }
  .as-toggle span{
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 4px;
    width: 20px;
    height: 20px;
    border-radius: 999px;
    background: #fff;
    box-shadow: 0 8px 18px rgba(15,23,42,0.14);
    transition: left .18s ease;
  }
  .as-toggle.is-on{
    background: linear-gradient(90deg, ${accent} 0%, #db2777 55%, #ef5da8 100%);
    border-color: rgba(219,39,119,0.22);
  }
  .as-toggle.is-on span{ left: 24px; }

  .as-lang{
    display:flex;
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 2px;
  }
  .as-lang button{
    border: 1px solid rgba(148,163,184,0.22);
    background: rgba(241,245,255,0.75);
    border-radius: 999px;
    padding: 10px 14px;
    font-weight: 900;
    font-size: 12px;
    color: rgba(51,65,85,0.78);
    cursor:pointer;
  }
  .as-lang button.is-on{
    background: rgba(255,255,255,0.95);
    color: ${accent};
    border-color: rgba(219,39,119,0.20);
    box-shadow: 0 12px 28px rgba(15,23,42,0.06);
  }

  .as-privacy-row{
    display:flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .as-btn{
    border: 1px solid rgba(148,163,184,0.22);
    background: rgba(241,245,255,0.75);
    border-radius: 16px;
    padding: 12px 14px;
    font-weight: 900;
    font-size: 12px;
    cursor:pointer;
    display:inline-flex;
    align-items:center;
    gap: 10px;
    color: #111827;
  }
  .as-btn-danger{
    background: rgba(255, 255, 255, 0.7);
    color: #b91c1c;
  }

  .as-footer{
    display:flex;
    align-items:center;
    justify-content:flex-end;
    gap: 14px;
    margin-top: 6px;
  }
  .as-discard{
    border:none;
    background: transparent;
    color: rgba(107,114,128,0.9);
    font-weight: 800;
    cursor:pointer;
  }
  .as-save{
    border:none;
    border-radius: 999px;
    height: 46px;
    padding: 0 18px;
    font-weight: 900;
    color: #fff;
    background: linear-gradient(90deg, ${accent} 0%, #db2777 55%, #ef5da8 100%);
    cursor:pointer;
  }

  .as-card--notif { grid-column: 1 / 2; }
  .as-card--lang { grid-column: 2 / 3; background: rgba(226, 240, 255, 0.75); }
  .as-card--privacy { grid-column: 2 / 3; background: rgba(226, 240, 255, 0.75); }
  .as-card--profile { background: rgba(255,255,255,0.78); }
  .as-card--theme { background: rgba(226, 240, 255, 0.75); }

  @media (max-width: 980px){
    .amore-settings-grid{ grid-template-columns: 1fr; }
    .as-card--notif, .as-card--lang, .as-card--privacy { grid-column: auto; }
    .as-profile-row{ grid-template-columns: 1fr; }
  }
  `;
}

