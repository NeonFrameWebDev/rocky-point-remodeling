'use strict';

/* ── RPR Coupon Canvas Export ─────────────────────────────────────
   Draws each coupon as a designed 1200x630 graphic directly on an
   HTML5 canvas, then downloads as PNG. No html2canvas dependency.
───────────────────────────────────────────────────────────────── */

const CLR = {
  ORANGE:  '#D4752A',
  DARK:    '#0A0A0A',
  FOOTER:  '#111111',
  WHITE:   '#FFFFFF',
  GRAY_LT: '#C8C8C8',
  GRAY:    '#7A7A7A',
  RULE:    '#222222',
};

const CW = 1200, CH = 630, SCALE = 2;

/* Cross-browser rounded-rect path */
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

/* Word-wrap; returns line count */
function fillWrapped(ctx, text, x, y, maxW, lh) {
  const words = text.split(' ');
  let line = '';
  const lines = [];
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  return lines.length;
}

async function loadImage(src) {
  return new Promise(res => {
    const img = new Image();
    img.onload  = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
}

async function drawCouponCanvas(data) {
  /* Wait for Google Fonts before drawing */
  await Promise.allSettled([
    document.fonts.load('900 80px "Bebas Neue"'),
    document.fonts.load('700 20px "Bebas Neue"'),
    document.fonts.load('600 14px "Inter"'),
    document.fonts.load('400 16px "Inter"'),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width  = CW * SCALE;
  canvas.height = CH * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);

  /* ── Background ──────────────────────────────────────────────── */
  ctx.fillStyle = CLR.DARK;
  ctx.fillRect(0, 0, CW, CH);

  /* ── Dashed orange outer border ──────────────────────────────── */
  ctx.strokeStyle = CLR.ORANGE;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([14, 9]);
  rrect(ctx, 10, 10, CW - 20, CH - 20, 8);
  ctx.stroke();
  ctx.setLineDash([]);

  /* ── Layout constants ────────────────────────────────────────── */
  const PAD    = 26;
  const LWIDTH = 268;               // orange panel width
  const LX     = PAD;
  const LY     = PAD;
  const FH     = 60;                // footer strip height
  const LH     = CH - PAD * 2 - FH - 6;  // orange panel height
  const PERF_X = LX + LWIDTH;
  const RX     = PERF_X + 30;      // right content x
  const RW     = CW - RX - PAD - 4;
  const FOOT_Y = LY + LH + 6;

  /* ── Orange left panel ───────────────────────────────────────── */
  rrect(ctx, LX, LY, LWIDTH, LH, 6);
  ctx.fillStyle = CLR.ORANGE;
  ctx.fill();

  /* ── Subtle inner highlight on left panel ────────────────────── */
  const grad = ctx.createLinearGradient(LX, LY, LX + LWIDTH, LY);
  grad.addColorStop(0, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  rrect(ctx, LX, LY, LWIDTH, LH, 6);
  ctx.fillStyle = grad;
  ctx.fill();

  /* ── Perforated divider ──────────────────────────────────────── */
  ctx.fillStyle = CLR.DARK;
  for (let py = LY + 22; py <= LY + LH - 22; py += 26) {
    ctx.beginPath();
    ctx.arc(PERF_X, py, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ── Tag pill ────────────────────────────────────────────────── */
  const CX = LX + LWIDTH / 2;
  ctx.font = '700 11px "Inter", Arial, sans-serif';
  const tagTxt = data.tag.toUpperCase();
  const tagTW  = ctx.measureText(tagTxt).width + 22;
  const tagX   = CX - tagTW / 2;
  const tagY   = LY + 18;
  ctx.fillStyle = 'rgba(0,0,0,0.30)';
  rrect(ctx, tagX, tagY, tagTW, 22, 4);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.textAlign = 'center';
  ctx.fillText(tagTxt, CX, tagY + 15);

  /* ── Headline ────────────────────────────────────────────────── */
  const words = data.headline.split(' ');
  const fs    = words.some(w => w.length > 6) ? 64 : words.length > 2 ? 60 : 80;
  const lhH   = fs * 1.05;
  ctx.font      = `900 ${fs}px "Bebas Neue", "Arimo", Arial, sans-serif`;
  ctx.fillStyle = CLR.WHITE;
  ctx.textAlign = 'center';
  /* Center vertically below the tag pill */
  const availTop = tagY + 30;
  const availBot = LY + LH - 32;
  const mid      = (availTop + availBot) / 2;
  const startY   = mid - (words.length * lhH) / 2 + fs * 0.82;
  words.forEach((w, i) => ctx.fillText(w, CX, startY + i * lhH));

  /* ── "RPR" watermark at base of orange panel ─────────────────── */
  ctx.fillStyle = 'rgba(255,255,255,0.40)';
  ctx.font = '700 10px "Inter", Arial, sans-serif';
  ctx.fillText('RPR REMODELING', CX, LY + LH - 11);

  /* ── Right content ───────────────────────────────────────────── */
  ctx.textAlign = 'left';
  let ry = LY + 14;

  /* Title */
  const titleFS = data.title.length > 32 ? 20 : 24;
  ctx.font      = `900 ${titleFS}px "Bebas Neue", Arial, sans-serif`;
  ctx.fillStyle = CLR.WHITE;
  const titleLines = fillWrapped(ctx, data.title.toUpperCase(), RX, ry + titleFS * 0.82, RW, titleFS * 1.1);
  ry += titleLines * titleFS * 1.1 + 12;

  /* Orange accent rule */
  ctx.fillStyle = CLR.ORANGE;
  ctx.fillRect(RX, ry, 52, 3);
  ry += 16;

  /* Description */
  ctx.font      = '400 15px "Inter", Arial, sans-serif';
  ctx.fillStyle = CLR.GRAY_LT;
  const descLines = fillWrapped(ctx, data.desc, RX, ry, RW, 22);
  ry += descLines * 22 + 16;

  /* Separator */
  ctx.strokeStyle = CLR.RULE;
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(RX, ry);
  ctx.lineTo(RX + RW, ry);
  ctx.stroke();
  ry += 13;

  /* Terms */
  ctx.font      = '400 12px "Inter", Arial, sans-serif';
  ctx.fillStyle = CLR.GRAY;
  fillWrapped(ctx, data.terms + '  One coupon per job.', RX, ry, RW, 18);

  /* ── Footer strip ────────────────────────────────────────────── */
  ctx.fillStyle = CLR.FOOTER;
  ctx.fillRect(PAD, FOOT_Y, CW - PAD * 2, FH);

  /* Logo */
  const logo = await loadImage('assets/logo.webp');
  const LS   = 38;
  const LLX  = PAD + 14;
  const LLY  = FOOT_Y + (FH - LS) / 2;
  if (logo) ctx.drawImage(logo, LLX, LLY, LS, LS);

  /* Brand + contact */
  const BX = LLX + LS + 10;
  ctx.fillStyle = CLR.WHITE;
  ctx.font      = '700 13px "Bebas Neue", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('RPR REMODELING', BX, FOOT_Y + 22);

  ctx.fillStyle = CLR.GRAY;
  ctx.font      = '400 11px "Inter", Arial, sans-serif';
  ctx.fillText('(602) 312-0400  ·  rockypointremodeling1@gmail.com  ·  Puerto Penasco, Sonora, Mexico', BX, FOOT_Y + 38);

  /* "Mention at estimate" badge right side */
  ctx.textAlign   = 'right';
  ctx.fillStyle   = 'rgba(212,117,42,0.15)';
  const badgeW    = 168, badgeH = 28;
  const badgeX    = CW - PAD - 14 - badgeW;
  const badgeY    = FOOT_Y + (FH - badgeH) / 2;
  rrect(ctx, badgeX, badgeY, badgeW, badgeH, 4);
  ctx.fill();
  ctx.strokeStyle = CLR.ORANGE;
  ctx.lineWidth   = 1;
  rrect(ctx, badgeX, badgeY, badgeW, badgeH, 4);
  ctx.stroke();
  ctx.fillStyle = CLR.ORANGE;
  ctx.font      = '700 10px "Inter", Arial, sans-serif';
  ctx.fillText('MENTION AT ESTIMATE', CW - PAD - 14 - 10, FOOT_Y + FH / 2 + 4);

  return canvas;
}

/* ── Wire up Save buttons ────────────────────────────────────────── */
document.querySelectorAll('.coupon-save-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const card = btn.closest('.coupon-card');
    const getEn = el => (el?.dataset.en || el?.textContent || '')
      .trim().replace(/→|&rarr;/g, '').replace(/\s+/g, ' ').trim();

    const data = {
      headline: getEn(card.querySelector('.coupon-headline')),
      tag:      getEn(card.querySelector('.coupon-tag')),
      title:    getEn(card.querySelector('.coupon-title')),
      desc:     getEn(card.querySelector('.coupon-desc')),
      terms:    getEn(card.querySelector('.coupon-terms')),
    };

    const original = btn.innerHTML;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
      const cvs  = await drawCouponCanvas(data);
      const slug = data.headline.toLowerCase()
        .replace(/[\s/$%]+/g, '-').replace(/[^a-z0-9-]/g, '');
      const link = document.createElement('a');
      link.download = `rpr-coupon-${slug}.png`;
      link.href = cvs.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Coupon export failed:', err);
    }

    btn.innerHTML = original;
    btn.disabled  = false;
  });
});
