import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground">
          Dashboard Techadores
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Gérez vos leads de techado en temps réel avec des analyses et filtres avancés
        </p>
        <Button
          size="lg"
          onClick={() => navigate("/auth")}
          className="gap-2"
        >
          Accéder au Dashboard
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
