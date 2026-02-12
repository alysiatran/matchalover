import { Heart } from "lucide-react";

const Saved = () => {
  return (
    <div className="min-h-screen bg-background pb-24 pt-14">
      <div className="px-5 space-y-5">
        <h1 className="font-display text-2xl font-bold text-foreground">Saved</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-matcha-light flex items-center justify-center mb-4">
            <Heart className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-display text-lg font-semibold text-foreground">No saved cafes yet</h2>
          <p className="text-sm text-muted-foreground font-body mt-2 max-w-[250px]">
            Tap the heart icon on any cafe to save it for later.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Saved;
