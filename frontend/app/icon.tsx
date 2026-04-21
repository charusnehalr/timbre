import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: '#B4F24E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          fontSize: 14,
          fontWeight: 700,
          color: '#0B0B0B',
          letterSpacing: '-0.04em',
        }}
      >
        t.
      </div>
    ),
    { ...size },
  );
}
