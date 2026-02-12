interface CategoryChipsProps {
  categories: string[];
  active: string;
  onSelect: (cat: string) => void;
}

const CategoryChips = ({ categories, active, onSelect }: CategoryChipsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-body font-medium transition-all duration-200 ${
            active === cat
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryChips;
