/* ========================================================================== 
   KeKe Run — UI modern, game-like, high-contrast, motion-rich
   ========================================================================== */

:root {
  --bg: #080f24;
  --bg-2: #121d3d;
  --panel: rgba(13, 22, 46, 0.88);
  --panel-strong: rgba(17, 26, 56, 0.96);
  --ink: #f4f8ff;
  --muted: #b7c9ec;
  --mint: #34d399;
  --mint-l: #8ef7d3;
  --sky: #5aa6ff;
  --purple: #b686ff;
  --coral: #ff7d6a;
  --gold: #ffd45b;
  --gold-l: #fff2b0;
  --danger: #ff5d73;
  --stroke: rgba(149, 177, 255, 0.22);
  --shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
  --radius-xl: 36px;
  --radius-lg: 26px;
  --radius-md: 18px;
  --radius-sm: 12px;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(109, 150, 255, 0.18), transparent 40%),
    linear-gradient(180deg, #0b1230 0%, var(--bg) 100%);
  color: var(--ink);
  font-family: "Nunito", "Segoe UI", sans-serif;
  font-weight: 700;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

body {
  position: relative;
  letter-spacing: 0.01em;
}

img, canvas, svg {
  display: block;
  max-width: 100%;
}

button {
  font: inherit;
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
}

#app {
  position: fixed;
  inset: 0;
  overflow: hidden;
}

.stage, .board {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

#topbar {
  position: absolute;
  top: 18px;
  left: 18px;
  right: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 5;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

#topbar.is-hidden {
  opacity: 0;
  transform: translateY(-12px);
  pointer-events: none;
}

.level-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: 1px solid var(--stroke);
  border-radius: 999px;
  background: rgba(13, 21, 39, 0.7);
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.25);
}

.lv-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(180deg, #7af1d9, var(--mint));
  box-shadow: 0 0 18px rgba(52, 211, 153, 0.9);
}

#level-name {
  font-weight: 800;
  letter-spacing: 0.04em;
}

.topbar-actions {
  display: flex;
  gap: 10px;
}

.icon-btn {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border: 1px solid var(--stroke);
  border-radius: 14px;
  background: rgba(11, 18, 36, 0.7);
  box-shadow: 0 12px 26px rgba(0,0,0,0.18);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.icon-btn:hover { transform: translateY(-1px); }

.icon-btn svg {
  width: 22px;
  height: 22px;
}

#countdown {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 10;
  pointer-events: none;
}

#countdown-num {
  font-size: clamp(72px, 18vw, 180px);
  font-weight: 900;
  line-height: 1;
  color: rgba(255,255,255,0.94);
  text-shadow: 0 16px 25px rgba(0,0,0,0.45);
  animation: pulseCount 0.8s ease;
}

@keyframes pulseCount {
  0% { opacity: 0; transform: scale(0.7); }
  35% { opacity: 1; transform: scale(1.08); }
  100% { opacity: 1; transform: scale(1); }
}

