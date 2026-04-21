'use client';

import { useRef, useEffect, useState } from 'react';

export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const ringPosRef = useRef({ x: -100, y: -100 });
  const trailPosRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef(0);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (hidden) setHidden(false);
    };
    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    const onOver = (e: MouseEvent) => {
      const ring = ringRef.current;
      if (!ring) return;
      const t = e.target as Element;
      ring.className = 'cursor-ring';
      if (t.closest('button, a, [role="button"], .chip, .nav-btn, .swatch-btn')) {
        ring.style.width = '56px';
        ring.style.height = '56px';
        ring.style.background = 'rgba(180,242,78,0.12)';
        ring.style.borderColor = 'rgba(180,242,78,0.6)';
      } else if (t.closest('input, textarea, [contenteditable]')) {
        ring.style.width = '3px';
        ring.style.height = '28px';
        ring.style.borderRadius = '2px';
        ring.style.background = 'var(--accent)';
        ring.style.borderColor = 'transparent';
      } else {
        ring.style.width = '28px';
        ring.style.height = '28px';
        ring.style.borderRadius = '999px';
        ring.style.background = 'transparent';
        ring.style.borderColor = 'var(--accent)';
      }
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    window.addEventListener('mouseover', onOver);

    const loop = () => {
      ringPosRef.current.x += (posRef.current.x - ringPosRef.current.x) * 0.22;
      ringPosRef.current.y += (posRef.current.y - ringPosRef.current.y) * 0.22;
      trailPosRef.current.x += (posRef.current.x - trailPosRef.current.x) * 0.08;
      trailPosRef.current.y += (posRef.current.y - trailPosRef.current.y) * 0.08;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPosRef.current.x}px, ${ringPosRef.current.y}px) translate(-50%, -50%)`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${trailPosRef.current.x}px, ${trailPosRef.current.y}px) translate(-50%, -50%)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opacity = hidden ? 0 : 1;

  return (
    <>
      <div
        ref={trailRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 10, height: 10, borderRadius: 999,
          background: 'var(--accent)', opacity: opacity * 0.35,
          filter: 'blur(8px)',
          pointerEvents: 'none', zIndex: 9998,
          transition: 'opacity 0.2s',
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 28, height: 28, borderRadius: 999,
          border: '1.5px solid var(--accent)',
          opacity,
          pointerEvents: 'none', zIndex: 9999,
          mixBlendMode: 'difference',
          transition: 'width 0.25s var(--ease), height 0.25s var(--ease), border-radius 0.25s var(--ease), background 0.25s var(--ease), opacity 0.2s',
        }}
      />
      <div
        ref={dotRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 4, height: 4, borderRadius: 999,
          background: 'var(--accent)',
          boxShadow: '0 0 12px var(--accent-glow)',
          opacity,
          pointerEvents: 'none', zIndex: 9999,
          transition: 'opacity 0.2s',
        }}
      />
    </>
  );
}
