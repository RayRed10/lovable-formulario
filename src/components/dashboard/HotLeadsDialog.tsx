import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Copy } from "lucide-react";
import { Lead } from "@/pages/Dashboard";
import { toast } from "sonner";

interface HotLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotLeads: Lead[];
}

export const HotLeadsDialog = ({ open, onOpenChange, hotLeads }: HotLeadsDialogProps) => {
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copié dans le presse-papiers`);
  };

  const copyAllPhones = () => {
    const phones = hotLeads.map(lead => `${lead.nom}: ${lead.telephone}`).join("\n");
    navigator.clipboard.writeText(phones);
    toast.success("Tous les téléphones copiés");
  };

  const copyAllEmails = () => {
    const emails = hotLeads.map(lead => lead.email).join(", ");
    navigator.clipboard.writeText(emails);
    toast.success("Tous les emails copiés");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Leads Chauds à Appeler ({hotLeads.length})</DialogTitle>
          <DialogDescription>
            Liste des contacts chauds prêts à être contactés
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" onClick={copyAllPhones} className="gap-2">
            <Phone className="h-4 w-4" />
            Copier tous les téléphones
          </Button>
          <Button variant="outline" onClick={copyAllEmails} className="gap-2">
            <Mail className="h-4 w-4" />
            Copier tous les emails
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hotLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Aucun lead chaud disponible
                </TableCell>
              </TableRow>
            ) : (
              hotLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.nom}</TableCell>
                  <TableCell>{lead.telephone}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.type_travaux}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(lead.telephone, "Téléphone")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(lead.email, "Email")}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};