.toast {
  position: absolute;
  left: 50%;
  bottom: 34px;
  transform: translateX(-50%) translateY(20px);
  min-width: 220px;
  max-width: min(84vw, 560px);
  padding: 12px 18px;
  border-radius: 999px;
  text-align: center;
  background: rgba(10, 18, 36, 0.78);
  border: 1px solid rgba(146, 184, 255, 0.35);
  backdrop-filter: blur(10px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast.is-shown {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.screens {
  position: absolute;
  inset: 0;
  z-index: 6;
}

.screen {
  position: absolute;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  padding: clamp(18px, 4vh, 32px);
  background: rgba(8, 11, 22, 0.18);
  backdrop-filter: blur(3px);
}

.screen.is-on {
  display: flex;
}

.panel {
  position: relative;
  width: min(100%, 980px);
  border: 1px solid var(--stroke);
  border-radius: var(--radius-xl);
  background: linear-gradient(180deg, rgba(15, 25, 54, 0.96), rgba(12, 19, 35, 0.92));
  box-shadow: var(--shadow);
  overflow: hidden;
}

.panel-wide {
  width: min(100%, 980px);
  padding: clamp(18px, 3vw, 28px);
}

.panel-head,
.panel-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-head h2,
.label,
.learn-card h3 {
  font-family: "Fredoka", "Trebuchet MS", sans-serif;
}

.panel-head h2 {
  font-size: clamp(28px, 3vw, 40px);
  margin: 0;
}

.title-wrap {
  width: min(100%, 780px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}

.logo-lockup {
  position: relative;
  display: grid;
  place-items: center;
  margin-top: 30px;
}

.coin3d {
  position: absolute;
  right: -30px;
  top: -24px;
  width: clamp(74px, 9vw, 120px);
  height: clamp(74px, 9vw, 120px);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(255,228,120,0.7) 24%, rgba(255,170,36,0.95) 45%, rgba(191,106,23,0.9) 100%);
  box-shadow: 0 28px 40px rgba(255,172,45,0.35), inset 0 0 18px rgba(255,255,255,0.9);
  animation: floatCoin 4s ease-in-out infinite;
}

.coin3d-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
}

.coin3d-shine {
  position: absolute;
  inset: 18% 20% auto auto;
  width: 26%;
  height: 26%;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  filter: blur(4px);
}

@keyframes floatCoin {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(4deg); }
}

.logo {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0;
  letter-spacing: 0.03em;
}

.logo-line {
  position: relative;
  display: inline-block;
  padding: 0.04em 0.22em;
  border-radius: 22px;
  font-family: "Fredoka", "Trebuchet MS", sans-serif;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.logo-keke {
  transform: rotate(-4deg);
  margin-right: 18px;
}

.logo-run {
  transform: rotate(4deg);
  margin-left: 18px;
}

.logo-word {
  display: inline-block;
  background: linear-gradient(180deg, #fffbea 0%, #f6d262 24%, #f7b43a 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 16px 25px rgba(255, 198, 75, 0.15);
}

.logo-keke .logo-word {
  color: #fff3d2;
}

.logo-run .logo-word {
  background: linear-gradient(180deg, #ffffff 0%, #d9eeff 18%, #7bcbff 32%, #47a1ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.tagline {
  font-size: clamp(20px, 2vw, 28px);
  color: var(--muted);
  font-weight: 800;
  letter-spacing: 0.04em;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(94, 145, 255, 0.12);
  border: 1px solid rgba(120, 170, 255, 0.4);
  color: #edf3ff;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
}

.meta-pill svg {
  width: 18px;
  height: 18px;
}

.title-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  margin-top: 8px;
}

.title-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 18px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
}

.btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.04);
}

.btn-primary {
  background: linear-gradient(135deg, #5cc9ff 0%, #4f7cff 30%, #7d5dff 100%);
  color: #fff;
  padding: 16px 26px;
  box-shadow: 0 18px 30px rgba(72, 96, 255, 0.35);
}

.btn-xl {
  min-width: min(420px, 90vw);
  font-size: clamp(18px, 2vw, 28px);
  padding: 18px 28px;
}

.btn-ghost {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.12);
  padding: 12px 16px;
  font-size: 0.7rem;
  min-width: 140px;
}

.btn-arrow {
  width: 20px;
  height: 20px;
}

.setup-grid,
.confirm-grid,
.learn-grid,
.score-list,
.goal-list,
.help-wrap {
  display: grid;
  gap: 18px;
}

.setup-grid {
  grid-template-columns: 1.2fr 0.8fr;
  margin-top: 20px;
}

.setup-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.label {
  font-size: 1rem;
  color: var(--muted);
  margin: 0;
}

