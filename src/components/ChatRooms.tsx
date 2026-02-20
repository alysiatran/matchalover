import { useState, useRef, useEffect } from "react";
import { Hash, ArrowLeft, Send, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChatRooms, useChatMessages, sendChatMessage, type ChatRoom } from "@/hooks/useChat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

const ChatRooms = () => {
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);

  if (activeRoom) {
    return <ChatThread room={activeRoom} onBack={() => setActiveRoom(null)} />;
  }

  return <RoomList onSelect={setActiveRoom} />;
};

const RoomList = ({ onSelect }: { onSelect: (room: ChatRoom) => void }) => {
  const { data: rooms = [], isLoading } = useChatRooms();

  if (isLoading) {
    return <p className="text-center text-muted-foreground font-body py-12">Loading channels…</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-body text-muted-foreground uppercase tracking-wide px-1">
        Chat Channels
      </p>
      {rooms.map((room, i) => (
        <button
          key={room.id}
          onClick={() => onSelect(room)}
          className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left hover:shadow-sm transition-shadow animate-fade-up"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Hash className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-sm font-semibold text-foreground">{room.name}</h3>
            {room.description && (
              <p className="text-xs font-body text-muted-foreground truncate">{room.description}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

const ChatThread = ({ room, onBack }: { room: ChatRoom; onBack: () => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: messages = [], isLoading } = useChatMessages(room.id);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    try {
      await sendChatMessage(room.id, user.id, text.trim());
      setText("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const timeStr = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-[60vh]">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Hash className="w-4 h-4 text-primary" />
        <span className="font-display text-sm font-semibold text-foreground">{room.name}</span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-3">
        {isLoading && (
          <p className="text-center text-xs font-body text-muted-foreground py-8">Loading…</p>
        )}
        {!isLoading && messages.length === 0 && (
          <p className="text-center text-xs font-body text-muted-foreground py-8">
            No messages yet. Start the conversation! 💚
          </p>
        )}
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-2 px-1">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-body font-semibold text-foreground">
                    {msg.author_name}
                  </span>
                  <span className="text-[10px] font-body text-muted-foreground">
                    {timeStr(msg.created_at)}
                  </span>
                </div>
                <p className="text-sm font-body text-foreground/90 whitespace-pre-line break-words">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-border">
        <Input
          placeholder={user ? `Message #${room.name.toLowerCase()}` : "Sign in to chat"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          className="text-sm font-body"
          disabled={!user}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          onFocus={() => {
            if (!user) navigate("/auth");
          }}
        />
        <Button
          size="sm"
          className="h-10 px-3 shrink-0"
          disabled={!text.trim() || sending}
          onClick={handleSend}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatRooms;
