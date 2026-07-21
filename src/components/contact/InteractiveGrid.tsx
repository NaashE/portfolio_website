import { useEffect, useRef } from 'react';

interface Props {
  /** Draw the glowing blue sine wave flowing left→right over the grid */
  withSineWave?: boolean;
  /** Vertical position of the wave / button line, 0..1 of height (fallback) */
  waveCenter?: number;
  /** CSS selector of an element to vertically center the wave on (e.g. the button) */
  waveAlignSelector?: string;
  className?: string;
}

// Palette (ASIC sky130A layers)
const BLUE = '41, 97, 212'; // met1
const SKY = '166, 191, 230'; // met2

const CELL = 46; // grid spacing at rest (px)
const SIGMA = 150; // radius of cursor influence (px)
const STRENGTH = 30; // how far the grid expands near the cursor (px)

/**
 * Canvas background: a blue grid whose cells expand outward around the cursor
 * (and settle back when it leaves), optionally with a glowing sine wave flowing
 * left→right. Honors prefers-reduced-motion (static grid + still wave, no
 * cursor reaction). The canvas is pointer-events:none; the cursor is tracked on
 * window so the whole section reacts.
 */
export default function InteractiveGrid({
  withSineWave = false,
  waveCenter = 0.5,
  waveAlignSelector,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pointer = { x: -9999, y: -9999, active: 0, target: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.target =
        pointer.x >= 0 &&
        pointer.x <= width &&
        pointer.y >= 0 &&
        pointer.y <= height
          ? 1
          : 0;
    };
    const onLeave = () => {
      pointer.target = 0;
    };

    if (!reduce) {
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerdown', onMove, { passive: true });
      window.addEventListener('blur', onLeave);
      document.addEventListener('mouseleave', onLeave);
    }

    // cached displaced lattice for the current frame
    let cols = 0;
    let rows = 0;
    let xs: Float32Array = new Float32Array(0);
    let ys: Float32Array = new Float32Array(0);

    const computeLattice = (infl: number) => {
      cols = Math.ceil(width / CELL) + 3;
      rows = Math.ceil(height / CELL) + 3;
      const n = (cols + 1) * (rows + 1);
      if (xs.length !== n) {
        xs = new Float32Array(n);
        ys = new Float32Array(n);
      }
      const baseX = -CELL;
      const baseY = -CELL;
      const twoSigma2 = 2 * SIGMA * SIGMA;
      let k = 0;
      for (let j = 0; j <= rows; j++) {
        for (let i = 0; i <= cols; i++) {
          const gx = baseX + i * CELL;
          const gy = baseY + j * CELL;
          if (infl > 0.001) {
            const dx = gx - pointer.x;
            const dy = gy - pointer.y;
            const d2 = dx * dx + dy * dy;
            const f = Math.exp(-d2 / twoSigma2);
            const push = STRENGTH * f * infl;
            const d = Math.sqrt(d2) || 1;
            xs[k] = gx + (dx / d) * push;
            ys[k] = gy + (dy / d) * push;
          } else {
            xs[k] = gx;
            ys[k] = gy;
          }
          k++;
        }
      }
    };

    const strokeGrid = (style: string | CanvasGradient, lineWidth: number) => {
      ctx.strokeStyle = style;
      ctx.lineWidth = lineWidth;
      // horizontal lines
      for (let j = 0; j <= rows; j++) {
        ctx.beginPath();
        for (let i = 0; i <= cols; i++) {
          const k = j * (cols + 1) + i;
          if (i === 0) ctx.moveTo(xs[k], ys[k]);
          else ctx.lineTo(xs[k], ys[k]);
        }
        ctx.stroke();
      }
      // vertical lines
      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        for (let j = 0; j <= rows; j++) {
          const k = j * (cols + 1) + i;
          if (j === 0) ctx.moveTo(xs[k], ys[k]);
          else ctx.lineTo(xs[k], ys[k]);
        }
        ctx.stroke();
      }
    };

    const drawWave = (time: number) => {
      // Center the wave on the target element (the button) when provided,
      // so it always sits on the button regardless of layout/wrapping.
      let cy = height * waveCenter;
      if (waveAlignSelector) {
        const el = document.querySelector(waveAlignSelector);
        if (el) {
          const cr = canvas.getBoundingClientRect();
          const er = el.getBoundingClientRect();
          cy = er.top + er.height / 2 - cr.top;
        }
      }
      // Keep the amplitude small so the wave's peak stays within the button
      const amp = Math.min(height * 0.05, 24);
      const wavelength = Math.max(260, width / 2.4);
      const k = (Math.PI * 2) / wavelength;
      const phase = reduce ? 0 : -time * 1.6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const tracePath = () => {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 4) {
          const y = cy + amp * Math.sin(k * x + phase);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      };

      ctx.save();
      // 1. wide soft halo
      ctx.shadowColor = `rgba(${BLUE}, 1)`;
      ctx.shadowBlur = 55;
      ctx.strokeStyle = `rgba(${BLUE}, 0.85)`;
      ctx.lineWidth = 6;
      tracePath();
      ctx.stroke();
      // 2. mid glow
      ctx.shadowBlur = 30;
      const grad = ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, `rgba(${BLUE}, 0.35)`);
      grad.addColorStop(0.5, `rgba(${SKY}, 1)`);
      grad.addColorStop(1, `rgba(${BLUE}, 0.55)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3.2;
      tracePath();
      ctx.stroke();
      // 3. bright white-hot core
      ctx.shadowColor = `rgba(${SKY}, 1)`;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 1.5;
      tracePath();
      ctx.stroke();
      ctx.restore();
    };

    let raf = 0;
    let startTs = 0;

    const render = (now: number) => {
      if (!startTs) startTs = now;
      const time = (now - startTs) / 1000;
      pointer.active += (pointer.target - pointer.active) * 0.08;

      ctx.clearRect(0, 0, width, height);
      computeLattice(reduce ? 0 : pointer.active);

      // base grid (faint, everywhere)
      strokeGrid(`rgba(${SKY}, 0.1)`, 1);

      // cursor glow: re-stroke with a radial gradient centered on the pointer
      if (!reduce && pointer.active > 0.02) {
        const r = SIGMA * 2.2;
        const glow = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          r,
        );
        glow.addColorStop(0, `rgba(${BLUE}, ${0.6 * pointer.active})`);
        glow.addColorStop(0.5, `rgba(${SKY}, ${0.22 * pointer.active})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        strokeGrid(glow, 1.4);
      }

      if (withSineWave) drawWave(time);

      raf = requestAnimationFrame(render);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        startTs = 0;
        raf = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
      window.removeEventListener('blur', onLeave);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [withSineWave, waveCenter, waveAlignSelector]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
