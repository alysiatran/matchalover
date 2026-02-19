import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Claim {
  id: string;
  user_id: string;
  cafe_id: string;
  approved: boolean;
  created_at: string;
  cafe_name?: string;
  user_email?: string;
  user_display_name?: string;
}

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  async function checkAdminRole() {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user!.id)
      .eq("role", "admin");

    const admin = !!(data && data.length > 0);
    setIsAdmin(admin);
    setCheckingRole(false);

    if (admin) {
      loadClaims();
    }
  }

  async function loadClaims() {
    setLoadingClaims(true);

    const { data: claimsData } = await supabase
      .from("cafe_owners")
      .select("*")
      .order("created_at", { ascending: false });

    if (!claimsData) {
      setLoadingClaims(false);
      return;
    }

    // Fetch cafe names and user profiles
    const cafeIds = [...new Set(claimsData.map((c) => c.cafe_id))];
    const userIds = [...new Set(claimsData.map((c) => c.user_id))];

    const [cafesRes, profilesRes] = await Promise.all([
      supabase.from("cafes").select("id, name").in("id", cafeIds),
      supabase.from("profiles").select("user_id, email, display_name").in("user_id", userIds),
    ]);

    const cafeMap = new Map((cafesRes.data || []).map((c) => [c.id, c.name]));
    const profileMap = new Map(
      (profilesRes.data || []).map((p) => [p.user_id, p])
    );

    const enriched: Claim[] = claimsData.map((c) => ({
      ...c,
      cafe_name: cafeMap.get(c.cafe_id) || "Unknown",
      user_email: profileMap.get(c.user_id)?.email || "",
      user_display_name: profileMap.get(c.user_id)?.display_name || "",
    }));

    setClaims(enriched);
    setLoadingClaims(false);
  }

  async function handleApprove(claim: Claim) {
    const { error } = await supabase
      .from("cafe_owners")
      .update({ approved: true })
      .eq("id", claim.id);

    if (error) {
      toast.error("Failed to approve: " + error.message);
    } else {
      toast.success(`Approved ${claim.user_display_name || claim.user_email} for ${claim.cafe_name}`);
      setClaims((prev) =>
        prev.map((c) => (c.id === claim.id ? { ...c, approved: true } : c))
      );
    }
  }

  async function handleReject(claim: Claim) {
    const { error } = await supabase
      .from("cafe_owners")
      .delete()
      .eq("id", claim.id);

    if (error) {
      toast.error("Failed to reject: " + error.message);
    } else {
      toast.success(`Rejected claim from ${claim.user_display_name || claim.user_email}`);
      setClaims((prev) => prev.filter((c) => c.id !== claim.id));
    }
  }

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="text-center space-y-3">
          <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="font-display text-xl font-bold text-foreground">Access Denied</h1>
          <p className="text-sm text-muted-foreground font-body">
            You need admin privileges to access this page.
          </p>
          <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl font-body">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const pending = claims.filter((c) => !c.approved);
  const approved = claims.filter((c) => c.approved);

  return (
    <div className="min-h-screen bg-background pb-24 pt-14">
      <div className="px-5 space-y-6 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground font-body">
              Manage business owner claims
            </p>
          </div>
        </div>

        {/* Pending Claims */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Pending Claims
            {pending.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pending.length}</Badge>
            )}
          </h2>

          {loadingClaims ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : pending.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body py-4">No pending claims.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-card rounded-2xl p-4 border border-border space-y-3"
                >
                  <div>
                    <p className="font-display text-sm font-semibold text-foreground">
                      {claim.cafe_name}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      {claim.user_display_name || "Unknown"} · {claim.user_email}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(claim)}
                      className="rounded-xl font-body flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(claim)}
                      className="rounded-xl font-body flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Owners */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Approved Owners
          </h2>

          {approved.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body py-4">No approved owners yet.</p>
          ) : (
            <div className="rounded-2xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-body text-xs">Cafe</TableHead>
                    <TableHead className="font-body text-xs">Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approved.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-body text-sm">{claim.cafe_name}</TableCell>
                      <TableCell className="font-body text-sm">
                        {claim.user_display_name || claim.user_email}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
