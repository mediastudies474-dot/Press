import { AVAILABLE_TOPICS } from '@/hooks/useUserTopics';
import { Filter } from 'lucide-react';

interface TopicFilterBarProps {
  active: string | null;
  onChange: (topic: string | null) => void;
}

const TopicFilterBar = ({ active, onChange }: TopicFilterBarProps) => {
  return (
    <div className="mt-4">
      <div className="px-4 flex items-center gap-1.5 mb-2">
        <Filter size={12} className="text-muted-foreground" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Filter by topic</span>
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => onChange(null)}
          className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-all active:scale-95 flex-shrink-0 ${
            active === null
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border'
          }`}
        >
          All
        </button>
        {AVAILABLE_TOPICS.map(t => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(isActive ? null : t.id)}
              className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-all active:scale-95 flex-shrink-0 ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border'
              }`}
            >
              {t.emoji} {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TopicFilterBar;
