/* Ekspor ilustrasi benda menjadi PNG (assets/img/items) + koin (assets/img/coin.png).
 * Jalankan: node tools/export_items.cjs
 * Butuh Chromium Playwright (lihat README bagian uji).
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "assets/img/items");
const EXE = path.join(
  process.env.HOME,
  ".cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell"
);
const LD = "/tmp/libx/root/usr/lib/x86_64-linux-gnu";

(async () => {
  if (process.env.LD_LIBRARY_PATH !== LD) process.env.LD_LIBRARY_PATH = LD;
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: fs.existsSync(EXE) ? EXE : undefined,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"]
  });
  const page = await browser.newPage();
  await page.setContent("<!doctype html><html><body></body></html>");
  await page.addScriptTag({ path: path.join(ROOT, "js/fonts.js") });
  await page.addScriptTag({ path: path.join(ROOT, "js/data.js") });
  await page.addScriptTag({ path: path.join(ROOT, "js/art.js") });
  await page.evaluate(() => document.fonts.ready);

  const ids = await page.evaluate(() => Object.keys(JR.ITEMS));
  for (const id of ids) {
    const data = await page.evaluate((i) => JR.Art.icon(i), id);
    fs.writeFileSync(path.join(OUT, id + ".png"), Buffer.from(data.split(",")[1], "base64"));
  }
  const coin = await page.evaluate(() => JR.Art.coinCanvas(512).toDataURL("image/png"));
  fs.writeFileSync(path.join(ROOT, "assets/img/coin.png"), Buffer.from(coin.split(",")[1], "base64"));

  /* ikon aplikasi: ubin gradien + koin Rp */
  const icons = await page.evaluate(() => {
    function tile(size, coinScale, radius) {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const x = c.getContext("2d");
      const r = size * radius;
      function round() {
        x.beginPath();
        x.moveTo(r, 0);
        x.arcTo(size, 0, size, size, r);
        x.arcTo(size, size, 0, size, r);
        x.arcTo(0, size, 0, 0, r);
        x.arcTo(0, 0, size, 0, r);
        x.closePath();
      }
      round();
      const g = x.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, "#4FB8F5");
      g.addColorStop(0.5, "#3E7BFF");
      g.addColorStop(1, "#9A5BFF");
      x.fillStyle = g;
      x.fill();
      x.save(); round(); x.clip();
      x.fillStyle = "rgba(255,255,255,.10)";
      x.beginPath(); x.arc(size * 0.78, size * 0.2, size * 0.26, 0, Math.PI * 2); x.fill();
      x.restore();
      const coin = JR.Art.coinCanvas(512);
      const d = size * coinScale;
      x.save();
      x.shadowColor = "rgba(20,20,60,.45)";
      x.shadowBlur = size * 0.06;
      x.shadowOffsetY = size * 0.03;
      x.drawImage(coin, (size - d) / 2, (size - d) / 2, d, d);
      x.restore();
      return c.toDataURL("image/png");
    }
    return {
      i192: tile(192, 0.82, 0.22),
      i512: tile(512, 0.82, 0.22),
      maskable: tile(512, 0.62, 0.5),
      apple: tile(180, 0.84, 0.22),
      fav: tile(64, 0.9, 0.22)
    };
  });
  const iconDir = path.join(ROOT, "assets/icons");
  const write = (name, data) => fs.writeFileSync(path.join(iconDir, name), Buffer.from(data.split(",")[1], "base64"));
  write("icon-192.png", icons.i192);
  write("icon-512.png", icons.i512);
  write("icon-maskable-512.png", icons.maskable);
  write("apple-touch-icon-180.png", icons.apple);
  write("favicon.png", icons.fav);

  console.log("diekspor:", ids.length, "benda + coin.png + 5 ikon");
  await browser.close();
})().catch((e) => {
  console.error("GAGAL:", e.message.split("\n")[0]);
  process.exit(1);
});
