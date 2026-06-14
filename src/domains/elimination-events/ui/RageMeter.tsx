import { FC } from 'react';

interface RageMeterProps {
  ragePercent: number;
  rageActive: boolean;
  fogActive: boolean;
  show: boolean;
}

/** Compact rage meter + fog indicator overlaid on the wheel's top-left corner. */
const RageMeter: FC<RageMeterProps> = ({ ragePercent, rageActive, fogActive, show }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        pointerEvents: 'none',
        minWidth: 150,
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.55)',
          borderRadius: 8,
          padding: '6px 10px',
          border: `1px solid ${rageActive ? '#ff3b3b' : 'rgba(255,90,90,0.5)'}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: 1,
            color: rageActive ? '#ff5b5b' : '#ff9a9a',
            marginBottom: 4,
          }}
        >
          <span>RAGE{rageActive ? ' !!!' : ''}</span>
          <span>{Math.round(ragePercent)}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, ragePercent)}%`,
              background: 'linear-gradient(90deg, #ff8a3b, #ff2d2d)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
      {fogActive && (
        <div
          style={{
            background: 'rgba(60,66,75,0.85)',
            borderRadius: 8,
            padding: '4px 10px',
            color: '#dfe4ea',
            fontWeight: 700,
            fontSize: 12,
            textAlign: 'center',
          }}
        >
          🌫 Туман
        </div>
      )}
    </div>
  );
};

export default RageMeter;
