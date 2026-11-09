import { useUserTopics, AVAILABLE_TOPICS } from '@/hooks/useUserTopics';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const TopicSelector = () => {
  const { selectedTopics, toggleTopic } = useUserTopics();
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-4 mt-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between text-sm font-bold text-foreground mb-2"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Sparkles size={14} className="text-primary" />
          Your Interests
          {selectedTopics.length > 0 && (
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {selectedTopics.length}
            </span>
          )}
        </span>
        {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>

      {open && (
        <>
          <p className="text-[10px] text-muted-foreground mb-2">Select topics to personalize your feed</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TOPICS.map(topic => {
              const isActive = selectedTopics.includes(topic.id);
              return (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {topic.emoji} {topic.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default TopicSelector;
