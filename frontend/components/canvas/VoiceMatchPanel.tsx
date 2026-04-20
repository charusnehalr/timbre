'use client';

interface VoiceMatchPanelProps {
  score: number | null;
}

function getScoreColor(score: number) {
  if (score >= 0.9) return 'text-green-600';
  if (score >= 0.7) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreLabel(score: number) {
  if (score >= 0.9) return 'Indistinguishable';
  if (score >= 0.85) return 'Very close';
  if (score >= 0.7) return 'Close, AI-ish in spots';
  return 'Needs rewrite';
}

export function VoiceMatchPanel({ score }: VoiceMatchPanelProps) {
  return (
    <aside className="w-56 border rounded p-4 shrink-0 h-fit mt-14">
      <h2 className="font-semibold text-sm mb-3">Voice Match</h2>
      {score === null ? (
        <p className="text-sm text-gray-400">Generate a draft to see your score.</p>
      ) : (
        <div className="space-y-2">
          <p className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {Math.round(score * 100)}%
          </p>
          <p className={`text-sm ${getScoreColor(score)}`}>{getScoreLabel(score)}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                score >= 0.9
                  ? 'bg-green-500'
                  : score >= 0.7
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${Math.round(score * 100)}%` }}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
