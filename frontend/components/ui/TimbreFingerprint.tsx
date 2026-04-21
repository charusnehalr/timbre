'use client';

import { useRef, useEffect } from 'react';

interface Props {
  size?: number;
  score?: number;
  intensity?: number;
  accentHex?: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

export function TimbreFingerprint({
  size = 200,
  score = 0.92,
  intensity = 1,
  accentHex = '#B4F24E',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const [ar, ag, ab] = hexToRgb(accentHex);
    const N = 96;

    const seeds = Array.from({ length: N }, (_, i) => {
      const base =
        Math.sin(i * 0.37) * 0.5 +
        Math.cos(i * 0.19) * 0.3 +
        Math.sin(i * 0.07) * 0.4;
      return 0.5 + base * 0.25;
    });

    const render = () => {
      tRef.current += 0.015 * intensity;
      const t = tRef.current;

      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const baseR = size * 0.28;

      // Outer glow
      const grad = ctx.createRadialGradient(cx, cy, baseR * 0.3, cx, cy, baseR * 1.6);
      grad.addColorStop(0, `rgba(${ar},${ag},${ab},${0.18 * score})`);
      grad.addColorStop(1, `rgba(${ar},${ag},${ab},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Concentric rings
      for (let r = 0; r < 3; r++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255,255,255,${0.04 + r * 0.02})`;
        ctx.lineWidth = 0.5;
        ctx.arc(cx, cy, baseR * (0.5 + r * 0.18), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Spokes
      for (let i = 0; i < N; i++) {
        const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
        const wave =
          Math.sin(t * 1.2 + i * 0.3) * 0.15 +
          Math.sin(t * 0.7 + i * 0.12) * 0.1;
        const len = seeds[i] * baseR * (0.6 + wave + score * 0.5);
        const x1 = cx + Math.cos(angle) * baseR * 0.55;
        const y1 = cy + Math.sin(angle) * baseR * 0.55;
        const x2 = cx + Math.cos(angle) * (baseR * 0.55 + len);
        const y2 = cy + Math.sin(angle) * (baseR * 0.55 + len);
        const alpha = 0.35 + seeds[i] * 0.5 * score;

        ctx.strokeStyle =
          i % 8 === 0
            ? `rgba(${ar},${ag},${ab},${alpha})`
            : `rgba(237,237,238,${alpha * 0.8})`;
        ctx.lineWidth = i % 8 === 0 ? 1.4 : 0.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Breathing core
      const breath = 1 + Math.sin(t * 1.5) * 0.08;
      ctx.fillStyle = `rgba(${ar},${ag},${ab},0.95)`;
      ctx.beginPath();
      ctx.arc(cx, cy, 3 * breath, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${ar},${ag},${ab},0.25)`;
      ctx.beginPath();
      ctx.arc(cx, cy, 10 * breath, 0, Math.PI * 2);
      ctx.fill();

      rafRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, score, intensity, accentHex]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, display: 'block' }}
    />
  );
}
