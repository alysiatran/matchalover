import { useState, useRef } from "react";
import { Star, Camera, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

function StarRating({ value, onChange, readonly = false, size = 5 }: { value: number; onChange?: (v: number) => void; readonly?: boolean; size?: number }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`${readonly ? "cursor-default" : "cursor-pointer"}`}
        >
          <Star
            className={`transition-colors ${size === 4 ? "w-4 h-4" : "w-5 h-5"} ${
              star <= (hover || value) ? "text-primary fill-primary" : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function CafeReviews({ cafeId }: { cafeId: string }) {
  const { user } = useAuth();
  const { reviews, isLoading, userReview, submitReview, deleteReview } = useReviews(cafeId);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const startEdit = () => {
    if (userReview) {
      setRating(userReview.rating);
      setContent(userReview.content || "");
      setIsEditing(true);
    }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4 - photos.length);
    setPhotos((p) => [...p, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setPreviews((p) => [...p, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((p) => p.filter((_, i) => i !== index));
    setPreviews((p) => p.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    try {
      await submitReview.mutateAsync({ rating, content, photos });
      toast.success(userReview ? "Review updated!" : "Review posted!");
      setRating(0);
      setContent("");
      setPhotos([]);
      setPreviews([]);
      setIsEditing(false);
    } catch {
      toast.error("Failed to submit review");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReview.mutateAsync();
      toast.success("Review deleted");
      setIsEditing(false);
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const showForm = user && (!userReview || isEditing);

  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <Star className="w-5 h-5 text-primary" />
        Reviews
        {avgRating && (
          <span className="text-sm font-body font-normal text-muted-foreground">
            ({avgRating} avg · {reviews.length})
          </span>
        )}
      </h2>

      {/* Submit / Edit form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-4 mb-4 space-y-3">
          <p className="text-sm font-body font-medium text-foreground">
            {userReview ? "Edit your review" : "Share your experience"}
          </p>
          <StarRating value={rating} onChange={setRating} />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How was the matcha?"
            className="text-sm font-body min-h-[60px] resize-none"
            maxLength={500}
          />
          <div className="flex items-center gap-2 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative w-16 h-16">
                <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            {photos.length < 4 && (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Camera className="w-5 h-5" />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={submitReview.isPending} className="gap-1.5">
              <Send className="w-3.5 h-3.5" />
              {submitReview.isPending ? "Posting..." : userReview ? "Update" : "Post"}
            </Button>
            {isEditing && (
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {/* User's existing review prompt */}
      {user && userReview && !isEditing && (
        <div className="bg-primary/5 rounded-xl border border-primary/20 p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StarRating value={userReview.rating} readonly size={4} />
            <span className="text-xs font-body text-muted-foreground">Your review</span>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={startEdit}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={handleDelete} disabled={deleteReview.isPending}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {!user && (
        <p className="text-sm font-body text-muted-foreground mb-4">Sign in to leave a review.</p>
      )}

      {/* Review list */}
      {isLoading ? (
        <p className="text-sm font-body text-muted-foreground">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm font-body text-muted-foreground">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card rounded-xl border border-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-body font-medium text-foreground">{review.display_name}</span>
                  <StarRating value={review.rating} readonly size={4} />
                </div>
                <span className="text-xs font-body text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>
              {review.content && (
                <p className="text-sm font-body text-muted-foreground leading-relaxed">{review.content}</p>
              )}
              {review.photos.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {review.photos.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
