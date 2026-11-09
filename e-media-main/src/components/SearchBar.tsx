import { Search, X } from 'lucide-react';

interface SearchBarProps {
  visible: boolean;
  query: string;
  onChange: (q: string) => void;
  onClose: () => void;
}

const SearchBar = ({ visible, query, onChange, onClose }: SearchBarProps) => {
  if (!visible) return null;
  return (
    <div className="px-4 py-2 bg-primary">
      <div className="flex items-center bg-primary-foreground/10 rounded-lg px-3 py-2 gap-2">
        <Search size={16} className="text-primary-foreground/60" />
        <input
          autoFocus
          value={query}
          onChange={e => onChange(e.target.value)}
          placeholder="Search media..."
          className="flex-1 bg-transparent text-primary-foreground placeholder:text-primary-foreground/50 text-sm outline-none"
        />
        <button onClick={onClose}>
          <X size={16} className="text-primary-foreground/60" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
