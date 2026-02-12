import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search matcha cafes..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground font-body text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
      />
    </div>
  );
};

export default SearchBar;