.modes {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.mode-option,
.player-row,
.goal-item,
.step-box,
.learn-card,
.mini-score {
  position: relative;
  border-radius: var(--radius-md);
  border: 1px solid var(--stroke);
  background: rgba(255,255,255,0.03);
}

.mode-option {
  padding: 10px 16px;
  font-weight: 800;
  color: var(--ink);
}

.mode-option.is-active {
  background: linear-gradient(135deg, rgba(98, 161, 255, 0.18), rgba(180, 111, 255, 0.18));
  border-color: rgba(132, 180, 255, 0.5);
}

.preview-card {
  padding: 18px;
  border: 1px solid var(--stroke);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(12, 18, 34, 0.9), rgba(10, 15, 30, 0.85));
}

.preview {
  width: 100%;
  height: 220px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(90, 168, 255, 0.16), rgba(5, 10, 22, 0.82));
}

.preview-names {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
}

.preview-slot {
  display: inline-block;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
}

.preview-tip,
.confirm-lead,
.foot-note,
.learn-tip,
.controls-note,
.goal-item p {
  color: var(--muted);
  line-height: 1.6;
}

.learn-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 18px;
}

.learn-card {
  padding: 18px;
  min-height: 200px;
}

.learn-card h3 {
  margin: 14px 0 10px;
  font-size: clamp(22px, 2.2vw, 28px);
}

.learn-card p {
  line-height: 1.7;
  color: var(--ink);
}

.learn-primary { background: linear-gradient(180deg, rgba(64, 145, 255, 0.16), rgba(13, 20, 42, 0.5)); }
.learn-secondary { background: linear-gradient(180deg, rgba(122, 110, 255, 0.16), rgba(13, 20, 42, 0.5)); }
.learn-tertiary { background: linear-gradient(180deg, rgba(255, 140, 92, 0.16), rgba(13, 20, 42, 0.5)); }

.chip {
  display: inline-flex;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  padding: 7px 12px;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.learn-tip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--stroke);
}

.goal-list,
.help-wrap {
  margin-top: 18px;
}

.goal-item,
.step-box {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
}

.goal-badge,
.step-num {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #5cc9ff, #7a5fff);
  color: white;
  font-weight: 800;
}

.controls-note {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 18px;
  padding: 14px 16px;
  border: 1px solid var(--stroke);
  border-radius: 18px;
  background: rgba(255,255,255,0.03);
}

.controls-note strong {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 7px 10px;
  text-transform: uppercase;
}

.score-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 18px;
}

.mini-score {
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.mini-score span {
  color: var(--muted);
}

.mini-score strong {
  font-size: clamp(28px, 4vw, 42px);
}

.result-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 20;
  background: rgba(5, 8, 18, 0.32);
  backdrop-filter: blur(10px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
}

.result-overlay.is-visible {
  opacity: 1;
  pointer-events: auto;
}

.result-overlay.is-hidden {
  display: none;
}

.result-card {
  width: min(84vw, 420px);
  padding: clamp(24px, 4vw, 40px) 28px;
  border: 1px solid rgba(185, 203, 255, 0.28);
  border-radius: 28px;
  background: rgba(10, 14, 28, 0.8);
  box-shadow: 0 30px 80px rgba(0,0,0,0.42);
  text-align: center;
  transform: translateY(10px) scale(0.96);
  transition: transform 0.25s ease;
}

.result-overlay.is-visible .result-card {
  transform: translateY(0) scale(1);
}

.result-tag {
  display: inline-flex;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #dfeaff;
  background: rgba(90, 130, 255, 0.12);
  border: 1px solid rgba(122, 160, 255, 0.36);
}

.result-card h2 {
  margin: 18px 0 10px;
  font-size: clamp(30px, 5vw, 42px);
}

.result-score-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  margin-top: 18px;
}

.result-score-wrap span {
  color: var(--muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.78rem;
}

#result-score-value {
  font-size: clamp(54px, 11vw, 120px);
  line-height: 1;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 12px 30px rgba(255, 214, 108, 0.42);
}

@media (max-width: 720px) {
  .setup-grid,
  .learn-grid,
  .score-list {
    grid-template-columns: 1fr;
  }

  .title-row {
    width: 100%;
  }

  .btn-ghost {
    width: 100%;
  }

  .meta-pill {
    font-size: 0.8rem;
  }
}
