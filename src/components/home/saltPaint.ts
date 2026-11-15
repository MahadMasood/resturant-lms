// Procedural Himalayan-salt painters shared by the WebGL scenes and the CSS slabs.
// Everything is seeded so the slab looks identical on every load.

export function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  return [canvas, canvas.getContext("2d")!] as const;
}

function facet(ctx: CanvasRenderingContext2D, r: () => number, x: number, y: number, radius: number) {
  const sides = 4 + Math.floor(r() * 3);
  ctx.beginPath();
  for (let k = 0; k < sides; k++) {
    const a = (k / sides) * Math.PI * 2 + r() * 0.6;
    const d = radius * (0.6 + r() * 0.5);
    if (k === 0) ctx.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    else ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  ctx.closePath();
}

/** A long, gently wandering stroke across the whole canvas, roughly parallel to the strata. */
function sweep(ctx: CanvasRenderingContext2D, r: () => number, size: number, wander: number) {
  const angle = 0.45 + (r() - 0.5) * 0.5;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const off = (r() - 0.5) * size * 1.6;
  let x = size / 2 - dx * size - dy * off;
  let y = size / 2 - dy * size + dx * off;
  const steps = 8;
  const len = (size * 2) / steps;
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let s = 0; s < steps; s++) {
    const nx = x + dx * len + (r() - 0.5) * wander;
    const ny = y + dy * len + (r() - 0.5) * wander;
    ctx.quadraticCurveTo(x + (dx * len) / 2 + (r() - 0.5) * wander, y + (dy * len) / 2 + (r() - 0.5) * wander, nx, ny);
    x = nx;
    y = ny;
  }
  ctx.stroke();
}

/**
 * A jagged band of pale crystal crossing the canvas, the white "cloud" seams
 * that run through real Himalayan slabs.
 */
function crystalBand(ctx: CanvasRenderingContext2D, r: () => number, size: number, width: number) {
  const angle = 0.35 + (r() - 0.5) * 0.9;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const off = (r() - 0.5) * size * 1.2;
  const cx = size / 2 - dy * off;
  const cy = size / 2 + dx * off;
  const steps = 36;
  const upper: [number, number][] = [];
  const lower: [number, number][] = [];
  let drift = 0;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps - 0.5) * size * 2.2;
    drift += (r() - 0.5) * width * 0.35;
    const px = cx + dx * t - dy * drift;
    const py = cy + dy * t + dx * drift;
    // One edge stays fairly smooth, the other breaks into jagged crystal teeth.
    const top = width * (0.35 + r() * 0.25);
    const bottom = width * (0.25 + r() * 0.9) * (r() < 0.2 ? 1.6 : 1);
    upper.push([px - dy * top, py + dx * top]);
    lower.push([px + dy * bottom, py - dx * bottom]);
  }
  ctx.beginPath();
  upper.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  for (let i = lower.length - 1; i >= 0; i--) ctx.lineTo(lower[i][0], lower[i][1]);
  ctx.closePath();
  ctx.fill();
}

/** Pale peach-pink salt with salmon zones, jagged white crystal bands and fine grit, as in the real slabs. */
export function paintSalt(seed = 7, size = 1024) {
  const [canvas, ctx] = makeCanvas(size);
  const r = rng(seed);
  const k = size / 1024;

  ctx.fillStyle = "#f2cfc2";
  ctx.fillRect(0, 0, size, size);

  // Salmon-pink zones where the iron runs deep.
  for (let i = 0; i < 26; i++) {
    const x = r() * size;
    const y = r() * size;
    const rad = (120 + r() * 320) * k;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(228,${120 + Math.floor(r() * 30)},${95 + Math.floor(r() * 25)},${0.28 + r() * 0.2})`);
    g.addColorStop(1, "rgba(228,140,110,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  // Milky, almost-white crystal clouds.
  for (let i = 0; i < 18; i++) {
    const x = r() * size;
    const y = r() * size;
    const rad = (80 + r() * 200) * k;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(255,246,242,${0.25 + r() * 0.25})`);
    g.addColorStop(1, "rgba(255,246,242,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  // Jagged white crystal bands.
  for (let i = 0; i < 3; i++) {
    ctx.filter = `blur(${(1.5 + r() * 2) * k}px)`;
    ctx.fillStyle = `rgba(255,250,247,${0.5 + r() * 0.25})`;
    crystalBand(ctx, r, size, (40 + r() * 70) * k);
  }
  ctx.filter = "none";

  // Faint crystal facets.
  for (let i = 0; i < 220; i++) {
    facet(ctx, r, r() * size, r() * size, (8 + r() * 40) * k);
    ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${0.03 + r() * 0.05})` : `rgba(190,100,85,${0.02 + r() * 0.04})`;
    ctx.fill();
  }

  // Fine sugary grit across the whole surface.
  for (let i = 0; i < 70000 * k * k; i++) {
    const light = r() > 0.4;
    ctx.fillStyle = light ? `rgba(255,255,255,${0.15 + r() * 0.45})` : `rgba(196,112,96,${0.08 + r() * 0.18})`;
    const s = (0.6 + r() * 1.6) * k;
    ctx.fillRect(r() * size, r() * size, s, s);
  }
  return canvas;
}

/** Grey-scale relief: a gritty crystalline surface with the odd fissure. */
export function paintBump(seed = 11, size = 512) {
  const [canvas, ctx] = makeCanvas(size);
  const r = rng(seed);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 300; i++) {
    facet(ctx, r, r() * size, r() * size, 4 + r() * 18);
    const v = Math.floor(100 + r() * 60);
    ctx.fillStyle = `rgba(${v},${v},${v},0.5)`;
    ctx.fill();
  }
  for (let i = 0; i < 40000; i++) {
    const v = r() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${0.08 + r() * 0.22})`;
    ctx.fillRect(r() * size, r() * size, 1 + r(), 1 + r());
  }
  ctx.lineCap = "round";
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `rgba(40,40,40,${0.2 + r() * 0.3})`;
    ctx.lineWidth = 0.6 + r() * 1.2;
    sweep(ctx, r, size, 30);
  }
  return canvas;
}

/** Transparent frost: dense white specks and feathered ice crystals. */
export function paintFrost(seed = 5, size = 512) {
  const [canvas, ctx] = makeCanvas(size);
  const r = rng(seed);
  ctx.fillStyle = "rgba(232,244,255,0.38)";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${r() * 0.75})`;
    const s = r() * 1.8 + 0.3;
    ctx.fillRect(r() * size, r() * size, s, s);
  }
  ctx.lineCap = "round";
  for (let i = 0; i < 140; i++) {
    const x = r() * size;
    const y = r() * size;
    const len = 6 + r() * 22;
    ctx.strokeStyle = `rgba(255,255,255,${0.25 + r() * 0.4})`;
    ctx.lineWidth = 0.6 + r();
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + r() * 0.3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    }
  }
  return canvas;
}

/** Soft white radial falloff, tinted per use (heat bloom, sparks, embers). */
export function paintGlow(size = 256) {
  const [canvas, ctx] = makeCanvas(size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

let saltUrl: string | null = null;

/** Data URL of the salt texture, for CSS-rendered slabs. */
export function saltDataUrl() {
  if (!saltUrl) saltUrl = paintSalt(7, 512).toDataURL("image/jpeg", 0.85);
  return saltUrl;
}
