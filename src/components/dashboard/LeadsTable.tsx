import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Lead } from "@/pages/Dashboard";
import { Loader2, Trash2 } from "lucide-react";

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
  userRole: string | null;
  onDelete: (leadId: string) => void;
}

export const LeadsTable = ({ leads, loading, userRole, onDelete }: LeadsTableProps) => {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      nouveau: "default",
      répondu: "secondary",
      chaud: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Surface (m²)</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ouvert</TableHead>
                <TableHead>Cliqué</TableHead>
                <TableHead>Devis</TableHead>
                <TableHead>Chaud</TableHead>
                {userRole === 'admin' && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={userRole === 'admin' ? 13 : 12} className="text-center text-muted-foreground">
                    Aucun lead trouvé
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.nom}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.telephone}</TableCell>
                    <TableCell>{lead.type_travaux}</TableCell>
                    <TableCell>{lead.surface}</TableCell>
                    <TableCell>{lead.localisation}</TableCell>
                    <TableCell>{format(new Date(lead.timestamp), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>
                      <Badge variant={lead.ouvert === "oui" ? "default" : "outline"}>
                        {lead.ouvert}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lead.clique === "oui" ? "default" : "outline"}>
                        {lead.clique}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lead.devis_estimatif ? "default" : "outline"}>
                        {lead.devis_estimatif || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lead.lead_chaud === "oui" ? "destructive" : "outline"}>
                        {lead.lead_chaud}
                      </Badge>
                    </TableCell>
                    {userRole === 'admin' && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(lead.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
