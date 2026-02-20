import { Clock, Users, ExternalLink } from "lucide-react";

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  servings: string;
  difficulty: "Easy" | "Medium" | "Hard";
  ingredients: string[];
  steps: string[];
  tags: string[];
  videoUrl?: string;
  imageUrl?: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
}

const RecipeCard = ({ recipe, index }: RecipeCardProps) => {
  // Convert YouTube shorts URL to embed URL
  const getEmbedUrl = (url: string) => {
    const shortsMatch = url.match(/shorts\/([a-zA-Z0-9_-]+)/);
    const watchMatch = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    const videoId = shortsMatch?.[1] || watchMatch?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = recipe.videoUrl ? getEmbedUrl(recipe.videoUrl) : null;

  return (
    <div
      className="animate-fade-up rounded-2xl overflow-hidden bg-card border border-border shadow-sm"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {embedUrl && (
        <div className="relative aspect-[9/16] max-h-[360px] overflow-hidden bg-black">
          <iframe
            src={embedUrl}
            title={recipe.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-foreground leading-tight">
            {recipe.title}
          </h3>
          <span className="shrink-0 text-xs font-body font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
            {recipe.difficulty}
          </span>
        </div>

        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          {recipe.description}
        </p>

        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-body">{recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-body">{recipe.servings}</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-display font-semibold text-foreground mb-1.5">Ingredients</h4>
          <ul className="space-y-1">
            {recipe.ingredients.map((item, i) => (
              <li key={i} className="text-xs font-body text-muted-foreground flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-display font-semibold text-foreground mb-1.5">Steps</h4>
          <ol className="space-y-1.5">
            {recipe.steps.map((step, i) => (
              <li key={i} className="text-xs font-body text-muted-foreground flex items-start gap-2">
                <span className="font-semibold text-primary shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-body font-medium bg-matcha-light text-accent-foreground px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {recipe.videoUrl && (
          <a
            href={recipe.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-body font-medium text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Watch on YouTube
          </a>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
