'use client';

const INTENTS = [
  { value: 'linkedin_post', label: 'LinkedIn Post' },
  { value: 'cold_email', label: 'Cold Email' },
  { value: 'resume_bullet', label: 'Resume Bullet' },
  { value: 'cover_letter', label: 'Cover Letter' },
  { value: 'portfolio_blurb', label: 'Portfolio Blurb' },
  { value: 'blog_post', label: 'Blog Post' },
  { value: 'tweet', label: 'Tweet' },
];

interface IntentChipsProps {
  selected: string;
  onSelect: (intent: string) => void;
}

export function IntentChips({ selected, onSelect }: IntentChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {INTENTS.map((i) => (
        <button
          key={i.value}
          onClick={() => onSelect(selected === i.value ? '' : i.value)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            selected === i.value
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
          }`}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}
