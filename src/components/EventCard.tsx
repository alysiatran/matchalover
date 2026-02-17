import { Calendar, MapPin, Clock, Tag, ExternalLink } from "lucide-react";
import type { MatchaEvent } from "@/hooks/useEvents";

interface EventCardProps {
  event: MatchaEvent;
  index: number;
}

const EventCard = ({ event, index }: EventCardProps) => {
  const formattedDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "TBD";

  return (
    <div
      className="animate-fade-up rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {event.image_url && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-foreground leading-tight">
            {event.title}
          </h3>
          {event.price && (
            <span className="shrink-0 text-xs font-body font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              {event.price}
            </span>
          )}
        </div>

        {event.description && (
          <p className="text-sm font-body text-muted-foreground leading-relaxed line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-body">{formattedDate}</span>
            {event.event_time && (
              <>
                <Clock className="w-3.5 h-3.5 shrink-0 ml-2" />
                <span className="text-xs font-body">{event.event_time}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-body">
              {event.cafe_name || event.venue}
              {event.address && ` · ${event.address}`}
            </span>
          </div>
        </div>

        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-body font-medium bg-matcha-light text-accent-foreground px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-body font-medium text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            View Details
          </a>
        )}
      </div>
    </div>
  );
};

export default EventCard;
