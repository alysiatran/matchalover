import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  LogOut,
  Store,
  Clock,
  Leaf,
  Plus,
  Trash2,
  CalendarPlus,
  Loader2,
} from "lucide-react";
import type { Cafe } from "@/data/cafes";

interface OwnedCafe {
  cafe_id: string;
  approved: boolean;
  cafes: any;
}

const Dashboard = () => {
  const { user, profile, loading, signOut, ownedCafes } = useAuth();
  const navigate = useNavigate();
  const [cafes, setCafes] = useState<any[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [claimCafeId, setClaimCafeId] = useState("");
  const [allCafes, setAllCafes] = useState<{ id: string; name: string }[]>([]);

  // Event creation state
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    venue: "",
    address: "",
    event_date: "",
    event_time: "",
    price: "",
    tags: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (ownedCafes.length > 0) {
      loadOwnedCafes();
    }
    loadAllCafes();
  }, [ownedCafes]);

  useEffect(() => {
    if (cafes.length > 0 && !selectedCafe) {
      setSelectedCafe(cafes[0]);
    }
  }, [cafes]);

  async function loadOwnedCafes() {
    const approvedIds = ownedCafes.filter((o) => o.approved).map((o) => o.cafe_id);
    if (approvedIds.length === 0) return;

    const { data } = await supabase
      .from("cafes")
      .select("*")
      .in("id", approvedIds);

    if (data) setCafes(data);
  }

  async function loadAllCafes() {
    const { data } = await supabase.from("cafes").select("id, name").order("name");
    if (data) setAllCafes(data);
  }

  async function handleClaimCafe() {
    if (!claimCafeId || !user) return;
    const { error } = await supabase.from("cafe_owners").insert({
      user_id: user.id,
      cafe_id: claimCafeId,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Claim submitted! We'll review and approve it shortly.");
      setClaimCafeId("");
    }
  }

  async function handleSaveCafe() {
    if (!selectedCafe) return;
    setSaving(true);

    const { error } = await supabase
      .from("cafes")
      .update({
        description: selectedCafe.description,
        hours: selectedCafe.hours,
        price_range: selectedCafe.price_range,
        matcha_origin: selectedCafe.matcha_origin,
        matcha_grade: selectedCafe.matcha_grade,
        matcha_flavor_notes: selectedCafe.matcha_flavor_notes,
        matcha_body: selectedCafe.matcha_body,
        matcha_finish: selectedCafe.matcha_finish,
        matcha_grams: selectedCafe.matcha_grams,
        menu: selectedCafe.menu,
        photo_url: selectedCafe.photo_url,
      })
      .eq("id", selectedCafe.id);

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Cafe updated!");
    }
    setSaving(false);
  }

  async function handleCreateEvent() {
    if (!selectedCafe) return;
    setSaving(true);

    const { error } = await supabase.from("matcha_events").insert({
      title: eventData.title,
      description: eventData.description,
      venue: eventData.venue || selectedCafe.name,
      address: eventData.address || selectedCafe.address,
      cafe_name: selectedCafe.name,
      event_date: eventData.event_date || null,
      event_time: eventData.event_time || null,
      price: eventData.price || null,
      tags: eventData.tags ? eventData.tags.split(",").map((t: string) => t.trim()) : [],
    });

    if (error) {
      toast.error("Failed to create event: " + error.message);
    } else {
      toast.success("Event created!");
      setShowEventForm(false);
      setEventData({ title: "", description: "", venue: "", address: "", event_date: "", event_time: "", price: "", tags: "" });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const pendingClaims = ownedCafes.filter((o) => !o.approved);
  const approvedCafes = ownedCafes.filter((o) => o.approved);

  return (
    <div className="min-h-screen bg-background pb-24 pt-14">
      <div className="px-5 space-y-6 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={signOut} className="text-muted-foreground text-sm font-body flex items-center gap-1">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>

        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Business Dashboard</h1>
          <p className="text-sm text-muted-foreground font-body">
            Welcome, {profile?.display_name || "Business Owner"}
          </p>
        </div>

        {/* Pending claims */}
        {pendingClaims.length > 0 && (
          <div className="bg-warm rounded-2xl p-4 border border-border">
            <p className="text-sm font-body text-muted-foreground">
              <Clock className="w-4 h-4 inline mr-1" />
              {pendingClaims.length} claim(s) pending approval
            </p>
          </div>
        )}

        {/* Claim a cafe */}
        {approvedCafes.length === 0 && (
          <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" /> Claim Your Cafe
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              Select your cafe to request ownership. We'll verify and approve your claim.
            </p>
            <select
              value={claimCafeId}
              onChange={(e) => setClaimCafeId(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-body"
            >
              <option value="">Select a cafe…</option>
              {allCafes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <Button onClick={handleClaimCafe} disabled={!claimCafeId} className="w-full rounded-xl font-body">
              Submit Claim
            </Button>
          </div>
        )}

        {/* Cafe selector */}
        {cafes.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {cafes.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelectedCafe(c); setShowEventForm(false); }}
                className={`px-4 py-2 rounded-full text-sm font-body whitespace-nowrap border transition-colors ${
                  selectedCafe?.id === c.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-foreground"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Auto-select first cafe */}
        {/* Auto-select handled by effect below */}

        {/* Edit cafe form */}
        {selectedCafe && !showEventForm && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" /> Edit {selectedCafe.name}
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-body text-sm">Description</Label>
                <Textarea
                  value={selectedCafe.description || ""}
                  onChange={(e) => setSelectedCafe({ ...selectedCafe, description: e.target.value })}
                  className="rounded-xl font-body text-sm"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-body text-sm">Hours</Label>
                <Input
                  value={selectedCafe.hours || ""}
                  onChange={(e) => setSelectedCafe({ ...selectedCafe, hours: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-body text-sm">Price Range</Label>
                <Input
                  value={selectedCafe.price_range || ""}
                  onChange={(e) => setSelectedCafe({ ...selectedCafe, price_range: e.target.value })}
                  placeholder="$ or $$ or $$$"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-body text-sm">Photo URL</Label>
                <Input
                  value={selectedCafe.photo_url || ""}
                  onChange={(e) => setSelectedCafe({ ...selectedCafe, photo_url: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              {/* Matcha Profile */}
              <div className="bg-matcha-light rounded-2xl p-4 space-y-3">
                <h3 className="font-display text-sm font-semibold text-accent-foreground">Matcha Profile</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="font-body text-xs">Origin</Label>
                    <Input
                      value={selectedCafe.matcha_origin || ""}
                      onChange={(e) => setSelectedCafe({ ...selectedCafe, matcha_origin: e.target.value })}
                      className="rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-body text-xs">Grade</Label>
                    <Input
                      value={selectedCafe.matcha_grade || ""}
                      onChange={(e) => setSelectedCafe({ ...selectedCafe, matcha_grade: e.target.value })}
                      className="rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-body text-xs">Body</Label>
                    <Input
                      value={selectedCafe.matcha_body || ""}
                      onChange={(e) => setSelectedCafe({ ...selectedCafe, matcha_body: e.target.value })}
                      className="rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-body text-xs">Finish</Label>
                    <Input
                      value={selectedCafe.matcha_finish || ""}
                      onChange={(e) => setSelectedCafe({ ...selectedCafe, matcha_finish: e.target.value })}
                      className="rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-body text-xs">Grams/Serving</Label>
                    <Input
                      value={selectedCafe.matcha_grams || ""}
                      onChange={(e) => setSelectedCafe({ ...selectedCafe, matcha_grams: e.target.value })}
                      className="rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Menu Editor */}
              <div className="space-y-3">
                <h3 className="font-display text-sm font-semibold text-foreground">Menu</h3>
                {(selectedCafe.menu || []).map((category: any, ci: number) => (
                  <div key={ci} className="bg-card rounded-xl p-3 border border-border space-y-2">
                    <Input
                      value={category.category}
                      onChange={(e) => {
                        const menu = [...selectedCafe.menu];
                        menu[ci] = { ...menu[ci], category: e.target.value };
                        setSelectedCafe({ ...selectedCafe, menu });
                      }}
                      className="rounded-lg text-sm font-semibold"
                      placeholder="Category name"
                    />
                    {(category.items || []).map((item: any, ii: number) => (
                      <div key={ii} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-1">
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const menu = [...selectedCafe.menu];
                              menu[ci].items[ii] = { ...menu[ci].items[ii], name: e.target.value };
                              setSelectedCafe({ ...selectedCafe, menu });
                            }}
                            className="rounded-lg text-xs"
                            placeholder="Item name"
                          />
                          <div className="flex gap-2">
                            <Input
                              value={item.price}
                              onChange={(e) => {
                                const menu = [...selectedCafe.menu];
                                menu[ci].items[ii] = { ...menu[ci].items[ii], price: e.target.value };
                                setSelectedCafe({ ...selectedCafe, menu });
                              }}
                              className="rounded-lg text-xs w-20"
                              placeholder="$5"
                            />
                            <Input
                              value={item.description || ""}
                              onChange={(e) => {
                                const menu = [...selectedCafe.menu];
                                menu[ci].items[ii] = { ...menu[ci].items[ii], description: e.target.value };
                                setSelectedCafe({ ...selectedCafe, menu });
                              }}
                              className="rounded-lg text-xs flex-1"
                              placeholder="Description"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const menu = [...selectedCafe.menu];
                            menu[ci].items = menu[ci].items.filter((_: any, i: number) => i !== ii);
                            setSelectedCafe({ ...selectedCafe, menu });
                          }}
                          className="text-destructive mt-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const menu = [...selectedCafe.menu];
                        menu[ci].items = [...(menu[ci].items || []), { name: "", price: "", description: "" }];
                        setSelectedCafe({ ...selectedCafe, menu });
                      }}
                      className="text-xs text-primary font-body flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add item
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const menu = [...(selectedCafe.menu || []), { category: "", items: [] }];
                    setSelectedCafe({ ...selectedCafe, menu });
                  }}
                  className="text-sm text-primary font-body flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add category
                </button>
              </div>

              <Button onClick={handleSaveCafe} disabled={saving} className="w-full rounded-xl font-body">
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowEventForm(true)}
              className="w-full rounded-xl font-body"
            >
              <CalendarPlus className="w-4 h-4 mr-2" /> Create Community Event
            </Button>
          </div>
        )}

        {/* Event creation form */}
        {selectedCafe && showEventForm && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">New Event</h2>
              <button onClick={() => setShowEventForm(false)} className="text-sm text-muted-foreground font-body">
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="font-body text-sm">Event Title *</Label>
                <Input
                  value={eventData.title}
                  onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                  placeholder="Matcha Tasting Night"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="font-body text-sm">Description</Label>
                <Textarea
                  value={eventData.description}
                  onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                  placeholder="Join us for an evening of curated matcha tastings…"
                  className="rounded-xl font-body text-sm"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="font-body text-sm">Date</Label>
                  <Input
                    type="date"
                    value={eventData.event_date}
                    onChange={(e) => setEventData({ ...eventData, event_date: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-body text-sm">Time</Label>
                  <Input
                    value={eventData.event_time}
                    onChange={(e) => setEventData({ ...eventData, event_time: e.target.value })}
                    placeholder="6:00 PM"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="font-body text-sm">Venue</Label>
                <Input
                  value={eventData.venue}
                  onChange={(e) => setEventData({ ...eventData, venue: e.target.value })}
                  placeholder={selectedCafe.name}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="font-body text-sm">Price</Label>
                  <Input
                    value={eventData.price}
                    onChange={(e) => setEventData({ ...eventData, price: e.target.value })}
                    placeholder="Free / $15"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-body text-sm">Tags</Label>
                  <Input
                    value={eventData.tags}
                    onChange={(e) => setEventData({ ...eventData, tags: e.target.value })}
                    placeholder="Tasting, Workshop"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <Button
                onClick={handleCreateEvent}
                disabled={saving || !eventData.title}
                className="w-full rounded-xl font-body"
              >
                {saving ? "Creating…" : "Create Event"}
              </Button>
            </div>
          </div>
        )}

        {/* No approved cafes message */}
        {approvedCafes.length === 0 && cafes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground font-body text-sm">
              Once your cafe claim is approved, you'll be able to edit your page and create events here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
