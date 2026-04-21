'use client';

export function MeshBackground({ visible = true }: { visible?: boolean }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
      }}
    >
      {/* Radial gradient layer */}
      <div
        style={{
          position: 'absolute', inset: '-20%',
          background: `
            radial-gradient(circle at 18% 28%, rgba(180,242,78,0.10), transparent 35%),
            radial-gradient(circle at 82% 18%, rgba(120,110,255,0.08), transparent 40%),
            radial-gradient(circle at 65% 82%, rgba(255,120,180,0.05), transparent 45%),
            radial-gradient(circle at 20% 85%, rgba(80,200,255,0.05), transparent 40%)
          `,
          filter: 'blur(40px)',
          animation: 'mesh-drift 24s ease-in-out infinite alternate',
        }}
      />
      {/* Noise overlay */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>")`,
          opacity: 0.035,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}
