import { useState } from "react";
import { Heart, MessageCircle, Plus, Send, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useCommunityPosts,
  useCreatePost,
  useToggleLike,
  usePostComments,
  useCreateComment,
} from "@/hooks/useCommunity";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const CommunityFeed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: posts = [], isLoading } = useCommunityPosts();
  const createPost = useCreatePost();
  const toggleLike = useToggleLike();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    await createPost.mutateAsync({ title: title.trim(), content: content.trim() });
    setTitle("");
    setContent("");
    setShowForm(false);
  };

  const handleLike = (postId: string, liked: boolean) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    toggleLike.mutate({ postId, liked });
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (isLoading) {
    return <p className="text-center text-muted-foreground font-body py-12">Loading community…</p>;
  }

  return (
    <div className="space-y-4">
      {/* New post button / form */}
      {!showForm ? (
        <button
          onClick={() => {
            if (!user) {
              navigate("/auth");
              return;
            }
            setShowForm(true);
          }}
          className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left hover:shadow-sm transition-shadow"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-body text-muted-foreground">
            Share something with the matcha community…
          </span>
        </button>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3 animate-fade-up">
          <Input
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="font-body"
          />
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            rows={3}
            className="font-body resize-none"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setTitle("");
                setContent("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || createPost.isPending}
            >
              {createPost.isPending ? "Posting…" : "Post"}
            </Button>
          </div>
        </div>
      )}

      {/* Posts feed */}
      {posts.length === 0 && (
        <p className="text-center text-muted-foreground font-body py-12">
          No posts yet. Be the first to share! 💚
        </p>
      )}

      {posts.map((post, i) => (
        <div
          key={post.id}
          className="animate-fade-up rounded-2xl border border-border bg-card overflow-hidden"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-body font-semibold text-foreground">
                {post.author_name}
              </span>
              <span className="text-xs font-body text-muted-foreground">
                {timeAgo(post.created_at)}
              </span>
            </div>

            <h3 className="font-display text-base font-semibold text-foreground leading-tight">
              {post.title}
            </h3>
            <p className="text-sm font-body text-muted-foreground leading-relaxed whitespace-pre-line">
              {post.content}
            </p>

            <div className="flex items-center gap-4 pt-1">
              <button
                onClick={() => handleLike(post.id, !!post.liked_by_me)}
                className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-primary transition-colors"
              >
                <Heart
                  className={`w-4 h-4 ${post.liked_by_me ? "fill-primary text-primary" : ""}`}
                />
                {post.likes_count > 0 && post.likes_count}
              </button>
              <button
                onClick={() =>
                  setExpandedPost(expandedPost === post.id ? null : post.id)
                }
                className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {post.comments_count > 0 && post.comments_count}
              </button>
            </div>
          </div>

          {expandedPost === post.id && (
            <CommentsSection postId={post.id} />
          )}
        </div>
      ))}
    </div>
  );
};

const CommentsSection = ({ postId }: { postId: string }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: comments = [], isLoading } = usePostComments(postId);
  const createComment = useCreateComment();
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await createComment.mutateAsync({ postId, content: text.trim() });
    setText("");
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="border-t border-border bg-muted/30 p-4 space-y-3">
      {isLoading && (
        <p className="text-xs font-body text-muted-foreground">Loading comments…</p>
      )}

      {comments.map((c) => (
        <div key={c.id} className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <User className="w-3 h-3 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-body font-semibold text-foreground">
                {c.author_name}
              </span>
              <span className="text-[10px] font-body text-muted-foreground">
                {timeAgo(c.created_at)}
              </span>
            </div>
            <p className="text-xs font-body text-muted-foreground">{c.content}</p>
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <Input
          placeholder={user ? "Add a comment…" : "Sign in to comment"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          className="text-xs font-body h-8"
          disabled={!user}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          onFocus={() => {
            if (!user) navigate("/auth");
          }}
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 shrink-0"
          disabled={!text.trim() || createComment.isPending}
          onClick={handleSubmit}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default CommunityFeed;
