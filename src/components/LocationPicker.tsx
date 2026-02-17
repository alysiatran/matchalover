import { useState, useRef, useEffect } from "react";
import { MapPin, Check, X } from "lucide-react";

interface LocationPickerProps {
  location: string;
  onLocationChange: (location: string) => void;
  variant?: "hero" | "inline";
}

const LocationPicker = ({ location, onLocationChange, variant = "hero" }: LocationPickerProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(location);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const handleConfirm = () => {
    if (draft.trim()) {
      onLocationChange(draft.trim());
    } else {
      setDraft(location);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(location);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-primary-foreground/80 shrink-0" />
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm();
            if (e.key === "Escape") handleCancel();
          }}
          className={`bg-foreground/20 backdrop-blur-sm rounded-lg px-2 py-0.5 text-sm font-body border border-primary-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary-foreground/50 ${
            variant === "hero" ? "text-primary-foreground" : "text-foreground"
          }`}
          placeholder="City or zip code..."
        />
        <button onClick={handleConfirm} className="p-0.5 rounded-full hover:bg-foreground/20 transition-colors">
          <Check className="w-3.5 h-3.5 text-primary-foreground" />
        </button>
        <button onClick={handleCancel} className="p-0.5 rounded-full hover:bg-foreground/20 transition-colors">
          <X className="w-3.5 h-3.5 text-primary-foreground/70" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1 group cursor-pointer"
    >
      <MapPin className={`w-3.5 h-3.5 ${variant === "hero" ? "text-primary-foreground/80" : "text-muted-foreground"}`} />
      <span className={`text-sm font-body underline decoration-dotted underline-offset-2 group-hover:decoration-solid transition-all ${
        variant === "hero" ? "text-primary-foreground/80" : "text-muted-foreground"
      }`}>
        {location}
      </span>
    </button>
  );
};

export default LocationPicker;
