import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Phone } from "lucide-react";
import { Lead } from "@/pages/Dashboard";

interface KPICardsProps {
  leads: Lead[];
  hotLeads: Lead[];
}

export const KPICards = ({ leads, hotLeads }: KPICardsProps) => {
  const appelLeads = leads.filter(l => l.clique === "oui" || l.ouvert === "oui");
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leads.length}</div>
          <p className="text-xs text-muted-foreground">Tous les contacts</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leads Chauds</CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{hotLeads.length}</div>
          <p className="text-xs text-muted-foreground">Prêts à être contactés</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">À Appeler</CardTitle>
          <Phone className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{appelLeads.length}</div>
          <p className="text-xs text-muted-foreground">Contacts engagés (cliqué/ouvert)</p>
        </CardContent>
      </Card>
    </div>
  );
};
