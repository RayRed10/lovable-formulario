import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Phone } from "lucide-react";
import { toast } from "sonner";
import { KPICards } from "@/components/dashboard/KPICards";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { LeadsCharts } from "@/components/dashboard/LeadsCharts";
import { LeadsFilters } from "@/components/dashboard/LeadsFilters";
import { HotLeadsDialog } from "@/components/dashboard/HotLeadsDialog";

export interface Lead {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  type_travaux: string;
  surface: number;
  localisation: string;
  timestamp: string;
  status: string;
  ouvert: string;
  clique: string;
  devis_estimatif: string | null;
  lead_chaud: string;
  assigned_to: string | null;
}

const Dashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [showHotLeads, setShowHotLeads] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Check for existing session FIRST
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.email);
        
        if (!mounted) return;
        
        setSession(session);
        
        if (!session) {
          setAuthLoading(false);
          setInitialCheckDone(true);
          navigate("/auth");
          return;
        }
        
        // Fetch user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        if (!mounted) return;
        
        setUserRole(roleData?.role || null);
        setAuthLoading(false);
        setInitialCheckDone(true);
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (!mounted) return;
        setAuthLoading(false);
        setInitialCheckDone(true);
        navigate("/auth");
      }
    };

    // Set up auth state listener for changes AFTER initial check
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (!mounted || !initialCheckDone) return;
      
      setSession(session);
      
      if (!session) {
        setUserRole(null);
        navigate("/auth");
        return;
      }
      
      // Fetch user role when session changes
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      if (!mounted) return;
      
      setUserRole(roleData?.role || null);
    });

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    // Only fetch leads and setup realtime if we have a session
    if (!session || authLoading) {
      return;
    }

    fetchLeads();

    // Realtime subscription - only when authenticated
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        () => {
          console.log('Realtime update received');
          fetchLeads();
        }
      )
      .subscribe();

    // Auto refresh every 5 minutes
    const interval = setInterval(() => {
      fetchLeads();
    }, 5 * 60 * 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [session, authLoading]);

  useEffect(() => {
    applyFilters();
  }, [leads, statusFilter, dateFilter]);

  const fetchLeads = async () => {
    if (!session) {
      console.log('No session available, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching leads for user:', session.user.email);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Leads fetched:', data?.length);
      setLeads(data || []);
      toast.success(`${data?.length || 0} leads chargés`);
    } catch (error: any) {
      toast.error("Erreur de chargement des leads: " + error.message);
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leads];

    if (statusFilter !== "all") {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter).toISOString().split('T')[0];
      filtered = filtered.filter(lead => {
        const leadDate = new Date(lead.timestamp).toISOString().split('T')[0];
        return leadDate === filterDate;
      });
    }

    setFilteredLeads(filtered);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUserRole(null);
      setLeads([]);
      toast.success("Déconnexion réussie");
      navigate("/auth");
    } catch (error: any) {
      toast.error("Erreur lors de la déconnexion: " + error.message);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce lead?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
      
      toast.success("Lead supprimé avec succès");
      fetchLeads();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression: " + error.message);
    }
  };

  const hotLeads = leads.filter(lead => lead.lead_chaud === "oui");

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Dashboard Techadores</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchLeads}
              className="gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Manuel
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowHotLeads(true)}
              className="gap-2"
            >
              <Phone className="h-4 w-4" />
              Appeler Chauds ({hotLeads.length})
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <KPICards leads={leads} hotLeads={hotLeads} />
        
        <LeadsFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />

        <LeadsCharts leads={leads} />

        <LeadsTable 
          leads={filteredLeads} 
          loading={loading} 
          userRole={userRole}
          onDelete={handleDeleteLead}
        />
      </main>

      <HotLeadsDialog
        open={showHotLeads}
        onOpenChange={setShowHotLeads}
        hotLeads={hotLeads}
      />
    </div>
  );
};

export default Dashboard;
