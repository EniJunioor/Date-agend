"use client";

export function LoginShowcasePanel() {
  return (
    <div className="login-panel">
      {/* bg hearts */}
      <div className="lp-heart lp-heart-1" aria-hidden="true">♥</div>
      <div className="lp-heart lp-heart-2" aria-hidden="true">♥</div>

      {/* Floating card — countdown */}
      <div className="lp-float lp-float-countdown">
        <div className="lp-float-kicker">🎉 COUNTDOWN</div>
        <div className="lp-float-name">Next Anniversary</div>
        <div className="lp-float-big"><span>15</span> <span className="lp-float-unit">Days left</span></div>
      </div>

      {/* Floating card — calendar */}
      <div className="lp-float lp-float-calendar">
        <div className="lp-float-month">February <span>📅</span></div>
        <div className="lp-float-sep" />
        <div className="lp-float-event">
          <span className="lp-float-event-ic">🎬</span>
          <span>Dinner Date @ 7PM</span>
        </div>
      </div>

      {/* Couple photo */}
      <div className="lp-photo-wrap">
        <div className="lp-photo-card">
          <div className="lp-photo-img" />
          <div className="lp-photo-label">Summer in Paris, 2023</div>
        </div>
      </div>

      {/* Floating card — moments */}
      <div className="lp-float lp-float-moments">
        <div className="lp-float-kicker">MOMENTS SHARED</div>
        <div className="lp-float-big2">142</div>
        <div className="lp-float-stars">⭐⭐⭐</div>
      </div>

      {/* Bottom text */}
      <div className="lp-bottom">
        <h3 className="lp-bottom-title">The most beautiful way to<br />preserve your story.</h3>
        <p className="lp-bottom-sub">
          Join thousands of couples using Amore Moderno to<br />
          turn daily plans into lifelong memories.
        </p>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
.login-panel {
  position: relative;
  width: min(520px, 100%);
  min-height: 620px;
  background: linear-gradient(145deg, #b0005f 0%, #db2777 45%, #c2185b 100%);
  border-radius: 32px;
  overflow: hidden;
  padding: 44px 36px 40px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  box-shadow: 0 32px 80px rgba(176, 0, 95, 0.32);
}

.lp-heart {
  position: absolute;
  color: rgba(255,255,255,0.12);
  font-size: 80px;
  pointer-events: none;
  user-select: none;
}
.lp-heart-1 { top: 32px; right: 40px; font-size: 64px; }
.lp-heart-2 { bottom: 160px; right: 22px; font-size: 48px; color: rgba(255,255,255,0.08); }

/* Floating cards */
.lp-float {
  position: absolute;
  background: rgba(255,255,255,0.96);
  border-radius: 18px;
  box-shadow: 0 12px 36px rgba(0,0,0,0.14);
  padding: 14px 18px;
}

.lp-float-countdown {
  top: 36px;
  left: 36px;
  min-width: 180px;
}
.lp-float-kicker {
  font-size: 10px;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: #9aa3b2;
  margin-bottom: 2px;
}
.lp-float-name {
  font-size: 13px;
  font-weight: 700;
  color: #1f2430;
  margin-bottom: 4px;
}
.lp-float-big {
  font-size: 28px;
  font-weight: 900;
  color: #b0005f;
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.lp-float-unit {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

.lp-float-calendar {
  top: 160px;
  right: 28px;
  min-width: 200px;
}
.lp-float-month {
  font-size: 14px;
  font-weight: 700;
  color: #1f2430;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.lp-float-sep {
  height: 2px;
  background: #b0005f;
  border-radius: 2px;
  width: 28px;
  margin-bottom: 10px;
}
.lp-float-event {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #1f2430;
  background: rgba(176, 0, 95, 0.08);
  padding: 8px 10px;
  border-radius: 10px;
}
.lp-float-event-ic { font-size: 15px; }

/* Couple photo */
.lp-photo-wrap {
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-40%);
}
.lp-photo-card {
  width: 160px;
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 14px 40px rgba(0,0,0,0.18);
  transform: rotate(-3deg);
}
.lp-photo-img {
  width: 100%;
  height: 170px;
  background: linear-gradient(135deg, #ffd6e8 0%, #c8e6f5 50%, #ffeaa7 100%);
}
.lp-photo-label {
  padding: 8px 12px;
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
}

.lp-float-moments {
  right: 28px;
  top: 55%;
  min-width: 140px;
  text-align: center;
}
.lp-float-big2 {
  font-size: 36px;
  font-weight: 900;
  color: #b0005f;
  line-height: 1;
  margin: 4px 0;
}
.lp-float-stars {
  font-size: 12px;
}

/* Bottom */
.lp-bottom {
  position: relative;
  z-index: 2;
  color: white;
}
.lp-bottom-title {
  font-size: 22px;
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin: 0 0 8px;
}
.lp-bottom-sub {
  font-size: 13px;
  opacity: 0.78;
  line-height: 1.55;
  margin: 0;
}
`;
