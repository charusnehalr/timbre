'use client';

const INTENTS = [
  { value: 'email',       label: 'email' },
  { value: 'letter',      label: 'recommendation' },
  { value: 'linkedin',    label: 'linkedin post' },
  { value: 'essay',       label: 'essay' },
  { value: 'reply',       label: 'reply' },
  { value: 'resume',      label: 'resume bullet' },
  { value: 'dm',          label: 'dm' },
];

interface IntentChipsProps {
  selected: string;
  onSelect: (intent: string) => void;
}

export function IntentChips({ selected, onSelect }: IntentChipsProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {INTENTS.map((i) => (
        <button
          key={i.value}
          onClick={() => onSelect(selected === i.value ? '' : i.value)}
          className={`chip${selected === i.value ? ' active' : ''}`}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}
